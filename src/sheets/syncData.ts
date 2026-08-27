// ============================================================
// src/sheets/syncData.ts
// NORMALIZACION de Google Sheets = única fuente de vectores.
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

// Lista de materiales disponible directamente desde NORMALIZACION.
export async function listarMaterialesDesdeSheet(): Promise<string[]> {
  const vectors = await readVectorsFromSheet();
  return [...new Set(vectors.map(v => v.materialId.trim()).filter(Boolean))];
}
