// ============================================================
// src/comprehension-neuron/razonamiento/resolverPropiedad.ts
// Texto encontrado → Propiedad del catálogo. Reusa
// diccionario/propiedades.ts (ya tenía buscarPropiedadPorTermino
// desde la Parte 1) — no arma una lista nueva, tal como pide la
// Sección 22.
// ============================================================

import { Propiedad } from '../tipos/entidades';
import { obtenerPropiedades } from '../diccionario/propiedades';

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export type EstadoResolucionPropiedad = 'exacto' | 'ambiguo' | 'no_encontrado';

export interface ResultadoResolucionPropiedad {
  propiedad: Propiedad | null;
  estado: EstadoResolucionPropiedad;
  candidatos?: Propiedad[];
}

// ── Sección 23: "resistencia" sola es ambigua si matchea el
//    nombre/sinónimo de más de una propiedad real de tu catálogo
//    (ej. si "resistencia" estuviera como sinónimo tanto de
//    "Resistencia a la compresión" como de "Resistencia térmica").
//    Esta función lo detecta solo: cuenta CUÁNTAS propiedades
//    matchean ese término exacto, y si es más de una, es ambiguo
//    — no elige la primera. ──────────────────────────────────────
export function resolverPropiedad(textoEncontrado: string): Propiedad | null {
  return resolverPropiedadDetallado(textoEncontrado).propiedad;
}

export function resolverPropiedadDetallado(textoEncontrado: string): ResultadoResolucionPropiedad {
  const t = normalizar(textoEncontrado);
  const propiedades = obtenerPropiedades();

  const coincidencias = propiedades.filter(
    p => normalizar(p.nombre_principal) === t || (p.nombre_en && normalizar(p.nombre_en) === t) || p.sinonimos.some(s => normalizar(s) === t)
  );

  if (coincidencias.length === 1) return { propiedad: coincidencias[0], estado: 'exacto' };
  if (coincidencias.length > 1) return { propiedad: null, estado: 'ambiguo', candidatos: coincidencias };
  return { propiedad: null, estado: 'no_encontrado' };
}
