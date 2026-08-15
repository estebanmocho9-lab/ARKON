// ============================================================
// src/comprehension-neuron/diccionario/condicionesEnsayo.ts
// Registro de Patrones de Condición (CND). Igual que normas.ts:
// no es un catálogo cerrado de frases, son patrones de
// reconocimiento (ya definidos en ramCondicionEnsayo.ts, ahora
// exportados como PATRONES_CONDICION en vez de quedar privados).
//
// NOTA para cuando apliques esto: hace falta un cambio de una
// línea en tu memoria/ramCondicionEnsayo.ts — agregarle `export`
// delante de `const PATRONES_CONDICION` (hoy es privado del
// archivo). Sin ese `export`, este archivo no va a poder importarlo.
// ============================================================

import { PATRONES_CONDICION } from '../../extraction-neurons/memoria/ramCondicionEnsayo';
import { Id, registroIds } from '../tipos/ids';
import { PatronCondicion } from '../tipos/entidades';

const DESCRIPCIONES: string[] = [
  'Temperatura en grados Celsius (formato "a N°C")',
  'Temperatura en grados Celsius, en inglés (formato "at N°C")',
  'Condiciones declaradas explícitamente en español ("bajo condiciones de...")',
  'Condiciones declaradas explícitamente en inglés ("under ... conditions")',
];

let cache: PatronCondicion[] | null = null;

export function obtenerPatronesCondicion(): PatronCondicion[] {
  if (cache) return cache;
  cache = PATRONES_CONDICION.map((patron, i) => ({
    id: registroIds.obtenerOAsignar('CND', patron.source) as Id<'CND'>,
    descripcion: DESCRIPCIONES[i] ?? `Patrón ${i + 1}`,
    patron: patron.source,
  }));
  return cache;
}
