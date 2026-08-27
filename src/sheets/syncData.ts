// ============================================================
// src/sheets/syncData.ts
// NORMALIZACION de Google Sheets = única fuente de vectores.
// materiales_vectores queda fuera del flujo operativo.
// ============================================================

import { readVectorsFromSheet } from './readVectors';

function normalizarPropiedades(
  propiedades: Record<string, number | null>
): Record<string, number | null> {
  const normalizado: Record<string, number | null> = {};

  for (const [clave, valor] of Object.entries(propiedades ?? {})) {
    const valorNumerico = valor === null || valor === undefined ? null : Number(valor);
    normalizado[clave] = valorNumerico;

    const claveMin = clave.toLowerCase();
    normalizado[claveMin] = valorNumerico;
  }

  if ('indice_vacios_e' in normalizado) {
    normalizado['indice_vacios'] = normalizado['indice_vacios_e'];
  }
  if ('area_bet' in normalizado) {
    normalizado['area_BET'] = normalizado['area_bet'];
  }
  if ('tamaño_particula' in normalizado) {
    normalizado['tamano_particula'] = normalizado['tamaño_particula'];
  }

  return normalizado;
}

// ============================================================
// LECTURA OPERATIVA: DIRECTAMENTE DESDE GOOGLE SHEETS
// ============================================================
export async function getVectorFromSheet(
  materialId: string,
  estado?: string
): Promise<Record<string, number | null> | null> {
  const vectors = await readVectorsFromSheet();

  const candidatos = vectors.filter(
    v => String(v.materialId).trim().toUpperCase() === materialId.trim().toUpperCase()
  );

  const vector = estado
    ? candidatos.find(v => String(v.estado).trim().toLowerCase() === estado.trim().toLowerCase())
    : candidatos[0];

  if (!vector) {
    console.error(`❌ Vector ${materialId}${estado ? ` [${estado}]` : ''} no encontrado en NORMALIZACION`);
    return null;
  }

  return normalizarPropiedades(vector.propiedades);
}

// Alias temporal de compatibilidad para código externo.
// IMPORTANTE: ya NO consulta Supabase; lee NORMALIZACION directamente.
export async function getVectorFromSupabase(
  materialId: string,
  estado?: string
): Promise<Record<string, number | null> | null> {
  return getVectorFromSheet(materialId, estado);
}

// Lista de materiales disponible directamente desde NORMALIZACION.
export async function listarMaterialesSupabase(): Promise<string[]> {
  const vectors = await readVectorsFromSheet();
  return [...new Set(vectors.map(v => v.materialId.trim()).filter(Boolean))];
}

// La antigua sincronización NORMALIZACION → materiales_vectores queda
// deliberadamente desactivada. No se escribe ni se lee esa tabla.
export async function syncMaterialesToSupabase(): Promise<void> {
  throw new Error(
    'La sincronización a materiales_vectores está DESACTIVADA. NORMALIZACION de Google Sheets es la fuente única.'
  );
}
