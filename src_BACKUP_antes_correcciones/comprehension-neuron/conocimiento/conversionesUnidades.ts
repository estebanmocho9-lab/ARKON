// ============================================================
// src/comprehension-neuron/conocimiento/conversionesUnidades.ts
// Convierte un Valor de una unidad a otra de la MISMA magnitud.
// Nunca muta el original — devuelve un Valor nuevo, y lo que
// cambia es el campo `normalizado` (ya definido en Parte 1,
// tipos/valores.ts) — el texto original, la unidad original y el
// número original quedan intactos siempre.
// ============================================================

import { Valor } from '../tipos/valores';
import { Unidad } from '../tipos/entidades';

// ── Firma igual a la que pide el documento: recibe el Valor (que
//    ya trae la referencia a su unidad de origen), la unidad
//    destino, y la lista completa de unidades para resolver esa
//    referencia. Regla 1: solo unidades de la misma magnitud (acá
//    implica la misma dimensión, porque cada magnitud resuelve a
//    una única Dimension). Regla 5: usa factorAUnidadBase. Si
//    falta el factor de cualquiera de las dos, o el valor no tenía
//    unidad, no inventa nada — devuelve null (Regla 7: conversión
//    imposible → null). ──────────────────────────────────────────
export function convertir(valor: Valor, unidadDestino: Unidad, todasLasUnidades: Unidad[]): Valor | null {
  if (!valor.unidad) return null;
  const unidadOrigen = todasLasUnidades.find(u => u.id === valor.unidad);
  if (!unidadOrigen) return null;
  if (unidadOrigen.magnitud !== unidadDestino.magnitud) return null;
  if (unidadOrigen.factorAUnidadBase == null || unidadDestino.factorAUnidadBase == null) return null;

  const enUnidadBase = valor.numero * unidadOrigen.factorAUnidadBase;
  const numeroDestino = enUnidadBase / unidadDestino.factorAUnidadBase;

  // Regla 2 (nunca modificar el original) + Regla 3 (nuevo Valor):
  // el spread crea un objeto nuevo; texto_original, unidad, numero
  // y evidencia de posición quedan exactamente iguales a los del
  // valor de entrada — Regla 4. Lo único que se agrega/reemplaza es
  // `normalizado`, el campo que Parte 1 ya reservó justo para esto.
  return {
    ...valor,
    normalizado: {
      numero: numeroDestino,
      unidad: unidadDestino.id,
    },
  };
}
