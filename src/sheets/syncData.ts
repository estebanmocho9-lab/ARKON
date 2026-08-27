// ============================================================
// src/sheets/syncData.ts
// NORMALIZACION de Google Sheets = única fuente de vectores.
// Supabase.materiales_vectores = copia operativa sincronizada.
// ============================================================

import { supabase } from '../supabase/client';
import { readVectorsFromSheet } from './readVectors';

// readVectorsFromSheet ya entrega las propiedades con los nombres
// normalizados que usa el motor. No mantenemos un segundo mapeo parcial:
// toda propiedad cuyo nombre coincida con una columna de materiales_vectores
// se copia directamente.
const COLUMNAS_CONTROL = new Set([
  'id_material',
  'estado',
  'actualizado_en',
  'id',
  'creado_en',
]);

function esIdValido(id: string): boolean {
  const s = id.trim();
  return !!s && !s.startsWith('▶') && !s.startsWith('🎯') && s !== '#REF!';
}

function construirRegistro(vector: any) {
  const idMaterial = String(vector.materialId ?? '').trim();
  const estado = String(vector.estado ?? 'Desconocido').trim() || 'Desconocido';
  const propiedades: Record<string, number | null> = {};

  for (const [clave, valor] of Object.entries(vector.propiedades ?? {})) {
    const nombre = clave.toLowerCase().trim();
    if (!nombre || COLUMNAS_CONTROL.has(nombre)) continue;
    propiedades[nombre] = valor === null || valor === undefined ? null : Number(valor);
  }

  return {
    id_material: idMaterial,
    estado,
    ...propiedades,
    actualizado_en: new Date().toISOString(),
  };
}

export async function syncMaterialesToSupabase(): Promise<void> {
  console.log('\n🔄 NORMALIZACION Google Sheets → materiales_vectores\n');

  const vectors = await readVectorsFromSheet();
  if (vectors.length === 0) {
    throw new Error('NORMALIZACION no devolvió vectores; se cancela la sincronización para no borrar datos válidos.');
  }

  const registros = vectors
    .filter((v) => esIdValido(String(v.materialId ?? '')))
    .map(construirRegistro);

  if (registros.length === 0) {
    throw new Error('NORMALIZACION no contiene IDs de materiales válidos.');
  }

  // NORMALIZACION es la autoridad. Eliminamos la copia anterior para que
  // no sobrevivan filas/materiales que ya no existen en Sheets ni valores
  // antiguos de propiedades que ahora estén vacíos.
  const { error: deleteError } = await supabase
    .from('materiales_vectores')
    .delete()
    .neq('id_material', '__NO_BORRAR__');

  if (deleteError) {
    throw new Error(`No se pudo limpiar materiales_vectores antes de sincronizar: ${deleteError.message}`);
  }

  let sincronizados = 0;
  let errores = 0;

  for (const registro of registros) {
    const { error } = await supabase
      .from('materiales_vectores')
      .upsert(registro, { onConflict: 'id_material,estado' });

    if (error) {
      errores++;
      console.error(`❌ ${registro.id_material} [${registro.estado}]: ${error.message}`);
      continue;
    }

    const datos = Object.entries(registro)
      .filter(([k, v]) => !COLUMNAS_CONTROL.has(k) && v !== null)
      .length;
    console.log(`✅ ${registro.id_material} [${registro.estado}] — ${datos} propiedades`);
    sincronizados++;
  }

  console.log(`\n📊 Sincronización final: ${sincronizados}/${registros.length} filas, ${errores} errores.`);

  if (errores > 0) {
    throw new Error(`La sincronización terminó con ${errores} errores; revisar los registros anteriores.`);
  }
}

// La lectura operativa sigue pasando por Supabase para que el motor no tenga
// que consultar Sheets por cada neurona. La única escritura de vectores es
// NORMALIZACION → materiales_vectores mediante syncMaterialesToSupabase().
export async function getVectorFromSupabase(
  materialId: string,
  estado?: string
): Promise<Record<string, number | null> | null> {
  let query = supabase
    .from('materiales_vectores')
    .select('*')
    .eq('id_material', materialId);

  if (estado) query = query.eq('estado', estado);

  const { data, error } = estado
    ? await query.single()
    : await query.order('estado', { ascending: true }).limit(1).maybeSingle();

  if (error || !data) {
    console.error(`❌ Vector ${materialId}${estado ? ` [${estado}]` : ''} no encontrado en materiales_vectores`);
    return null;
  }

  const raw = data as Record<string, any>;
  const normalizado: Record<string, number | null> = {};

  for (const [clave, valor] of Object.entries(raw)) {
    if (clave === 'id_material' || clave === 'estado' || clave === 'actualizado_en') continue;
    normalizado[clave] = valor === null || valor === undefined ? null : Number(valor);
    const claveMin = clave.toLowerCase();
    normalizado[claveMin] = normalizado[clave];
  }

  if ('indice_vacios_e' in normalizado) normalizado['indice_vacios'] = normalizado['indice_vacios_e'];
  if ('area_bet' in normalizado) normalizado['area_BET'] = normalizado['area_bet'];
  if ('tamaño_particula' in normalizado) normalizado['tamano_particula'] = normalizado['tamaño_particula'];

  return normalizado;
}

export async function listarMaterialesSupabase(): Promise<string[]> {
  const { data, error } = await supabase
    .from('materiales_vectores')
    .select('id_material');

  if (error || !data) return [];
  return [...new Set(data.map((row: any) => row.id_material))];
}

if (require.main === module) {
  syncMaterialesToSupabase()
    .then(() => {
      console.log('✅ Sincronización completada.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Error en sincronización:', err.message);
      process.exit(1);
    });
}