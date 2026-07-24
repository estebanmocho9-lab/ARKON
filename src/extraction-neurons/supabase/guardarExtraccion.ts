// ============================================================
// src/extraction-neurons/supabase/guardarExtraccion.ts
// Guarda los hallazgos en la tabla propiedades_extraidas, y
// evita reprocesar un documento que ya fue cargado antes
// (chequeo por drive_file_id).
// ============================================================

import { supabase } from '../../supabase/client';
import { PropiedadExtraida } from '../base/tipos';

// ── ¿Ya existen filas de este documento en la tabla? ─────────────
export async function documentoYaProcesado(driveFileId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from('propiedades_extraidas')
    .select('id', { count: 'exact', head: true })
    .eq('drive_file_id', driveFileId);

  if (error) {
    console.warn(`⚠️  No se pudo verificar duplicados para ${driveFileId}: ${error.message}`);
    return false; // ante la duda, se procesa (mejor repetir que perder datos)
  }
  return (count || 0) > 0;
}

// ── Borra las filas de un documento (para el modo --reprocesar) ─
export async function borrarDocumento(driveFileId: string): Promise<void> {
  const { error } = await supabase
    .from('propiedades_extraidas')
    .delete()
    .eq('drive_file_id', driveFileId);

  if (error) {
    console.error(`❌ No se pudo borrar el documento ${driveFileId} para reprocesar: ${error.message}`);
  }
}

// ── Inserta un lote de registros ─────────────────────────────────
export async function guardarLote(registros: PropiedadExtraida[]): Promise<void> {
  if (registros.length === 0) return;

  const TAMANO_LOTE = 50;
  for (let i = 0; i < registros.length; i += TAMANO_LOTE) {
    const lote = registros.slice(i, i + TAMANO_LOTE);
    const { error } = await supabase.from('propiedades_extraidas').insert(lote);
    if (error) {
      console.error(`⚠️  Error guardando lote en Supabase: ${error.message}`);
    }
  }
}
