// ============================================================
// src/comprehension-neuron/adaptadorPipeline.ts
// El puente técnico de la Parte 6. No existía ninguna función que
// hiciera esto en el proyecto — por eso es el único archivo nuevo
// que hace falta crear, según la Sección 23 del documento de la
// Parte 6 ("si necesita crear uno, debe explicar por qué, indicar
// ruta exacta, no duplicar lógica existente").
//
// Tres responsabilidades, ninguna se solapa con nada que ya
// exista:
//
// 1. construirEntradasProcesamiento() — de los hallazgos crudos de
//    ramMateriales/ramPropiedades/ramValores (ANTES de
//    consolidarBloque(), tal como exige la Sección 6) arma un
//    EntradaProcesamiento por cada propiedad encontrada en el
//    bloque, con toda la información posicional intacta.
//
// 2. hipotesisAceptadaAPropiedadExtraida() — convierte una
//    Hipotesis en estado ACEPTADO (+ los objetos ya resueltos que
//    ahora devuelve neuronaComprension.ts) en un PropiedadExtraida,
//    el tipo que ya usa guardarLotePropiedadesTurso(). Todo campo
//    que no se pueda demostrar con datos reales queda null — nunca
//    inventado (Sección 14).
//
// 3. hipotesisPendienteAContexto() — lo mismo para PENDIENTE, hacia
//    HipotesisConContexto (lo que espera guardarLotePendientes()).
// ============================================================

import { BloqueMaterial } from '../extraction-neurons/comprension/gestorBloques';
import { MemoriaTemporalDocumento } from '../extraction-neurons/comprension/tipos';
import { HallazgoRAM } from '../extraction-neurons/memoria/tipos';
import { DatoPropiedad, DatoValor } from '../extraction-neurons/eventos/tipos';
import { MaterialResuelto } from '../extraction-neurons/memoria/ramMateriales';
import { PropiedadExtraida } from '../extraction-neurons/base/tipos';

import { detectarTablaEnBloque } from './mapa/tablas';
import { EntradaProcesamiento, ResultadoProcesamiento } from './neuronaComprension';
import { CandidatoValor } from './razonamiento/asociarValor';
import { Material } from './tipos/entidades';
import { Hipotesis } from './tipos/hipotesis';
import { HipotesisConContexto } from '../turso/guardarPendientesRevision';

// ── 1. RAM → EntradaProcesamiento[] ────────────────────────────────

export interface ParametrosConstruccionEntradas {
  documentoId: string;
  textoCompleto: string;
  bloque: BloqueMaterial;
  memoria: MemoriaTemporalDocumento;
  materialResuelto: MaterialResuelto | null;
  hallazgosPropiedades: HallazgoRAM<DatoPropiedad>[];
  hallazgosValores: HallazgoRAM<DatoValor>[];
  catalogoMateriales: Material[];
  offsetsPorPagina: number[];
}

// ── Elige, para una propiedad en una posición dada, la unidad del
//    HALLAZGO DE VALOR MÁS CERCANO — cada HallazgoRAM<DatoValor> ya
//    trae su propia unidad (la detectó ramValores.ts, no se
//    inventa nada acá). Mismo criterio de cercanía que ya usa
//    asociarValor() para elegir el valor; acá se aplica para
//    decidir CUÁL de las unidades detectadas es la que corresponde
//    a esta propiedad puntual. ──────────────────────────────────────
function unidadDelHallazgoMasCercano(hallazgosValores: HallazgoRAM<DatoValor>[], posicionPropiedad: number): string | null {
  if (hallazgosValores.length === 0) return null;
  let mejor = hallazgosValores[0];
  let mejorDistancia = Math.abs(mejor.posicion - posicionPropiedad);
  for (const h of hallazgosValores) {
    const distancia = Math.abs(h.posicion - posicionPropiedad);
    if (distancia < mejorDistancia) {
      mejor = h;
      mejorDistancia = distancia;
    }
  }
  return mejor.dato.unidad || null;
}

// ── Traduce el origen que ya calculó gestorBloques.ts para
//    bloque.materialDeclarado (título de sección / mención repetida
//    / sin determinar) a la misma escala de fuerza de señal que
//    espera validadorDocumental.ts (Fuerte/Media/Débil/Ninguna).
//    'titulo_seccion' es la señal más fuerte que existe en todo el
//    sistema — el material está declarado explícito como
//    encabezado de esa sección — así que mapea a 'Fuerte', no a
//    'Media'. ──────────────────────────────────────────────────────
const MAPA_ORIGEN_A_FUERZA: Record<BloqueMaterial['origenMaterialDeclarado'], 'Fuerte' | 'Media' | 'Débil'> = {
  titulo_seccion: 'Fuerte',
  mencion_repetida: 'Media',
  sin_determinar: 'Débil',
};

export function construirEntradasProcesamiento(params: ParametrosConstruccionEntradas): EntradaProcesamiento[] {
  const { documentoId, textoCompleto, bloque, memoria, materialResuelto, hallazgosPropiedades, hallazgosValores, catalogoMateriales, offsetsPorPagina } = params;

  // FUENTE DEL MATERIAL: se prueban DOS fuentes, en cascada.
  //
  // 1) bloque.materialDeclarado — calculado por la Neurona de
  //    Comprensión mirando todo el documento. Es la fuente más
  //    rica, y hoy (con el fix del regex de encabezados) es la que
  //    resuelve la mayoría de los bloques.
  //
  // 2) materialResuelto.material — lo que SÍ detectó ramMateriales
  //    mirando el texto de este bloque puntual. Más limitado (exige
  //    que el material se repita o esté en un título DENTRO del
  //    bloque), pero es una fuente real e independiente que se usa
  //    quando la primera no resolvió nada.
  //
  // Con las dos juntas se recupera muchísimo más volumen real para
  // revisar, sin inventar nada — cualquiera de las dos fuentes que
  // gane sigue siendo un dato que el sistema encontró de verdad,
  // no una suposición nueva.
  const materialTexto = bloque.materialDeclarado || materialResuelto?.material || null;

  if (!materialTexto || hallazgosPropiedades.length === 0) return [];

  const textoBloque = textoCompleto.slice(bloque.inicio, bloque.fin);
  // Reusa el detector de tablas ya construido en la Parte 3 — no se
  // crea otro (Sección 10 del documento de la Parte 6).
  const tabla = detectarTablaEnBloque(textoBloque, documentoId, bloque.inicio);

  // Candidatos de valor: SOLO el número — la unidad se resuelve
  // aparte (ver unidadDelHallazgoMasCercano), porque
  // asociarValor()/neuronaComprension.ts extraen el número del
  // texto del candidato con una regex simple; empaquetar la unidad
  // ahí adentro habría hecho que esa regex tuviera que adivinar
  // dónde termina el número y empieza la unidad, para cada unidad
  // distinta — más frágil que resolverla por separado.
  const candidatosValor: CandidatoValor[] = hallazgosValores.map(h => ({
    texto: h.dato.valor,
    posicion: h.posicion,
  }));

  // FIX: la fuerza de señal tiene que salir de la MISMA fuente que
  // ganó la cascada de arriba, no siempre de materialResuelto. Antes
  // se calculaba solo desde materialResuelto?.fuerzaSenal — que es
  // la fuente pobre — y quedaba en null cada vez que el material
  // venía de bloque.materialDeclarado (la fuente rica, que hoy
  // resuelve la mayoría de los casos). Con fuerzaSenalMaterial en
  // null, validadorDocumental.ts SIEMPRE devuelve UNKNOWN para el
  // material, así que la hipótesis nunca podía llegar a ACEPTADO —
  // quedaba PENDIENTE aunque el material viniera del título de
  // sección, que es la señal más fuerte que existe en el sistema.
  const fuerzaSenalMaterial: 'Fuerte' | 'Media' | 'Débil' | 'Ninguna' | null = bloque.materialDeclarado
    ? MAPA_ORIGEN_A_FUERZA[bloque.origenMaterialDeclarado]
    : materialResuelto?.fuerzaSenal ?? null;

  return hallazgosPropiedades.map(hallazgoPropiedad => ({
    documentoId,
    textoCompleto,
    conceptoMaterialTexto: materialTexto,
    propiedadTexto: hallazgoPropiedad.dato.nombre_propiedad,
    posicionPropiedad: hallazgoPropiedad.posicion,
    candidatosValor,
    unidadExplicitaTexto: unidadDelHallazgoMasCercano(hallazgosValores, hallazgoPropiedad.posicion),
    encabezadoContextual: tabla?.encabezados?.join(' ') ?? null,
    tabla,
    bloque,
    memoria,
    catalogoMateriales,
    offsetsPorPagina,
    fuerzaSenalMaterial,
  }));
}

// ── 2. Hipotesis ACEPTADO → PropiedadExtraida ──────────────────────

export interface ContextoGuardadoAceptado {
  neuronaId: string;
  documento: string;
  driveFileId: string;
  pagina: number;
  capitulo: string | null;
  bloque: BloqueMaterial;
  // Nombre de la familia del material, ya resuelto a texto (Material.familia
  // es un Id<'FAM'> — quien llame lo resuelve una sola vez con
  // obtenerFamilias() y se lo pasa acá, para no repetir esa
  // resolución por cada registro).
  familiaNombre: string | null;
}

export function hipotesisAceptadaAPropiedadExtraida(resultado: ResultadoProcesamiento, ctx: ContextoGuardadoAceptado): PropiedadExtraida | null {
  const { hipotesis, material, propiedad, valor, unidad } = resultado;
  if (!hipotesis || hipotesis.estado !== 'ACEPTADO' || !propiedad || !valor) return null;

  const origenDato: PropiedadExtraida['origen_dato'] = ctx.bloque.tipoNodoDominante === 'tabla' ? 'Tabla' : ctx.bloque.tipoNodoDominante === 'figura' ? 'Gráfico' : 'Texto';

  return {
    neurona_id: ctx.neuronaId,
    documento: ctx.documento,
    drive_file_id: ctx.driveFileId,
    pagina: ctx.pagina,
    capitulo: ctx.capitulo,
    nombre_propiedad: propiedad.nombre_principal,
    nombre_ingles: propiedad.nombre_en,
    sinonimos: propiedad.sinonimos,
    categoria: propiedad.categoria,
    tipo_propiedad: propiedad.tipo_propiedad,
    familia_material: ctx.familiaNombre,
    subfamilia_material: material?.subfamilia ?? null,
    material: material?.nombre_principal ?? null,
    // Componente/norma/condición de ensayo/método/instrumento: las
    // RAM correspondientes (ramComponentes, ramNormas,
    // ramCondicionEnsayo) siguen corriendo sobre el bloque, pero
    // esta integración de la Parte 6 todavía no las conecta a la
    // Neurona Central (el documento de la Parte 6 solo especifica
    // material/propiedad/valor/unidad, Secciones 7-9) — quedan en
    // null a propósito, no inventadas. Es una ampliación pendiente
    // para una parte futura, no algo que se pueda resolver acá sin
    // evidencia de cómo debería asociarse.
    componente: null,
    estado_material: null,
    agente_exposicion: null,
    momento_exposicion: null,
    unidad: unidad?.simbolo ?? null,
    simbolo: propiedad.simbolos[0] ?? null,
    valor_encontrado: valor.texto_original,
    valor_minimo: valor.valor_minimo,
    valor_maximo: valor.valor_maximo,
    condicion_ensayo: null,
    metodo_ensayo: null,
    instrumento_usado: null,
    norma: null,
    ecuacion_formula: null,
    relacion_otras_propiedades: null,
    // 'Explícito' solo si además de las 4 críticas la validación
    // física también dio PASS (no solo UNKNOWN) — un criterio algo
    // más exigente que "ACEPTADO" a secas, para que la columna de
    // confianza siga significando lo mismo que significaba antes de
    // esta integración.
    nivel_confianza: hipotesis.comprobaciones.fisica === 'PASS' ? 'Explícito' : 'Inferido',
    origen_dato: origenDato,
    observaciones: hipotesis.motivos.join(' | ') || null,
  };
}

// ── 3. Hipotesis PENDIENTE → HipotesisConContexto ──────────────────

export interface ContextoGuardadoPendiente {
  neuronaId: string;
  documento: string;
  driveFileId: string;
  pagina: number | null;
  capitulo: string | null;
}

export function hipotesisPendienteAContexto(resultado: ResultadoProcesamiento, ctx: ContextoGuardadoPendiente): HipotesisConContexto | null {
  const { hipotesis, material, propiedad, valor, unidad, evidencia } = resultado;
  if (!hipotesis || hipotesis.estado !== 'PENDIENTE' || !propiedad || !valor || !evidencia) return null;

  return {
    hipotesis,
    neuronaId: ctx.neuronaId,
    documento: ctx.documento,
    driveFileId: ctx.driveFileId,
    pagina: ctx.pagina,
    capitulo: ctx.capitulo,
    material,
    propiedad,
    valor,
    unidad,
    evidencia,
  };
}