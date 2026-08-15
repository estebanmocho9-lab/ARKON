// ============================================================
// src/extraction-neurons/diccionarios/materiales.ts
// Diccionario de materiales y familias. Dos fuentes, combinadas:
//
//  1. Semilla genérica de ciencia de materiales (abajo), para que
//     el sistema reconozca materiales que aparecen en los libros
//     aunque no sean de tu catálogo propio (los libros hablan de
//     materiales en general).
//
//  2. Tu catálogo real de Supabase (catalogo_materiales,
//     componentes_materiales), leído EN VIVO cada vez que corre
//     una neurona — no se copia a mano, así que si agregás
//     materiales nuevos en Supabase, el sistema los toma solo en
//     la próxima corrida.
//
// Esto solo LEE esas tablas (select), nunca las modifica.
// ============================================================

import { EntradaMaterial } from '../base/tipos';
import { supabase } from '../../supabase/client';

// ── Semilla genérica de materiales de referencia (fuera de tu
//    catálogo). DESACTIVADA — se estaba superponiendo con tus 21
//    materiales reales y generando ruido en la extracción (Acero,
//    Arena, Aluminio, Yeso genérico, Cal genérica, etc. no son
//    parte de tu catálogo y NO deben aparecer en ningún registro).
//    Los ÚNICOS materiales que debe reconocer el sistema son los
//    21 que están cargados en catalogo_materiales de Supabase:
//    Talco Industrial, Cemento Portland, Arcilla Expandida, Cal
//    Hidráulica, Perlita Expandida, Bentonita Sódica, Vermiculita,
//    Humo de Sílice, Vidrio Molido, Yeso Molido, Resina Epoxi,
//    Resina Poliéster, Tiza Molida, Fibra de Vidrio, Cartón
//    Triturado, Queratina, Piedra Pómez, Bagazo de Caña, Carbón
//    Activado, Ocre Rojo, Ocre Amarillo — y nada más que esos 21.
export const MATERIALES_SEMILLA: EntradaMaterial[] = [];

// ── Toma el primer valor presente entre varias claves candidatas ─
function primerValorPresente(obj: any, claves: string[]): string | null {
  for (const clave of claves) {
    if (obj[clave] !== undefined && obj[clave] !== null && obj[clave] !== '') {
      return String(obj[clave]);
    }
  }
  return null;
}

// ── Lee catalogo_materiales de tu propia Supabase y lo combina
//    con la semilla genérica de materiales ──────────────────────
export async function cargarDiccionarioMateriales(): Promise<EntradaMaterial[]> {
  const combinado: EntradaMaterial[] = [...MATERIALES_SEMILLA];

  try {
    const { data: catalogo, error: errorCatalogo } = await supabase
      .from('catalogo_materiales')
      .select('*');

    if (errorCatalogo) {
      console.warn(`⚠️  No se pudo leer catalogo_materiales: ${errorCatalogo.message}. Se sigue solo con la semilla genérica.`);
    } else {
      for (const fila of catalogo || []) {
        const nombre = primerValorPresente(fila, ['nombre', 'nombre_material', 'name']);
        if (!nombre) continue;
        const nombreIngles = primerValorPresente(fila, ['nombre_en', 'nombre_ingles', 'name_en']) || nombre;
        const familia = primerValorPresente(fila, ['familia', 'tipo', 'family']) || 'Sin clasificar';
        combinado.push({
          nombre_es: nombre,
          nombre_en: nombreIngles,
          sinonimos: Array.isArray(fila.sinonimos) ? fila.sinonimos : [],
          familia,
          subfamilia: primerValorPresente(fila, ['subfamilia', 'subfamily']) || '',
        });
      }
    }
  } catch (err: any) {
    console.warn(`⚠️  Error consultando catalogo_materiales: ${err.message}`);
  }

  return combinado;
}

// ── Lee componentes_materiales de tu Supabase, POR SEPARADO de
//    los materiales — para que el campo "componente" se pueda
//    llenar de forma independiente de "material". Además, usa la
//    relación real que ya tenés (id_material) para saber a qué
//    material pertenece cada componente — así, si un libro
//    menciona un componente puntual (ej. "Alita") sin nombrar el
//    material completo, el sistema puede inferir solo que
//    pertenece al "Cemento Portland" ────────────────────────────
export async function cargarDiccionarioComponentes(): Promise<EntradaMaterial[]> {
  const combinado: EntradaMaterial[] = [];

  try {
    // Traemos primero el catálogo de materiales para poder resolver
    // el nombre del material padre a partir de id_material
    const { data: catalogo } = await supabase.from('catalogo_materiales').select('*');
    const mapaIdAMaterial = new Map<string, string>();
    for (const fila of catalogo || []) {
      const id = primerValorPresente(fila, ['id_material', 'id']);
      const nombre = primerValorPresente(fila, ['nombre', 'nombre_material', 'name']);
      if (id && nombre) mapaIdAMaterial.set(id, nombre);
    }

    const { data: componentes, error: errorComponentes } = await supabase
      .from('componentes_materiales')
      .select('*');

    if (errorComponentes) {
      console.warn(`⚠️  No se pudo leer componentes_materiales: ${errorComponentes.message}.`);
    } else {
      for (const fila of componentes || []) {
        const nombre = primerValorPresente(fila, ['nombre', 'nombre_componente', 'name']);
        if (!nombre) continue;
        const idMaterial = primerValorPresente(fila, ['id_material']);
        const materialPadre = idMaterial ? mapaIdAMaterial.get(idMaterial) || null : null;

        combinado.push({
          nombre_es: nombre,
          nombre_en: nombre,
          sinonimos: [],
          familia: primerValorPresente(fila, ['familia', 'family']) || 'Componente',
          subfamilia: primerValorPresente(fila, ['subfamilia', 'subfamily']) || '',
          materialAsociado: materialPadre,
        });
      }
    }
  } catch (err: any) {
    console.warn(`⚠️  Error consultando componentes_materiales: ${err.message}`);
  }

  return combinado;
}
