// ============================================================
// src/comprehension-neuron/diccionario/metodos.ts
// Registro de Métodos de ensayo (MET). Mismo origen que
// instrumentos.ts (diccionarios/instrumentos.ts), filtrando
// tipo === 'metodo'.
// ============================================================

import { INSTRUMENTOS } from '../../extraction-neurons/diccionarios/instrumentos';
import { Id, registroIds } from '../tipos/ids';
import { Metodo } from '../tipos/entidades';

let cache: Metodo[] | null = null;

export function obtenerMetodos(): Metodo[] {
  if (cache) return cache;
  cache = INSTRUMENTOS.filter(i => i.tipo === 'metodo').map(i => ({
    id: registroIds.obtenerOAsignar('MET', i.nombre_es) as Id<'MET'>,
    nombre_es: i.nombre_es,
    nombre_en: i.nombre_en,
    sinonimos: i.sinonimos,
  }));
  return cache;
}

export function obtenerMetodoPorId(id: Id<'MET'>): Metodo | null {
  return obtenerMetodos().find(m => m.id === id) ?? null;
}
