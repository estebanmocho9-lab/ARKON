// ============================================================
// src/comprehension-neuron/diccionario/propiedades.ts
// Registro de Propiedades (PRO). Envuelve tu catálogo real de
// diccionarios/propiedades.ts (208 propiedades, sin tocarlo) y le
// asigna un ID estable a cada una. Fuente de verdad única: sigue
// siendo tu archivo de siempre — acá no se copia ni un solo
// nombre de propiedad a mano.
// ============================================================

import { PROPIEDADES } from '../../extraction-neurons/diccionarios/propiedades';
import { Id, registroIds } from '../tipos/ids';
import { Propiedad } from '../tipos/entidades';
import { obtenerMagnitudPorNombre } from './magnitudes';

let cache: Propiedad[] | null = null;

export function obtenerPropiedades(): Propiedad[] {
  if (cache) return cache;
  cache = PROPIEDADES.map(p => ({
    id: registroIds.obtenerOAsignar('PRO', p.id) as Id<'PRO'>, // usa el slug estable que ya tiene cada propiedad (ej. 'densidad_aparente') como clave natural
    nombre_principal: p.nombre_es,
    nombre_en: p.nombre_en,
    sinonimos: p.sinonimos,
    simbolos: p.simbolos,
    categoria: p.categoria,
    tipo_propiedad: p.tipo_propiedad,
    magnitudes: p.magnitudes
      .map(m => obtenerMagnitudPorNombre(m)?.id)
      .filter((id): id is Id<'MAG'> => !!id),
  }));
  return cache;
}

export function obtenerPropiedadPorId(id: Id<'PRO'>): Propiedad | null {
  return obtenerPropiedades().find(p => p.id === id) ?? null;
}

// ── Busca por nombre o sinónimo, igual criterio que ya usa
//    ramPropiedades.ts (coincidencia exacta de palabra completa la
//    hace la RAM; esto es solo el lookup por texto ya resuelto). ──
export function buscarPropiedadPorTermino(termino: string): Propiedad | null {
  const t = termino.trim().toLowerCase();
  return (
    obtenerPropiedades().find(
      p =>
        p.nombre_principal.toLowerCase() === t ||
        p.nombre_en?.toLowerCase() === t ||
        p.sinonimos.some(s => s.toLowerCase() === t)
    ) ?? null
  );
}
