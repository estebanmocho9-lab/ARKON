// ============================================================
// src/comprehension-neuron/conocimiento/compatibilidadUnidades.ts
// Responde: ¿esta Unidad puede ir con esta Propiedad? Nunca
// compara texto ("kg/m³" vs "kg/m3") — todo pasa por entidades ya
// resueltas del diccionario (Unidad, Propiedad, Dimension) y por
// la comparación matemática de dimensionesFisicas.ts.
// ============================================================

import { Propiedad, Unidad, Dimension, Magnitud } from '../tipos/entidades';
import { mismaDimension, hayDatosSuficientesParaComparar } from './dimensionesFisicas';

// ── Resultado con matiz: no todo es sí/no. 'UNKNOWN' cuando no hay
//    vector suficiente para afirmar nada (evita un FAIL inventado
//    en las magnitudes especializadas pendientes de revisión). ────
export type ResultadoCompatibilidad = 'PASS' | 'FAIL' | 'UNKNOWN';

function dimensionDeMagnitud(magnitudId: string, magnitudes: Magnitud[], dimensiones: Dimension[]): Dimension | null {
  const mag = magnitudes.find(m => m.id === magnitudId);
  if (!mag || mag.dimension === 'PENDIENTE_DEFINIR') return null;
  return dimensiones.find(d => d.id === mag.dimension) ?? null;
}

// ── Versión con matiz (PASS/FAIL/UNKNOWN) — la que en la práctica
//    usa validadorDimensional.ts, porque necesita distinguir
//    "confirmado incompatible" (FAIL) de "no lo puedo confirmar
//    todavía" (UNKNOWN), y la respuesta booleana simple no alcanza
//    para esa distinción. ─────────────────────────────────────────
export function evaluarCompatibilidad(
  unidad: Unidad,
  propiedad: Propiedad,
  magnitudes: Magnitud[],
  dimensiones: Dimension[]
): ResultadoCompatibilidad {
  // Atajo directo y 100% confiable: si la magnitud de la unidad
  // está en la lista de magnitudes válidas que ya declara la
  // propiedad (propiedades.ts real), es PASS sin necesidad de
  // pasar por vectores — esa relación ya viene confirmada desde tu
  // catálogo de origen.
  if (propiedad.magnitudes.includes(unidad.magnitud)) return 'PASS';

  const dimensionUnidad = dimensionDeMagnitud(unidad.magnitud, magnitudes, dimensiones);

  let huboComparacionValida = false;
  for (const magPropiedadId of propiedad.magnitudes) {
    const dimensionPropiedad = dimensionDeMagnitud(magPropiedadId, magnitudes, dimensiones);
    if (!dimensionUnidad || !dimensionPropiedad) continue;
    if (!hayDatosSuficientesParaComparar(dimensionUnidad, dimensionPropiedad)) continue;
    huboComparacionValida = true;
    if (mismaDimension(dimensionUnidad, dimensionPropiedad)) return 'PASS';
  }

  // Se pudo comparar (había vector de ambos lados) pero ninguna
  // magnitud matcheó → contradicción demostrable.
  if (huboComparacionValida) return 'FAIL';

  // No había magnitud declarada ni vector suficiente en ningún
  // lado → no hay evidencia para afirmar ni negar.
  return 'UNKNOWN';
}

// ── Versión booleana simple, la que pedía el documento — para
//    cuando alcanza con un sí/no (ej. filtrar qué unidades
//    ofrecer). Trata UNKNOWN igual que "no compatible". ────────────
export function unidadCompatibleConPropiedad(
  unidad: Unidad,
  propiedad: Propiedad,
  magnitudes: Magnitud[],
  dimensiones: Dimension[]
): boolean {
  return evaluarCompatibilidad(unidad, propiedad, magnitudes, dimensiones) === 'PASS';
}
