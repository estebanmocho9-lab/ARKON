// ============================================================
// src/turso/guardarDatosSinClasificarTurso.ts
// Copia gemela de guardarDatosSinClasificarLote() de Supabase,
// pero para Turso. Se llama AL LADO de la función de Supabase.
// ============================================================

import { turso } from './tursoClient';
import { DatoSinClasificar } from '../extraction-neurons/supabase/guardarDatosSinClasificar';

export async function guardarDatosSinClasificarTurso(
  neuronaId: string,
  documento: string,
  datos: DatoSinClasificar[]
): Promise<void> {
  if (datos.length === 0) return;

  for (const d of datos) {
    try {
      await turso.execute({
        sql: `INSERT INTO datos_sin_clasificar
              (neurona_id, documento, pagina, fragmento, numero, unidad_o_etiqueta, revisado)
              VALUES (?, ?, ?, ?, ?, ?, 0)`,
        args: [neuronaId, documento, d.pagina, d.fragmento, d.numero || null, d.unidadDetectada],
      });
    } catch (error) {
      console.error('Error guardando dato sin clasificar en Turso:', error);
    }
  }
}
