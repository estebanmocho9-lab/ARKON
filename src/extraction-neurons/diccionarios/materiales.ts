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

// ── Semilla genérica (familias de ciencia de materiales) ────────
export const MATERIALES_SEMILLA: EntradaMaterial[] = [
  { nombre_es: 'Acero', nombre_en: 'Steel', sinonimos: ['acero estructural', 'structural steel'], familia: 'Metal', subfamilia: 'Ferroso' },
  { nombre_es: 'Aluminio', nombre_en: 'Aluminum', sinonimos: ['aleación de aluminio', 'aluminum alloy'], familia: 'Metal', subfamilia: 'No ferroso' },
  { nombre_es: 'Cobre', nombre_en: 'Copper', sinonimos: [], familia: 'Metal', subfamilia: 'No ferroso' },
  { nombre_es: 'Polímero termoplástico', nombre_en: 'Thermoplastic', sinonimos: ['policarbonato', 'polycarbonate', 'PVC', 'polietileno', 'polyethylene'], familia: 'Polímero', subfamilia: 'Termoplástico' },
  { nombre_es: 'Polímero termoestable', nombre_en: 'Thermoset', sinonimos: ['resina epoxi', 'epoxy resin'], familia: 'Polímero', subfamilia: 'Termoestable' },
  { nombre_es: 'Cerámico técnico', nombre_en: 'Engineering ceramic', sinonimos: ['fine ceramics', 'cerámica técnica'], familia: 'Cerámico', subfamilia: 'Técnico' },
  { nombre_es: 'Cerámico poroso', nombre_en: 'Porous ceramic', sinonimos: ['ladrillo', 'brick', 'hormigón', 'concrete', 'piedra arenisca', 'sandstone'], familia: 'Cerámico', subfamilia: 'Poroso' },
  { nombre_es: 'Yeso', nombre_en: 'Gypsum', sinonimos: ['gypsum board', 'placa de yeso', 'sulfato de calcio hidratado'], familia: 'Cerámico', subfamilia: 'Yeso y derivados' },
  { nombre_es: 'Cal', nombre_en: 'Lime', sinonimos: ['cal hidratada', 'hydrated lime', 'cal aérea', 'cal hidráulica'], familia: 'Cerámico', subfamilia: 'Conglomerante' },
  { nombre_es: 'Cemento', nombre_en: 'Cement', sinonimos: ['cemento Portland', 'Portland cement'], familia: 'Cerámico', subfamilia: 'Conglomerante' },
  { nombre_es: 'Arcilla', nombre_en: 'Clay', sinonimos: [], familia: 'Cerámico', subfamilia: 'Arcilloso' },
  { nombre_es: 'Vidrio', nombre_en: 'Glass', sinonimos: ['silicato'], familia: 'Vidrio', subfamilia: 'Silicato' },
  { nombre_es: 'Madera', nombre_en: 'Wood', sinonimos: ['abeto', 'spruce', 'madera de pino', 'pine wood'], familia: 'Natural', subfamilia: 'Madera' },
  { nombre_es: 'Elastómero', nombre_en: 'Elastomer', sinonimos: ['caucho', 'rubber'], familia: 'Elastómero', subfamilia: 'Natural / Artificial' },
  { nombre_es: 'Espuma polimérica', nombre_en: 'Polymer foam', sinonimos: ['espuma', 'foam'], familia: 'Híbrido', subfamilia: 'Espuma' },
  { nombre_es: 'Compuesto CFRP', nombre_en: 'CFRP composite', sinonimos: ['fibra de carbono', 'carbon fiber reinforced'], familia: 'Híbrido', subfamilia: 'Compuesto' },
  { nombre_es: 'Compuesto GFRP', nombre_en: 'GFRP composite', sinonimos: ['fibra de vidrio', 'glass fiber reinforced'], familia: 'Híbrido', subfamilia: 'Compuesto' },
  { nombre_es: 'Granito', nombre_en: 'Granite', sinonimos: [], familia: 'Cerámico', subfamilia: 'Roca natural' },
  { nombre_es: 'Arena', nombre_en: 'Sand', sinonimos: [], familia: 'Natural', subfamilia: 'Árido' },
];

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
        const familia = primerValorPresente(fila, ['familia', 'tipo', 'family']) || 'Sin clasificar';
        if (!nombre) continue;
        combinado.push({
          nombre_es: nombre,
          nombre_en: nombre,
          sinonimos: [],
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
//    llenar de forma independiente de "material" ────────────────
export async function cargarDiccionarioComponentes(): Promise<EntradaMaterial[]> {
  const combinado: EntradaMaterial[] = [];

  try {
    const { data: componentes, error: errorComponentes } = await supabase
      .from('componentes_materiales')
      .select('*');

    if (errorComponentes) {
      console.warn(`⚠️  No se pudo leer componentes_materiales: ${errorComponentes.message}.`);
    } else {
      for (const fila of componentes || []) {
        const nombre = primerValorPresente(fila, ['nombre', 'nombre_componente', 'name']);
        if (!nombre) continue;
        combinado.push({
          nombre_es: nombre,
          nombre_en: nombre,
          sinonimos: [],
          familia: primerValorPresente(fila, ['familia', 'family']) || 'Componente',
          subfamilia: primerValorPresente(fila, ['subfamilia', 'subfamily']) || '',
        });
      }
    }
  } catch (err: any) {
    console.warn(`⚠️  Error consultando componentes_materiales: ${err.message}`);
  }

  return combinado;
}
