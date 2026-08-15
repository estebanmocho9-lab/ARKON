// ============================================================
// src/comprehension-neuron/diccionario/componentes.ts
// Registro de Componentes (COM). Mismo patrón que materiales.ts:
// envuelve cargarDiccionarioComponentes() (tu tabla real
// componentes_materiales de Supabase), sin copiar nada a mano.
// ============================================================

import { cargarDiccionarioComponentes } from '../../extraction-neurons/diccionarios/materiales';
import { Id, registroIds } from '../tipos/ids';
import { Componente } from '../tipos/entidades';
import { buscarMaterialPorTermino } from './materiales';

let cache: Componente[] | null = null;

export async function obtenerComponentes(): Promise<Componente[]> {
  if (cache) return cache;

  const catalogo = await cargarDiccionarioComponentes();
  cache = [];
  for (const c of catalogo) {
    // materialAsociado, si lo trae el registro de Supabase (viene
    // como uno de los sinónimos/campo propio según cómo esté
    // armado cargarDiccionarioComponentes() — se resuelve por
    // nombre contra el registro de materiales ya asignado).
    const materialAsociado = (c as any).materialAsociado
      ? await buscarMaterialPorTermino((c as any).materialAsociado)
      : null;

    cache.push({
      id: registroIds.obtenerOAsignar('COM', c.nombre_es) as Id<'COM'>,
      nombre: c.nombre_es,
      nombre_en: c.nombre_en,
      sinonimos: c.sinonimos,
      materialAsociado: materialAsociado?.id ?? null,
    });
  }
  return cache;
}

export async function obtenerComponentePorId(id: Id<'COM'>): Promise<Componente | null> {
  const componentes = await obtenerComponentes();
  return componentes.find(c => c.id === id) ?? null;
}
