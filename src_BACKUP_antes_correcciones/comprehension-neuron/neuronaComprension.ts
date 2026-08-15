// ============================================================
// src/comprehension-neuron/neuronaComprension.ts
// El punto de entrada de la Neurona Central. Corre los 15 pasos
// de la Sección 21 del documento, de punta a punta, sobre UN
// candidato a la vez. Todavía aislado — no lee PDFs, no se conecta
// a Turso/Supabase, no reemplaza nada del pipeline real (Sección
// 23 y 29: eso es explícitamente trabajo de la Parte 5).
//
// Recibe todo lo que las micro-neuronas y el mapa documental ya
// encontraron (texto de material, texto de propiedad, candidatos
// de valor, tabla si hay, bloque, catálogo de materiales) y
// devuelve la Hipotesis completa con las 5 validaciones corridas y
// la decisión final — nunca un "encontré esto" plano.
// ============================================================

import { Material, Propiedad, Unidad } from './tipos/entidades';
import { Hipotesis } from './tipos/hipotesis';
import { Id, registroIds } from './tipos/ids';
import { EstadoValidacion } from './validacion/resultadoValidacion';
import { BloqueMaterial } from '../extraction-neurons/comprension/gestorBloques';
import { MemoriaTemporalDocumento } from '../extraction-neurons/comprension/tipos';

import { resolverConcepto } from './razonamiento/resolverEntidades';
import { resolverMaterialDetallado } from './razonamiento/resolverMaterial';
import { resolverPropiedadDetallado } from './razonamiento/resolverPropiedad';
import { asociarValor, CandidatoValor } from './razonamiento/asociarValor';
import { asociarUnidad } from './razonamiento/asociarUnidad';
import { construirRelacionCandidata } from './razonamiento/construirRelaciones';
import { armarCoordenada } from './mapa/mapaDocumento';
import { TablaDetectada } from './mapa/tablas';

import { obtenerUnidades } from './diccionario/unidades';
import { obtenerMagnitudes } from './diccionario/magnitudes';
import { obtenerDimensiones } from './diccionario/dimensiones';

import { validarDocumentalDetallado } from './validacion/validadorDocumental';
import { validarSemanticoDetallado } from './validacion/validadorSemantico';
import { validarEvidenciaDetallado } from './validacion/validadorEvidencia';
import { validarDimensionalDetallado } from './validacion/validadorDimensional';
import { validarFisicoDetallado } from './validacion/validadorFisico';
import { decidir } from './validacion/decisorFinal';

import { Evidencia } from './tipos/evidencias';
import { Valor } from './tipos/valores';

export interface EntradaProcesamiento {
  documentoId: string;
  textoCompleto: string;
  conceptoMaterialTexto: string; // el span literal que matcheó ramMateriales.ts
  propiedadTexto: string; // el span literal que matcheó ramPropiedades.ts
  posicionPropiedad: number;
  candidatosValor: CandidatoValor[]; // lo que entregó ramValores.ts
  unidadExplicitaTexto: string | null;
  encabezadoContextual: string | null;
  tabla: TablaDetectada | null;
  bloque: BloqueMaterial | null;
  memoria: MemoriaTemporalDocumento;
  catalogoMateriales: Material[]; // se pasa desde afuera (obtenerMateriales() es async por Supabase; el orquestador se mantiene puro/sincrónico para poder testearlo aislado)
  offsetsPorPagina?: number[];
}

export interface ResultadoProcesamiento {
  hipotesis: Hipotesis | null; // null si ni siquiera se pudo construir una hipótesis (ej. propiedad ambigua/no encontrada)
  // Objetos ya resueltos, para que quien llame (el adaptador de la
  // Parte 6) pueda armar PropiedadExtraida / HipotesisConContexto
  // sin tener que volver a resolver nada — la Sección 14 del
  // documento de la Parte 6 lo pide explícito: "Hipótesis aceptada
  // + objetos ya resueltos". Todos null si hipotesis === null.
  material: Material | null;
  propiedad: Propiedad | null;
  valor: Valor | null;
  unidad: Unidad | null;
  evidencia: Evidencia | null;
  validaciones: {
    documental: EstadoValidacion;
    evidencia: EstadoValidacion;
    semantica: EstadoValidacion;
    dimensional: EstadoValidacion;
    fisica: EstadoValidacion;
  };
  motivos: string[];
}

export function procesarCandidato(entrada: EntradaProcesamiento): ResultadoProcesamiento {
  const unidades = obtenerUnidades();
  const magnitudes = obtenerMagnitudes();
  const dimensiones = obtenerDimensiones();

  // 2-3. Resolver concepto y material.
  const concepto = resolverConcepto(entrada.conceptoMaterialTexto);
  const resolucionMaterial = resolverMaterialDetallado(concepto, entrada.catalogoMateriales);
  const material = resolucionMaterial.material;

  // 4. Resolver propiedad.
  const resolucionPropiedad = resolverPropiedadDetallado(entrada.propiedadTexto);
  if (!resolucionPropiedad.propiedad) {
    // Sin propiedad resuelta no hay nada que construir — se corta
    // acá, sin forzar ninguna hipótesis (Regla de no invención).
    return {
      hipotesis: null,
      material: null,
      propiedad: null,
      valor: null,
      unidad: null,
      evidencia: null,
      validaciones: { documental: 'UNKNOWN', evidencia: 'UNKNOWN', semantica: 'UNKNOWN', dimensional: 'UNKNOWN', fisica: 'UNKNOWN' },
      motivos: [`No se pudo resolver la propiedad a partir de "${entrada.propiedadTexto}" (estado: ${resolucionPropiedad.estado}).`],
    };
  }
  const propiedad = resolucionPropiedad.propiedad;

  // 5. Asociar valor.
  const resultadoValor = asociarValor({
    materialTexto: material?.nombre_principal ?? entrada.conceptoMaterialTexto,
    propiedadTexto: entrada.propiedadTexto,
    posicionReferencia: entrada.posicionPropiedad,
    tabla: entrada.tabla,
    candidatosProximidad: entrada.candidatosValor,
    textoCompleto: entrada.textoCompleto,
  });

  if (!resultadoValor.candidato || resultadoValor.ambiguo) {
    return {
      hipotesis: null,
      material,
      propiedad,
      valor: null,
      unidad: null,
      evidencia: null,
      validaciones: { documental: 'UNKNOWN', evidencia: 'UNKNOWN', semantica: 'UNKNOWN', dimensional: 'UNKNOWN', fisica: 'UNKNOWN' },
      motivos: [resultadoValor.motivo],
    };
  }

  // Se arma un Valor real (Parte 1) a partir del texto que ganó la
  // asociación — acá es donde correspondería, en integración real,
  // parsear número+unidad con la misma lógica que ya tiene
  // ramValores.ts; para esta capa aislada se asume que el texto ya
  // viene como "número [unidad]" (ej. "120 kg/m3").
  const matchNumero = resultadoValor.candidato.texto.match(/-?\d+(?:[.,]\d+)?/);
  const numero = matchNumero ? parseFloat(matchNumero[0].replace(',', '.')) : NaN;

  // 6. Asociar unidad.
  const resultadoUnidad = asociarUnidad(entrada.unidadExplicitaTexto, entrada.encabezadoContextual, unidades);

  const valor: Valor = {
    id: registroIds.obtenerOAsignar('VAL', `${entrada.documentoId}::${resultadoValor.candidato.posicion}`) as Id<'VAL'>,
    texto_original: resultadoValor.candidato.texto,
    numero,
    unidad: resultadoUnidad.unidad?.id ?? null,
    valor_minimo: null,
    valor_maximo: null,
    incertidumbre: null,
    operador: null,
    aproximacion: false,
    normalizado: null,
    posicionAbsoluta: resultadoValor.candidato.posicion,
  };

  // 7. Construir evidencia.
  const coordenada = armarCoordenada(entrada.documentoId, entrada.posicionPropiedad, entrada.memoria, entrada.bloque ? [entrada.bloque] : [], entrada.offsetsPorPagina);
  const inicioFragmento = Math.max(0, Math.min(entrada.posicionPropiedad, resultadoValor.candidato.posicion) - 60);
  const finFragmento = Math.max(entrada.posicionPropiedad, resultadoValor.candidato.posicion) + 60;
  const evidencia: Evidencia = {
    id: registroIds.obtenerOAsignar('EVI', `${entrada.documentoId}::${inicioFragmento}-${finFragmento}`) as Id<'EVI'>,
    coordenada,
    fragmentoTexto: entrada.textoCompleto.slice(inicioFragmento, finFragmento),
    entidadesInvolucradas: [propiedad.id, valor.id, ...(material ? [material.id] : [])],
  };

  // 8. Construir relación candidata (Hipotesis).
  const hipotesis = construirRelacionCandidata(material, propiedad, valor, resultadoUnidad.unidad, evidencia);

  // 9-13. Correr los 5 validadores.
  const rDocumental = validarDocumentalDetallado(hipotesis, evidencia, entrada.bloque, material, propiedad, valor);
  const rEvidencia = validarEvidenciaDetallado(hipotesis, evidencia, material, valor, resultadoUnidad.unidad);
  const rSemantico = validarSemanticoDetallado(concepto, material, propiedad, hipotesis);
  const rDimensional = validarDimensionalDetallado(propiedad, valor, resultadoUnidad.unidad, magnitudes, dimensiones);
  const rFisico = !isNaN(numero)
    ? validarFisicoDetallado(propiedad.id, numero, material?.id)
    : { estado: 'UNKNOWN' as EstadoValidacion, regla: 'RESTRICCION_FISICA', motivo: 'Valor no numérico.', datosEvaluados: {} };

  // 14. Decidir.
  const decision = decidir({
    documental: rDocumental.estado,
    evidencia: rEvidencia.estado,
    semantica: rSemantico.estado,
    dimensional: rDimensional.estado,
    fisica: rFisico.estado,
  });

  hipotesis.comprobaciones = {
    documental: rDocumental.estado,
    evidencia: rEvidencia.estado,
    semantica: rSemantico.estado,
    dimensional: rDimensional.estado,
    fisica: rFisico.estado,
    matematica: 'UNKNOWN', // no se ejecuta en esta Parte — no hay conversión de unidad pedida acá
  };
  hipotesis.estado = decision.estado;
  hipotesis.motivos = decision.motivos;
  hipotesis.motivo = decision.motivos[0] ?? null;
  hipotesis.fechaEvaluacion = new Date().toISOString();

  // 15. Devolver Hipotesis + objetos resueltos + resultado de cada validación.
  return {
    hipotesis,
    material,
    propiedad,
    valor,
    unidad: resultadoUnidad.unidad,
    evidencia,
    validaciones: { documental: rDocumental.estado, evidencia: rEvidencia.estado, semantica: rSemantico.estado, dimensional: rDimensional.estado, fisica: rFisico.estado },
    motivos: decision.motivos,
  };
}
