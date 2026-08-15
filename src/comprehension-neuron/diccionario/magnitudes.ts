// ============================================================
// src/comprehension-neuron/diccionario/magnitudes.ts
// Registro de Magnitudes (MAG). Se genera automáticamente a
// partir de las magnitudes que YA declara cada propiedad en
// diccionarios/propiedades.ts (campo `magnitudes`) — no es una
// lista escrita a mano, así que si el día de mañana agregás una
// propiedad nueva con una magnitud nueva, esta lista la toma sola
// en la próxima corrida, sin que nadie tenga que actualizar este
// archivo.
// ============================================================

import { PROPIEDADES } from '../../extraction-neurons/diccionarios/propiedades';
import { Id, registroIds } from '../tipos/ids';
import { Magnitud } from '../tipos/entidades';
import { obtenerDimensionPara } from './dimensiones';

// ── Junta el set completo de nombres de magnitud usados en TODAS
//    las propiedades reales — sin inventar ninguna. ────────────────
function nombresDeMagnitudReales(): string[] {
  const set = new Set<string>();
  for (const p of PROPIEDADES) {
    for (const m of p.magnitudes) set.add(m);
  }
  return [...set].sort();
}

let cache: Magnitud[] | null = null;

export function obtenerMagnitudes(): Magnitud[] {
  if (cache) return cache;
  cache = nombresDeMagnitudReales().map(nombre => ({
    id: registroIds.obtenerOAsignar('MAG', nombre) as Id<'MAG'>,
    nombre,
    dimension: obtenerDimensionPara(nombre),
  }));
  return cache;
}

export function obtenerMagnitudPorNombre(nombre: string): Magnitud | null {
  return obtenerMagnitudes().find(m => m.nombre === nombre) ?? null;
}

export function obtenerMagnitudPorId(id: Id<'MAG'>): Magnitud | null {
  return obtenerMagnitudes().find(m => m.id === id) ?? null;
}
