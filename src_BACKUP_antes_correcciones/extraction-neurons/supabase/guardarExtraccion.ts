// ============================================================
// src/extraction-neurons/supabase/guardarExtraccion.ts
// Guarda los hallazgos en la tabla propiedades_extraidas, y
// evita reprocesar un documento que ya fue cargado antes
// (chequeo por drive_file_id).
// ============================================================

import { supabase } from '../../supabase/client';
import { PropiedadExtraida } from '../base/tipos';

// ── Limpia caracteres inválidos que a veces trae el texto extraído
//    de un PDF (control characters, "surrogates" sueltos de Unicode
//    corrupto) y que Postgres/Supabase rechaza al insertar con un
//    error de "unsupported Unicode escape sequence" ─────────────
function sanitizarTexto<T>(valor: T): T {
  if (typeof valor !== 'string') return valor;
  const limpio = valor
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/[\uD800-\uDFFF]/g, '');
  return limpio as unknown as T;
}

function sanitizarRegistro(registro: PropiedadExtraida): PropiedadExtraida {
  const limpio: any = {};
  for (const [clave, valor] of Object.entries(registro)) {
    if (Array.isArray(valor)) {
      limpio[clave] = valor.map(v => sanitizarTexto(v));
    } else {
      limpio[clave] = sanitizarTexto(valor);
    }
  }
  return limpio as PropiedadExtraida;
}

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
    const lote = registros.slice(i, i + TAMANO_LOTE).map(sanitizarRegistro);
    const { error } = await supabase.from('propiedades_extraidas').insert(lote);
    if (error) {
      console.error(`⚠️  Error guardando lote en Supabase: ${error.message}`);
    }
  }
}
