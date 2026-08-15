// ============================================================
// src/comprehension-neuron/diccionario/instrumentos.ts
// Registro de Instrumentos (INS). Envuelve diccionarios/
// instrumentos.ts filtrando tipo === 'instrumento' (los métodos
// están en metodos.ts, separados, aunque vengan del mismo archivo
// de origen).
// ============================================================

import { INSTRUMENTOS } from '../../extraction-neurons/diccionarios/instrumentos';
import { Id, registroIds } from '../tipos/ids';
import { Instrumento } from '../tipos/entidades';

let cache: Instrumento[] | null = null;

export function obtenerInstrumentos(): Instrumento[] {
  if (cache) return cache;
  cache = INSTRUMENTOS.filter(i => i.tipo === 'instrumento').map(i => ({
    id: registroIds.obtenerOAsignar('INS', i.nombre_es) as Id<'INS'>,
    nombre_es: i.nombre_es,
    nombre_en: i.nombre_en,
    sinonimos: i.sinonimos,
  }));
  return cache;
}

export function obtenerInstrumentoPorId(id: Id<'INS'>): Instrumento | null {
  return obtenerInstrumentos().find(i => i.id === id) ?? null;
}
