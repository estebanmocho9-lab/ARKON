// ============================================================
// src/extraction-neurons/consolidacion/consolidador.ts
// El Conjugador. Recibe lo que entregaron las seis RAM al cerrar
// un bloque de material, y arma los registros finales — uno por
// cada par propiedad-valor que logra resolver.
//
// Regla del Manual de Construcción I para esta carpeta: el
// Consolidador NUNCA lee el documento, NUNCA usa expresiones
// regulares, trabaja ÚNICAMENTE con lo que ya organizaron las
// RAM (listas de hallazgos con posición). Por eso hay dos campos
// que este primer corte deja en null a propósito — ver la nota
// al final del archivo.
//
// Va en una carpeta nueva, consolidacion/, separada de memoria/
// porque tiene una responsabilidad distinta: las RAM detectan y
// acumulan, el Consolidador decide relaciones y arma el objeto
// final. Ninguna RAM sabe nada de las demás — quien cruza toda
// la información es este archivo.
// ============================================================

import { HallazgoRAM } from '../memoria/tipos';
import { DatoPropiedad, DatoValor, DatoComponente, DatoNorma, DatoCondicionEnsayo } from '../eventos/tipos';
import { MaterialResuelto } from '../memoria/ramMateriales';
import { BloqueMaterial } from '../comprension/gestorBloques';
import { PropiedadExtraida } from '../base/tipos';

// ── Mismo shape que ya usa hoy ResultadoAnalisisPagina['registros']
//    en motorExtraccion.ts — así lo que arma este Consolidador se
//    puede enchufar directo donde hoy se arma "registroCompleto"
//    en NeuronExtraccionBase.ts, sin cambiar el resto del guardado
//    en Turso. ────────────────────────────────────────────────────
export type RegistroConsolidado = Omit<
  PropiedadExtraida,
  'neurona_id' | 'documento' | 'drive_file_id' | 'pagina' | 'capitulo'
>;

// ── Distancias de emparejamiento. La de propiedad↔valor se queda
//    chica (200 caracteres) a propósito: esa relación siempre
//    estuvo bien resuelta en el sistema viejo, lo que fallaba era
//    encontrar el MATERIAL lejos, no esto. La de los datos
//    secundarios (componente/norma/condición) es más generosa
//    porque suelen estar en la misma oración o la de al lado, no
//    pegados letra a letra. ──────────────────────────────────────
const DISTANCIA_VALOR = 200;
const DISTANCIA_EXPLICITO = 60; // igual al umbral que ya usaba el motor viejo
const DISTANCIA_SECUNDARIOS = 300;

// ── Tamaño del fragmento de texto real que se guarda para poder
//    auditar el registro después, sin volver a abrir el PDF. ─────
const LARGO_FRAGMENTO = 200;

function extraerFragmento(textoCompleto: string, centro: number, largo: number = LARGO_FRAGMENTO): string {
  const mitad = Math.floor(largo / 2);
  const inicio = Math.max(0, centro - mitad);
  const fin = Math.min(textoCompleto.length, centro + mitad);
  return textoCompleto.substring(inicio, fin).trim();
}

function masCercano<T>(hallazgos: HallazgoRAM<T>[], posicion: number, distanciaMaxima: number): HallazgoRAM<T> | null {
  let mejor: HallazgoRAM<T> | null = null;
  let mejorDistancia = Infinity;
  for (const h of hallazgos) {
    const distancia = Math.abs(h.posicion - posicion);
    if (distancia <= distanciaMaxima && distancia < mejorDistancia) {
      mejor = h;
      mejorDistancia = distancia;
    }
  }
  return mejor;
}

// ── Igual que masCercano, pero para VALORES: un mismo valor
//    numérico no puede quedar emparejado con dos propiedades
//    distintas del mismo bloque. Sin esto, cuando un bloque tiene
//    pocos números reales (ej. una tabla mayormente descriptiva),
//    varias propiedades sueltas terminaban "peleándose" por el
//    único número cercano y todas ganaban el mismo valor — el bug
//    real detrás del caso "30% x 5 propiedades distintas" que
//    encontró Marcos revisando un PDF real. ──────────────────────
function valorMasCercanoSinReusar(
  valores: HallazgoRAM<DatoValor>[],
  posicion: number,
  distanciaMaxima: number,
  indicesUsados: Set<number>
): { hallazgo: HallazgoRAM<DatoValor>; indice: number } | null {
  let mejorIndice = -1;
  let mejorDistancia = Infinity;
  for (let i = 0; i < valores.length; i++) {
    if (indicesUsados.has(i)) continue;
    const distancia = Math.abs(valores[i].posicion - posicion);
    if (distancia <= distanciaMaxima && distancia < mejorDistancia) {
      mejorDistancia = distancia;
      mejorIndice = i;
    }
  }
  if (mejorIndice === -1) return null;
  return { hallazgo: valores[mejorIndice], indice: mejorIndice };
}

// ── Un candidato que no se pudo consolidar en un registro
//    completo (sin material, o sin valor en una propiedad que lo
//    necesita). Se devuelve aparte para no perder trazabilidad de
//    lo que se descartó y por qué — igual espíritu que
//    CandidatoNoClasificado del motor viejo, pero a nivel bloque
//    en vez de a nivel página. ────────────────────────────────────
export interface CandidatoDescartadoConsolidacion {
  motivo: 'sin_material' | 'sin_valor' | 'material_sin_evidencia';
  nombre_propiedad: string;
  posicion: number;
}

export interface ResultadoConsolidacion {
  registros: RegistroConsolidado[];
  candidatos: CandidatoDescartadoConsolidacion[];
}

export function consolidarBloque(
  bloque: BloqueMaterial,
  materialResuelto: MaterialResuelto | null,
  propiedades: HallazgoRAM<DatoPropiedad>[],
  valores: HallazgoRAM<DatoValor>[],
  componentes: HallazgoRAM<DatoComponente>[],
  normas: HallazgoRAM<DatoNorma>[],
  condiciones: HallazgoRAM<DatoCondicionEnsayo>[],
  textoCompletoDocumento: string
): ResultadoConsolidacion {
  const registros: RegistroConsolidado[] = [];
  const candidatos: CandidatoDescartadoConsolidacion[] = [];

  // origen_dato ya no hace falta adivinarlo contando números en
  // una ventana (así lo hacía determinarOrigen() en el motor
  // viejo) — el gestor de bloques YA SABE si este bloque cae
  // dentro de un nodo de tipo tabla o figura, porque viene del
  // árbol real de la Neurona de Comprensión. Es un dato más
  // confiable que la heurística anterior.
  const origenDato: RegistroConsolidado['origen_dato'] =
    bloque.tipoNodoDominante === 'tabla' ? 'Tabla' : bloque.tipoNodoDominante === 'figura' ? 'Gráfico' : 'Texto';

  // Un mismo número no puede quedar emparejado con dos propiedades
  // distintas del mismo bloque (ver valorMasCercanoSinReusar). ────
  const indicesValorUsados = new Set<number>();

  for (const hallazgoProp of propiedades) {
    const propiedad = hallazgoProp.dato;
    const resultadoValor = valorMasCercanoSinReusar(valores, hallazgoProp.posicion, DISTANCIA_VALOR, indicesValorUsados);
    const hallazgoValor = resultadoValor?.hallazgo ?? null;
    if (resultadoValor) indicesValorUsados.add(resultadoValor.indice);

    // Misma regla que ya tenía extraerPropiedadesDeBloque(): sin
    // valor, solo se guarda si la categoría es de las que no
    // necesitan un número (Constante, Ecuación, Ley).
    if (!hallazgoValor && !['Constante', 'Ecuación', 'Ley'].includes(propiedad.categoria)) {
      candidatos.push({ motivo: 'sin_valor', nombre_propiedad: propiedad.nombre_propiedad, posicion: hallazgoProp.posicion });
      continue;
    }

    // Sin material resuelto para todo el bloque: no hay a quién
    // atribuirle el dato. Se manda a candidatos en vez de
    // inventar un registro con material null.
    if (!materialResuelto) {
      candidatos.push({ motivo: 'sin_material', nombre_propiedad: propiedad.nombre_propiedad, posicion: hallazgoProp.posicion });
      continue;
    }

    // Material resuelto, pero con señal Débil (heredado, sin
    // evidencia propia en este bloque): esto es justo el caso del
    // paper de zeolita — el único material de tu catálogo
    // mencionado en todo el documento es un componente secundario
    // (resina epoxi como aglutinante), y una tabla que en realidad
    // habla de OTRO material (zeolita, fuera de tu catálogo)
    // terminaba atribuyéndosele igual, con confianza "Inferido"
    // pero guardado como si fuera un dato válido. Mejor no guardar
    // nada que guardar mal — se manda a candidatos en vez de
    // registros. ──────────────────────────────────────────────────
    if (materialResuelto.fuerzaSenal === 'Débil') {
      candidatos.push({ motivo: 'material_sin_evidencia', nombre_propiedad: propiedad.nombre_propiedad, posicion: hallazgoProp.posicion });
      continue;
    }

    const componenteInfo = masCercano(componentes, hallazgoProp.posicion, DISTANCIA_SECUNDARIOS);
    const normaInfo = masCercano(normas, hallazgoProp.posicion, DISTANCIA_SECUNDARIOS);
    const condicionInfo = masCercano(condiciones, hallazgoProp.posicion, DISTANCIA_SECUNDARIOS);

    // Explícito solo si el valor está MUY cerca (<60 caracteres,
    // el mismo umbral que ya usaba el sistema viejo) Y el
    // material del bloque tiene señal Fuerte. Cualquier otra
    // combinación queda como Inferido — esto reemplaza a las dos
    // reglas sueltas que tenía el motor viejo (densidad de
    // menciones + origen 'memoria') por una sola regla más clara,
    // apoyada en la fuerza de señal que ya calculó ramMateriales.
    const distanciaValor = hallazgoValor ? Math.abs(hallazgoValor.posicion - hallazgoProp.posicion) : Infinity;
    const nivelConfianza: RegistroConsolidado['nivel_confianza'] =
      distanciaValor < DISTANCIA_EXPLICITO && materialResuelto.fuerzaSenal === 'Fuerte' ? 'Explícito' : 'Inferido';

    const notaMaterial =
      materialResuelto.fuerzaSenal === 'Media'
        ? 'Material confirmado por una sola señal (título o repetición, no ambas)'
        : null;
    const observaciones = [notaMaterial].filter(Boolean).join(' | ') || null;

    // Centro del fragmento: el punto medio entre propiedad y valor
    // si hay valor, o la posición de la propiedad sola (caso
    // Constante/Ecuación/Ley, que no siempre trae un valor). ──────
    const centroFragmento = hallazgoValor
      ? Math.round((hallazgoProp.posicion + hallazgoValor.posicion) / 2)
      : hallazgoProp.posicion;
    const fragmentoTexto = extraerFragmento(textoCompletoDocumento, centroFragmento);

    registros.push({
      nombre_propiedad: propiedad.nombre_propiedad,
      nombre_ingles: propiedad.nombre_ingles,
      sinonimos: propiedad.sinonimos,
      categoria: propiedad.categoria,
      tipo_propiedad: propiedad.tipo_propiedad,
      familia_material: materialResuelto.familia,
      subfamilia_material: materialResuelto.subfamilia,
      material: materialResuelto.material,
      componente: componenteInfo?.dato.nombre ?? null,
      estado_material: null,
      agente_exposicion: null,
      momento_exposicion: null,
      unidad: hallazgoValor?.dato.unidad ?? null,
      // simbolo y ecuacion_formula quedan en null en este primer
      // corte: resolverlos exige leer texto crudo buscando el
      // patrón "símbolo = algo", y el Consolidador tiene prohibido
      // tocar texto (Regla del Manual I). Se puede sumar más
      // adelante como un hallazgo más dentro de ramPropiedades.ts
      // (que sí puede leer texto), sin tener que tocar este archivo.
      simbolo: null,
      valor_encontrado: hallazgoValor?.dato.valor ?? null,
      valor_minimo: hallazgoValor?.dato.valor_minimo ?? null,
      valor_maximo: hallazgoValor?.dato.valor_maximo ?? null,
      condicion_ensayo: condicionInfo?.dato.condicion_ensayo ?? null,
      metodo_ensayo: condicionInfo?.dato.metodo_ensayo ?? null,
      instrumento_usado: condicionInfo?.dato.instrumento_usado ?? null,
      norma: normaInfo?.dato.norma ?? null,
      ecuacion_formula: null,
      relacion_otras_propiedades: null,
      nivel_confianza: nivelConfianza,
      origen_dato: origenDato,
      observaciones,
      fragmento_texto: fragmentoTexto,
    });
  }

  return { registros, candidatos };
}
