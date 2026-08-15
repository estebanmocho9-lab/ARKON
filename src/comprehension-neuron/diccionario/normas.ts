// ============================================================
// src/comprehension-neuron/diccionario/normas.ts
// Registro de Organismos Normativos (NOR). A diferencia de
// materiales/propiedades/unidades, las normas NO son una lista
// cerrada (existen miles: ASTM C618, ASTM D5604, ISO 3262...) —
// por eso acá se identifica el ORGANISMO (ASTM, ISO, IRAM...), no
// cada norma puntual. La norma completa con su número queda en el
// texto de la Evidencia (evidencias.ts), no necesita ID propio.
//
// Envuelve PATRONES_NORMAS de diccionarios/normas.ts, sin tocarlo.
// ============================================================

import { PATRONES_NORMAS } from '../../extraction-neurons/diccionarios/normas';
import { Id, registroIds } from '../tipos/ids';
import { OrganismoNorma } from '../tipos/entidades';

// ── Nombre legible del organismo a partir del patrón regex — se
//    extrae la primera palabra de letras del patrón (ASTM, ISO,
//    IRAM, EN, DIN, UNE-EN), que es el nombre del organismo tal
//    como está escrito en el propio patrón de origen. ──────────────
function nombreOrganismo(patron: RegExp): string {
  const match = patron.source.match(/^([A-Z]+(?:-?[A-Z]+)?)/);
  return match ? match[1].replace(/\\s\?/g, '') : patron.source;
}

let cache: OrganismoNorma[] | null = null;

export function obtenerOrganismosNorma(): OrganismoNorma[] {
  if (cache) return cache;
  cache = PATRONES_NORMAS.map(patron => {
    const nombre = nombreOrganismo(patron);
    return {
      id: registroIds.obtenerOAsignar('NOR', nombre) as Id<'NOR'>,
      nombre,
      patron: patron.source,
    };
  });
  return cache;
}

export function obtenerOrganismoPorId(id: Id<'NOR'>): OrganismoNorma | null {
  return obtenerOrganismosNorma().find(n => n.id === id) ?? null;
}
