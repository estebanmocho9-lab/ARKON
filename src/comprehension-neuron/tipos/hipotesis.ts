// ============================================================
// src/comprehension-neuron/tipos/hipotesis.ts
// HYP — una Relación TODAVÍA no validada. Antes de convertirse en
// un REL guardado, toda afirmación pasa por acá y se somete a las
// cinco comprobaciones que definiste (documental, semántica,
// dimensional, matemática, física).
//
// El resultado NUNCA es binario a la fuerza — PENDIENTE es un
// resultado tan válido como los otros dos (Regla 9: UNKNOWN es un
// resultado válido). Esto es intencional: preferimos un dato que
// diga "no pude demostrarlo" antes que uno inventado.
// ============================================================

import { Id } from './ids';

export type ResultadoComprobacion = 'PASS' | 'FAIL' | 'UNKNOWN';

export type EstadoHipotesis = 'ACEPTADO' | 'RECHAZADO' | 'PENDIENTE';

export interface Comprobaciones {
  documental: ResultadoComprobacion;
  semantica: ResultadoComprobacion;
  dimensional: ResultadoComprobacion;
  matematica: ResultadoComprobacion;
  fisica: ResultadoComprobacion;
  // Agregado en la Parte 4 (Sección 20 de ese documento): la
  // integridad de la evidencia es una comprobación propia, separada
  // de "documental" — documental confirma que la ASOCIACIÓN es
  // plausible (misma fila, mismo bloque...), evidencia confirma que
  // las REFERENCIAS (material/propiedad/valor/unidad) realmente
  // resuelven a algo real y rastreable, sin punteros colgados.
  evidencia: ResultadoComprobacion;
}

export interface Hipotesis {
  id: Id<'HYP'>;
  material: Id<'MAT'> | null;
  propiedad: Id<'PRO'> | null;
  valor: Id<'VAL'> | null;
  unidad: Id<'UNI'> | null;
  evidencia: Id<'EVI'>;

  comprobaciones: Comprobaciones;
  estado: EstadoHipotesis;
  // Por qué quedó en ese estado — obligatorio si es RECHAZADO o
  // PENDIENTE, para que la decisión sea auditable (nunca "no sé
  // por qué lo rechazó"). Se mantiene por compatibilidad con la
  // Parte 3 (construirRelaciones.ts ya lo usa); `motivos` (plural,
  // abajo) es la versión de la Parte 4, que junta un motivo por
  // cada comprobación que no dio PASS, no solo uno.
  motivo: string | null;
  // Parte 4, Sección 20: la lista completa de motivos, uno por
  // cada validación que no dio PASS — para que un RECHAZADO nunca
  // se quede en un solo string genérico.
  motivos: string[];
  // Parte 4, Sección 20. null hasta que decisorFinal.ts corre.
  // (evidenciaPrincipal de esa misma sección no se agrega aparte:
  // ya existe el campo `evidencia` de acá arriba, que apunta al
  // mismo EVI-XXXXXX — agregar un segundo campo hubiera sido
  // duplicar lo que ya estaba.)
  fechaEvaluacion: string | null;
}

// ── Un estado se computa a partir de las cinco comprobaciones:
//    - Si CUALQUIERA dio FAIL → RECHAZADO.
//    - Si TODAS dieron PASS → ACEPTADO.
//    - Si no hay ningún FAIL pero hay al menos un UNKNOWN →
//      PENDIENTE (no hay evidencia de que esté mal, pero tampoco
//      hay evidencia suficiente para aceptarlo de lleno). ─────────
export function calcularEstado(c: Comprobaciones): EstadoHipotesis {
  const valores = Object.values(c);
  if (valores.includes('FAIL')) return 'RECHAZADO';
  if (valores.every(v => v === 'PASS')) return 'ACEPTADO';
  return 'PENDIENTE';
}
