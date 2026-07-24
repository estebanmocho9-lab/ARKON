// ============================================================
// src/utils/mathHelpers.ts
// Utilidades matemáticas seguras
// ============================================================

import { evaluate } from 'mathjs';

/**
 * Evalúa una expresión matemática de forma segura.
 * @param expr Expresión en string (ej: "fracciones[0] * valores[0] + fracciones[1] * valores[1]")
 * @param scope Objeto con variables numéricas.
 */
export function evaluarExpresion(expr: string, scope: Record<string, any>): number {
  try {
    const result = evaluate(expr, scope);
    if (typeof result === 'number') return result;
    return Number(result) || 0;
  } catch (e) {
    console.warn(`[mathHelpers] Error evaluando expresión: ${expr}`, e);
    return 0;
  }
}

/**
 * Suma ponderada por defecto.
 */
export function sumaPonderada(fracciones: number[], valores: number[]): number {
  return fracciones.reduce((sum, f, i) => sum + f * valores[i], 0);
}

/**
 * Normaliza un array de fracciones para que sumen 1.
 */
export function normalizarFracciones(fracciones: number[]): number[] {
  const total = fracciones.reduce((a, b) => a + b, 0);
  if (total === 0) return fracciones.map(() => 0);
  return fracciones.map(f => f / total);
}
