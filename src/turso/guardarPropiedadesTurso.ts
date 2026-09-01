// ============================================================
// src/turso/guardarPropiedadesTurso.ts
// Persistencia de PropiedadExtraida en Turso.
// La NE guarda en Turso y Supabase; Turso no usa un cliente mock.
// ============================================================

import { turso } from './tursoClient';
import { PropiedadExtraida } from '../extraction-neurons/base/tipos';

function sanitizarTexto(valor: unknown): unknown {
  if (typeof valor !== 'string') return valor;
  return valor
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/[\uD800-\uDFFF]/g, '');
}

function sanitizarRegistro(registro: PropiedadExtraida): PropiedadExtraida {
  const limpio: any = {};
  for (const [clave, valor] of Object.entries(registro)) {
    limpio[clave] = Array.isArray(valor)
      ? valor.map(sanitizarTexto)
      : sanitizarTexto(valor);
  }
  return limpio as PropiedadExtraida;
}

export async function guardarLotePropiedadesTurso(
  registros: PropiedadExtraida[]
): Promise<void> {
  if (registros.length === 0) return;

  const TAMANO_LOTE = 50;
  const registrosLimpios = registros.map(sanitizarRegistro);

  try {
    for (let i = 0; i < registrosLimpios.length; i += TAMANO_LOTE) {
      const lote = registrosLimpios.slice(i, i + TAMANO_LOTE);
      await turso.batch(
        lote.map((r) => ({
          sql: `INSERT INTO propiedades_extraidas (
                  neurona_id, documento, drive_file_id, pagina, capitulo,
                  nombre_propiedad, nombre_ingles, sinonimos, categoria, tipo_propiedad,
                  familia_material, subfamilia_material, material, componente,
                  unidad, simbolo, valor_encontrado, valor_minimo, valor_maximo,
                  condicion_ensayo, metodo_ensayo, instrumento_usado, norma,
                  ecuacion_formula, relacion_otras_propiedades, nivel_confianza,
                  origen_dato, observaciones, fragmento_texto
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            r.neurona_id, r.documento, r.drive_file_id, r.pagina, r.capitulo,
            r.nombre_propiedad, r.nombre_ingles, JSON.stringify(r.sinonimos), r.categoria, r.tipo_propiedad,
            r.familia_material, r.subfamilia_material, r.material, r.componente,
            r.unidad, r.simbolo, r.valor_encontrado, r.valor_minimo, r.valor_maximo,
            r.condicion_ensayo, r.metodo_ensayo, r.instrumento_usado, r.norma,
            r.ecuacion_formula, r.relacion_otras_propiedades, r.nivel_confianza,
            r.origen_dato, r.observaciones, r.fragmento_texto ?? null,
          ],
        })),
        'write'
      );
    }
  } catch (error: any) {
    console.error('❌ Error guardando propiedades en Turso:', error?.message || error);
    throw error;
  }
}

/**
 * Borra únicamente las propiedades de un documento antes de un reproceso.
 * Evita duplicados en Turso cuando se usa --reprocesar.
 */
export async function borrarPropiedadesTursoPorDocumento(driveFileId: string): Promise<void> {
  if (!driveFileId) return;
  await turso.execute({
    sql: 'DELETE FROM propiedades_extraidas WHERE drive_file_id = ?',
    args: [driveFileId],
  });
}
