// ============================================================
// src/sheets/syncData.ts
// NORMALIZACION de Google Sheets = única fuente de vectores.
// ============================================================

import { getRealVector, listRealMaterialIds } from './realVectors';

export async function getVectorFromSheet(materialId: string, estado?: string): Promise<Record<string, number | null> | null> {
  return getRealVector(materialId, estado);
}

export async function listarMaterialesDesdeSheet(): Promise<string[]> {
  return listRealMaterialIds();
}
