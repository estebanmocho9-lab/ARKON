// ============================================================
// src/comprehension-neuron/validacion/resultadoValidacion.ts
// La forma auditable de "por qué ARKON decidió esto". Todo
// validador de acá en adelante (dimensional, físico, y los que
// vengan en próximas partes: documental, semántico) devuelve esto
// además del PASS/FAIL/UNKNOWN plano, para que el motivo quede
// registrado y consultable — nunca un rechazo silencioso.
// ============================================================

export type EstadoValidacion = 'PASS' | 'FAIL' | 'UNKNOWN';

export interface ResultadoValidacion {
  estado: EstadoValidacion;
  regla: string; // ej. 'COMPATIBILIDAD_DIMENSIONAL'
  motivo: string; // texto legible, para vos o para auditar
  evidencia?: string;
  datosEvaluados: {
    propiedad?: string;
    valor?: string;
    unidad?: string;
    dimension?: string;
  };
}

export function crearResultado(
  estado: EstadoValidacion,
  regla: string,
  motivo: string,
  datosEvaluados: ResultadoValidacion['datosEvaluados'],
  evidencia?: string
): ResultadoValidacion {
  return { estado, regla, motivo, datosEvaluados, evidencia };
}
