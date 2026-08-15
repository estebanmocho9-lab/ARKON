// ============================================================
// src/comprehension-neuron/validacion/validadorDimensional.ts
// El validador central de esta Parte. Recorre:
// PROPIEDAD → MAGNITUD → DIMENSIÓN ESPERADA → UNIDAD ENCONTRADA →
// DIMENSIÓN DE LA UNIDAD, y solo ahí decide PASS/FAIL/UNKNOWN.
// Nunca mira únicamente si `unidad !== null` (Regla 16 del
// documento).
// ============================================================

import { Propiedad, Unidad, Magnitud, Dimension } from '../tipos/entidades';
import { Valor } from '../tipos/valores';
import { evaluarCompatibilidad } from '../conocimiento/compatibilidadUnidades';
import { ResultadoValidacion, EstadoValidacion, crearResultado } from './resultadoValidacion';

// ── Clasificación de CÓMO llegó (o no llegó) la unidad al
//    candidato — Regla 9 del documento. Esto lo decide quien
//    llama (la Neurona Central, con acceso a la tabla/encabezado),
//    no este validador — acá solo se consume ya resuelto. ─────────
export type EstadoUnidad = 'EXPLICITA' | 'CONTEXTUAL' | 'AUSENTE' | 'NO_RECONOCIDA';

// ── Caso "no hay unidad pegada al número" (Regla 10). No devuelve
//    un booleano ciego — depende del estado de la unidad y de si
//    existe evidencia documental contradictoria (ej. "este número
//    es una página", que en Parte 3 vendrá de la validación
//    documental). `evidenciaContradictoria` es el único parámetro
//    que el documento no incluía explícitamente en la firma de la
//    Sección 10, pero hace falta para poder producir el Caso 4
//    ("existe evidencia fuerte de que el candidato es
//    incompatible") sin inventar esa detección acá adentro —
//    queda como algo que otra capa le pasa, ya resuelto. ───────────
export function evaluarAusenciaDeUnidad(
  propiedad: Propiedad,
  evidenciaUnidad: Unidad | null,
  estadoUnidad: EstadoUnidad,
  magnitudes: Magnitud[],
  dimensiones: Dimension[],
  evidenciaContradictoria: string | null = null
): ResultadoValidacion {
  const datosEvaluados = { propiedad: propiedad.id, unidad: evidenciaUnidad?.id };

  // Caso 4 primero: si otra capa ya demostró que el candidato es
  // otra cosa (ej. un número de página), no hay ambigüedad posible.
  if (evidenciaContradictoria) {
    return crearResultado(
      'FAIL',
      'AUSENCIA_DE_UNIDAD',
      `No hay unidad válida y existe evidencia documental de que el candidato no es un valor de esta propiedad: ${evidenciaContradictoria}.`,
      datosEvaluados,
      evidenciaContradictoria
    );
  }

  // Caso 1 y 2: unidad explícita o contextual, con evidencia de
  // unidad disponible → se delega en el chequeo de compatibilidad
  // normal, es el mismo camino que si hubiera unidad pegada.
  if ((estadoUnidad === 'EXPLICITA' || estadoUnidad === 'CONTEXTUAL') && evidenciaUnidad) {
    const compat = evaluarCompatibilidad(evidenciaUnidad, propiedad, magnitudes, dimensiones);
    return crearResultado(
      compat,
      'AUSENCIA_DE_UNIDAD',
      compat === 'PASS'
        ? `Unidad ${estadoUnidad.toLowerCase()} y compatible con la propiedad.`
        : `Unidad ${estadoUnidad.toLowerCase()} pero no compatible con la propiedad.`,
      datosEvaluados
    );
  }

  if (estadoUnidad === 'NO_RECONOCIDA') {
    return crearResultado(
      'FAIL',
      'AUSENCIA_DE_UNIDAD',
      'Había texto en la posición de unidad, pero no coincide con ninguna unidad del diccionario — no se puede validar como si fuera válida.',
      datosEvaluados
    );
  }

  // Caso 3: AUSENTE de verdad, sin evidencia de ningún tipo. Nunca
  // FAIL automático — la propiedad puede tener su unidad en un
  // lugar que esta capa no ve (Regla 8: "no implementar sin
  // unidad = siempre FAIL").
  return crearResultado(
    'UNKNOWN',
    'AUSENCIA_DE_UNIDAD',
    'No hay unidad explícita, contextual, ni evidencia de incompatibilidad. No se puede demostrar ni descartar la relación con la información disponible.',
    datosEvaluados
  );
}

// ── La función principal, con la firma simple que pide la Sección
//    16 del documento (devuelve el estado plano). Internamente
//    arma el ResultadoValidacion completo y solo expone `.estado`
//    — para quien quiera el detalle completo, ver
//    validarDimensionalDetallado() más abajo. ──────────────────────
export function validarDimensional(propiedad: Propiedad, valor: Valor, unidad: Unidad | null, magnitudes: Magnitud[], dimensiones: Dimension[]): EstadoValidacion {
  return validarDimensionalDetallado(propiedad, valor, unidad, magnitudes, dimensiones).estado;
}

// ── Versión auditable completa — la que en la práctica conviene
//    usar, porque deja registrado el motivo (Regla 19). ───────────
export function validarDimensionalDetallado(
  propiedad: Propiedad,
  valor: Valor,
  unidad: Unidad | null,
  magnitudes: Magnitud[],
  dimensiones: Dimension[]
): ResultadoValidacion {
  if (!unidad) {
    // Sin más contexto que "no hay unidad pegada al valor", se
    // asume AUSENTE (no CONTEXTUAL ni NO_RECONOCIDA — esos dos
    // requieren que alguien más arriba haya mirado la tabla/el
    // encabezado, cosa que esta función no hace).
    return evaluarAusenciaDeUnidad(propiedad, null, 'AUSENTE', magnitudes, dimensiones);
  }

  const compat = evaluarCompatibilidad(unidad, propiedad, magnitudes, dimensiones);
  const datosEvaluados = { propiedad: propiedad.id, valor: valor.texto_original, unidad: unidad.id };

  if (compat === 'PASS') {
    return crearResultado('PASS', 'COMPATIBILIDAD_DIMENSIONAL', `La unidad ${unidad.simbolo} es compatible con la propiedad ${propiedad.nombre_principal}.`, datosEvaluados);
  }
  if (compat === 'FAIL') {
    return crearResultado(
      'FAIL',
      'COMPATIBILIDAD_DIMENSIONAL',
      `La unidad ${unidad.simbolo} tiene una dimensión incompatible con la que requiere ${propiedad.nombre_principal}.`,
      datosEvaluados
    );
  }
  return crearResultado(
    'UNKNOWN',
    'COMPATIBILIDAD_DIMENSIONAL',
    `No hay suficiente información dimensional confirmada para comparar la unidad ${unidad.simbolo} con ${propiedad.nombre_principal} (magnitud pendiente de revisión).`,
    datosEvaluados
  );
}
