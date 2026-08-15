// ============================================================
// src/turso/guardarDatosSinClasificarTurso.ts
// Copia gemela de guardarDatosSinClasificarLote() de Supabase,
// pero para Turso. Se llama AL LADO de la función de Supabase.
// ============================================================

import { turso } from './tursoClient';
import { DatoSinClasificar } from '../extraction-neurons/supabase/guardarDatosSinClasificar';

function sanitizarTexto(valor: string | null): string | null {
  if (valor == null) return valor;
  return valor
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/[\uD800-\uDFFF]/g, '');
}

export async function guardarDatosSinClasificarTurso(
  neuronaId: string,
  documento: string,
  datos: DatoSinClasificar[]
): Promise<void> {
  if (datos.length === 0) return;

  try {
    await turso.batch(
      datos.map((d) => ({
        sql: `INSERT INTO datos_sin_clasificar
              (neurona_id, documento, pagina, fragmento, numero, unidad_o_etiqueta, revisado)
              VALUES (?, ?, ?, ?, ?, ?, 0)`,
        args: [
          neuronaId,
          documento,
          d.pagina,
          sanitizarTexto(d.fragmento),
          sanitizarTexto(d.numero) || null,
          sanitizarTexto(d.unidadDetectada),
        ],
      })),
      'write'
    );
  } catch (error) {
    console.error('Error guardando lote de datos sin clasificar en Turso:', error);
  }
}
