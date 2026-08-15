// ============================================================
// src/comprehension-neuron/conocimiento/restriccionesFisicas.ts
// Rangos físicos plausibles por propiedad, PARA CUANDO los
// tengamos confirmados de una fuente real (norma, paper, ficha
// técnica). Arranca vacío a propósito — Regla del documento: "NO
// inventar rangos", "NO completar valores razonables a mano".
// Cargarlo es trabajo futuro, deliberadamente separado de este
// commit, para que nunca se mezcle "estructura lista" con "datos
// confirmados".
// ============================================================

export interface RestriccionFisica {
  propiedad: string; // el mismo id de PROPIEDADES (ej. 'densidad_aparente'), no el ID PRO-XXXXXX
  // Parte 4, Sección 11: un rango puede depender del material
  // específico ("120 kg/m³" puede ser razonable para un material y
  // no para otro) — si se omite, la restricción aplica a la
  // propiedad en general, para cualquier material.
  material?: string; // el mismo id natural que usa el registro de materiales (nombre normalizado), no MAT-XXXXXX
  minimoPlausible?: number;
  maximoPlausible?: number;
  fuente: string; // de dónde salió el rango — obligatorio siempre que se cargue uno
}

export const RESTRICCIONES_FISICAS: RestriccionFisica[] = [];

// ── Busca primero la restricción específica para ESTE material; si
//    no hay una específica, cae a la restricción general de la
//    propiedad (sin material). Nunca inventa un rango combinando
//    ninguno de los dos. ────────────────────────────────────────
export function obtenerRestriccion(propiedadId: string, materialId?: string): RestriccionFisica | null {
  if (materialId) {
    const especifica = RESTRICCIONES_FISICAS.find(r => r.propiedad === propiedadId && r.material === materialId);
    if (especifica) return especifica;
  }
  return RESTRICCIONES_FISICAS.find(r => r.propiedad === propiedadId && !r.material) ?? null;
}
