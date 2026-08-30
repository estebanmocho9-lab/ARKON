// ============================================================
// src/utils/mathHelpers.ts
// Utilidades matemáticas seguras
// ============================================================

import { evaluate } from 'mathjs';

/** Convierte variantes comunes de sintaxis a la sintaxis de mathjs. */
function normalizarSintaxis(expr: string): string {
  return expr
    .replace(/\*\*/g, '^')
    .replace(/\bIF\s*\(/gi, 'if(');
}

/** Aproximación de erf(x), usada por fórmulas de difusión. */
function erfApprox(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return sign * y;
}

/**
 * Evalúa una expresión matemática de forma segura.
 * Las fórmulas científicas pueden usar LEAST/GREATEST, potencia **
 * y erf_approx además de las funciones nativas de mathjs.
 */
export function evaluarExpresion(expr: string, scope: Record<string, any>): number {
  try {
    const funcionesCompatibles = {
      LEAST: (...args: number[]) => Math.min(...args),
      GREATEST: (...args: number[]) => Math.max(...args),
      least: (...args: number[]) => Math.min(...args),
      greatest: (...args: number[]) => Math.max(...args),
      erf_approx: erfApprox,
    };

    const result = evaluate(normalizarSintaxis(expr), { ...funcionesCompatibles, ...scope });
    if (typeof result === 'number') return result;
    return Number(result) || 0;
  } catch (e) {
    console.warn(`[mathHelpers] Error evaluando expresión: ${expr}`, e);
    return 0;
  }
}

export function sumaPonderada(fracciones: number[], valores: number[]): number {
  return fracciones.reduce((sum, f, i) => sum + f * valores[i], 0);
}

export function normalizarFracciones(fracciones: number[]): number[] {
  const total = fracciones.reduce((a, b) => a + b, 0);
  if (total === 0) return fracciones.map(() => 0);
  return fracciones.map(f => f / total);
}
