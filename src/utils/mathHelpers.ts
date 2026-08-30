// ============================================================
// src/utils/mathHelpers.ts
// Utilidades matemáticas seguras
// ============================================================

import { evaluate } from 'mathjs';

/**
 * Evalúa una expresión matemática de forma segura.
 * Las fórmulas científicas almacenadas en Supabase pueden usar nombres
 * SQL habituales (LEAST/GREATEST). Se exponen como funciones explícitas
 * para evitar que una fórmula válida termine silenciosamente en cero.
 */
export function evaluarExpresion(expr: string, scope: Record<string, any>): number {
  try {
    const funcionesCompatibles = {
      LEAST: (...args: number[]) => Math.min(...args),
      GREATEST: (...args: number[]) => Math.max(...args),
      least: (...args: number[]) => Math.min(...args),
      greatest: (...args: number[]) => Math.max(...args),
    };

    const result = evaluate(expr, { ...funcionesCompatibles, ...scope });
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