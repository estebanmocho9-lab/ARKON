// ============================================================
// src/comprehension-neuron/conocimiento/dimensionesFisicas.ts
// Comparación matemática de dimensiones — nunca por texto. Dos
// propiedades pueden llamarse distinto ("Densidad" vs "Densidad
// aparente") y tener la misma dimensión física; esto lo confirma
// comparando el VectorDimension componente por componente, no el
// nombre.
// ============================================================

import { Dimension, VectorDimension } from '../tipos/entidades';

// Reexportado acá para que quien importe desde conocimiento/ (como
// pide el documento de la Parte 2) lo encuentre en este archivo,
// aunque el tipo esté definido en tipos/entidades.ts (ver la nota
// en ese archivo sobre por qué, para evitar un ciclo de imports).
export type { VectorDimension };

// ── Compara dos Dimension completas. Si CUALQUIERA de las dos no
//    tiene vector todavía (una de las ~155 magnitudes
//    especializadas pendientes de revisión), no hay forma honesta
//    de afirmar ni negar que sean la misma — se devuelve false,
//    y es responsabilidad de quien llama tratar "false por falta
//    de datos" distinto de "false por contradicción real" (eso lo
//    hace validadorDimensional.ts, no esta función). ───────────────
export function mismaDimension(dimA: Dimension, dimB: Dimension): boolean {
  if (!dimA.vector || !dimB.vector) return false;
  return dimensionesEquivalentes(dimA.vector, dimB.vector);
}

// ── Comparación componente por componente de dos vectores ya
//    resueltos (sin pasar por la entidad Dimension completa). ─────
export function dimensionesEquivalentes(a: VectorDimension, b: VectorDimension): boolean {
  return a.M === b.M && a.L === b.L && a.T === b.T && a.I === b.I && a.Theta === b.Theta && a.N === b.N && a.J === b.J;
}

// ── true solo cuando SÍ tenemos vector para ambas (para que
//    validadorDimensional pueda distinguir "confirmado que NO
//    matchean" de "no lo puedo confirmar todavía"). ────────────────
export function hayDatosSuficientesParaComparar(dimA: Dimension, dimB: Dimension): boolean {
  return !!dimA.vector && !!dimB.vector;
}
