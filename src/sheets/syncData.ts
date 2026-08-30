// ============================================================
// src/sheets/syncData.ts
// NORMALIZACION de Google Sheets = única fuente de vectores.
// ============================================================

import { readVectorsFromSheet } from './readVectors';

function normalizarPropiedades(propiedades: Record<string, number | null>): Record<string, number | null> {
  const normalizado: Record<string, number | null> = {};

  for (const [clave, valor] of Object.entries(propiedades ?? {})) {
    const valorNumerico = valor === null || valor === undefined ? null : Number(valor);
    normalizado[clave] = valorNumerico;
    normalizado[clave.toLowerCase()] = valorNumerico;
  }

  if ('indice_vacios_e' in normalizado) normalizado['indice_vacios'] = normalizado['indice_vacios_e'];
  if ('area_bet' in normalizado) normalizado['area_BET'] = normalizado['area_bet'];
  if ('tamaño_particula' in normalizado) normalizado['tamano_particula'] = normalizado['tamaño_particula'];

  return normalizado;
}

// La hoja NORMALIZACION usa estados físicos de fila (Polvo/Fraguado),
// mientras que NeuronInput usa estados lógicos E01/E02/E03.
// No se cambia el ID ni se inventan valores: solo se selecciona la fila
// correspondiente del mismo material.
function estadosHojaPreferidos(estado?: string): string[] {
  if (!estado) return [];
  const e = estado.trim().toUpperCase();
  if (e === 'E01') return ['polvo', 'componente'];
  if (e === 'E02') return ['fraguado', 'fraguado_componente'];
  if (e === 'E03') return [];
  return [estado.trim().toLowerCase()];
}

export async function getVectorFromSheet(materialId: string, estado?: string): Promise<Record<string, number | null> | null> {
  const vectors = await readVectorsFromSheet();
  const candidatos = vectors.filter(v => String(v.materialId).trim().toUpperCase() === materialId.trim().toUpperCase());
  if (candidatos.length === 0) {
    console.error(`❌ Vector ${materialId}${estado ? ` [${estado}]` : ''} no encontrado en NORMALIZACION`);
    return null;
  }

  const preferidos = estadosHojaPreferidos(estado);
  const vector = preferidos.length > 0
    ? candidatos.find(v => preferidos.includes(String(v.estado).trim().toLowerCase()))
    : candidatos[0];

  if (!vector) {
    console.error(`❌ Vector ${materialId}${estado ? ` [${estado}]` : ''} no tiene una fila compatible en NORMALIZACION`);
    return null;
  }

  return normalizarPropiedades(vector.propiedades);
}

export async function listarMaterialesDesdeSheet(): Promise<string[]> {
  const vectors = await readVectorsFromSheet();
  return [...new Set(vectors.map(v => v.materialId.trim()).filter(Boolean))];
}