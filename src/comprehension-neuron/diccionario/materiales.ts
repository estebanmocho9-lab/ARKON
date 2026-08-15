// ============================================================
// src/comprehension-neuron/diccionario/materiales.ts
// Registro de Materiales (MAT) y Familias (FAM). Envuelve
// cargarDiccionarioMateriales(), que lee EN VIVO tu catálogo real
// de Supabase (los 21 materiales) — igual que hace hoy el resto
// del sistema. No hay ninguna lista de materiales escrita a mano
// acá: si mañana agregás un material 22 en Supabase, esta función
// le asigna MAT-000022 solo, en la próxima corrida.
//
// Es async porque su fuente (Supabase) lo es — a diferencia de
// propiedades.ts/unidades.ts/instrumentos.ts, que son listas
// estáticas y no necesitan await.
// ============================================================

import { cargarDiccionarioMateriales } from '../../extraction-neurons/diccionarios/materiales';
import { Id, registroIds } from '../tipos/ids';
import { Material, Familia } from '../tipos/entidades';

let cacheMateriales: Material[] | null = null;
let cacheFamilias: Familia[] | null = null;

export async function obtenerMateriales(): Promise<Material[]> {
  if (cacheMateriales) return cacheMateriales;

  const catalogo = await cargarDiccionarioMateriales();
  const familiasVistas = new Map<string, Id<'FAM'>>();

  cacheFamilias = [];
  cacheMateriales = catalogo.map(m => {
    let famId = familiasVistas.get(m.familia);
    if (!famId) {
      famId = registroIds.obtenerOAsignar('FAM', m.familia) as Id<'FAM'>;
      familiasVistas.set(m.familia, famId);
      cacheFamilias!.push({ id: famId, nombre: m.familia });
    }

    return {
      id: registroIds.obtenerOAsignar('MAT', m.nombre_es) as Id<'MAT'>,
      nombre_principal: m.nombre_es,
      nombre_en: m.nombre_en,
      sinonimos: m.sinonimos,
      familia: famId,
      subfamilia: m.subfamilia || null,
      variante_de: null, // ver diccionario/variantes.ts
      estado: 'activo' as const,
    };
  });

  return cacheMateriales;
}

export async function obtenerFamilias(): Promise<Familia[]> {
  if (!cacheFamilias) await obtenerMateriales(); // aprovecha el efecto de armar familias que ya hace obtenerMateriales()
  return cacheFamilias!;
}

export async function obtenerMaterialPorId(id: Id<'MAT'>): Promise<Material | null> {
  const materiales = await obtenerMateriales();
  return materiales.find(m => m.id === id) ?? null;
}

export async function buscarMaterialPorTermino(termino: string): Promise<Material | null> {
  const t = termino.trim().toLowerCase();
  const materiales = await obtenerMateriales();
  return (
    materiales.find(
      m =>
        m.nombre_principal.toLowerCase() === t ||
        m.nombre_en?.toLowerCase() === t ||
        m.sinonimos.some(s => s.toLowerCase() === t)
    ) ?? null
  );
}
