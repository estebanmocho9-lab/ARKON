// ============================================================
// src/comprehension-neuron/validacion/decisorFinal.ts
// La pieza que decide. Implementa las Secciones 14-16 tal cual:
// documental, evidencia, semántica y dimensional son CRÍTICAS —
// cualquier FAIL entre esas cuatro rechaza, cualquier UNKNOWN dejа
// pendiente. Física es distinta a propósito: UNKNOWN en física
// NUNCA bloquea un ACEPTADO (Sección 15: "esto evita que el
// sistema quede inutilizable hasta que hayamos construido una base
// física completa") — pero un FAIL en física sí rechaza.
//
// Importante: esto NO reusa calcularEstado() de tipos/hipotesis.ts
// tal cual, porque esa función trata las 5 comprobaciones por
// igual (un UNKNOWN en cualquiera de ellas da PENDIENTE). Acá
// física tiene una regla distinta a las otras cuatro — se
// necesitaba lógica propia, no la genérica.
// ============================================================

import { EstadoValidacion } from './resultadoValidacion';
import { EstadoHipotesis } from '../tipos/hipotesis';

export interface ValidacionesCompletas {
  documental: EstadoValidacion;
  evidencia: EstadoValidacion;
  semantica: EstadoValidacion;
  dimensional: EstadoValidacion;
  fisica: EstadoValidacion;
}

export interface ResultadoDecision {
  estado: EstadoHipotesis;
  motivos: string[];
}

const CRITICAS: (keyof ValidacionesCompletas)[] = ['documental', 'evidencia', 'semantica', 'dimensional'];

const ETIQUETAS: Record<keyof ValidacionesCompletas, string> = {
  documental: 'la validación documental',
  evidencia: 'la integridad de la evidencia',
  semantica: 'la validación semántica',
  dimensional: 'la compatibilidad dimensional',
  fisica: 'la restricción física',
};

export function decidir(validaciones: ValidacionesCompletas): ResultadoDecision {
  const motivos: string[] = [];

  // REGLA 1 — un FAIL crítico rechaza, sin excepción.
  for (const clave of CRITICAS) {
    if (validaciones[clave] === 'FAIL') {
      motivos.push(`Rechazado: ${ETIQUETAS[clave]} dio FAIL.`);
    }
  }
  // Física también rechaza si da FAIL (Sección 16: "FÍSICA = FAIL
  // → RECHAZADO"), aunque no sea una de las cuatro críticas para
  // efectos de bloquear el ACEPTADO por UNKNOWN.
  if (validaciones.fisica === 'FAIL') {
    motivos.push(`Rechazado: ${ETIQUETAS.fisica} dio FAIL (contradice un rango físico confiable).`);
  }
  if (motivos.length > 0) {
    return { estado: 'RECHAZADO', motivos };
  }

  // REGLA 2/16 — ACEPTADO exige las 4 críticas en PASS, y física en
  // PASS o UNKNOWN (nunca bloquea sola por falta de conocimiento).
  const todasLasCriticasPasaron = CRITICAS.every(c => validaciones[c] === 'PASS');
  const fisicaNoBloquea = validaciones.fisica === 'PASS' || validaciones.fisica === 'UNKNOWN';

  if (todasLasCriticasPasaron && fisicaNoBloquea) {
    const motivosAceptacion = ['Aceptado: documental, evidencia, semántica y dimensional dieron PASS.'];
    if (validaciones.fisica === 'UNKNOWN') {
      motivosAceptacion.push('Física quedó UNKNOWN (sin restricción confiable todavía) — no bloquea la aceptación por sí sola.');
    } else {
      motivosAceptacion.push('Física también dio PASS.');
    }
    return { estado: 'ACEPTADO', motivos: motivosAceptacion };
  }

  // REGLA 3 — sin ningún FAIL, pero sin las 4 críticas en PASS →
  // PENDIENTE. UNKNOWN es "no sé todavía", no "está mal".
  for (const clave of CRITICAS) {
    if (validaciones[clave] === 'UNKNOWN') {
      motivos.push(`Pendiente: ${ETIQUETAS[clave]} no pudo confirmarse (UNKNOWN) — no hay evidencia suficiente para aceptar ni para rechazar.`);
    }
  }
  if (motivos.length === 0) {
    // No debería llegar acá con las reglas de arriba, pero por las
    // dudas: cualquier combinación no contemplada explícitamente
    // queda PENDIENTE, nunca se fuerza un ACEPTADO por default.
    motivos.push('Pendiente: combinación de validaciones no concluyente.');
  }
  return { estado: 'PENDIENTE', motivos };
}
