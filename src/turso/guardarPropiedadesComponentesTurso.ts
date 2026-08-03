// ============================================================
// src/turso/guardarPropiedadesComponentesTurso.ts
// Copia gemela de guardarLoteComponentes() de Supabase, pero para
// Turso. Se llama AL LADO de la función de Supabase — las
// propiedades de componentes quedan guardadas en los dos lados,
// igual que ya pasa con las de materiales.
// ============================================================

import { turso } from './tursoClient';
import { PropiedadExtraida } from '../extraction-neurons/base/tipos';

export async function guardarLoteComponentesTurso(
  registros: PropiedadExtraida[]
): Promise<void> {
  if (registros.length === 0) return;

  try {
    await turso.batch(
      registros.map((r) => ({
        sql: `INSERT INTO propiedades_componentes (
                neurona_id, documento, drive_file_id, pagina, capitulo,
                nombre_propiedad, nombre_ingles, sinonimos, categoria, tipo_propiedad,
                familia_material, subfamilia_material, material_asociado, componente,
                unidad, simbolo, valor_encontrado, valor_minimo, valor_maximo,
                condicion_ensayo, metodo_ensayo, instrumento_usado, norma,
                ecuacion_formula, relacion_otras_propiedades, nivel_confianza,
                origen_dato, observaciones
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          r.neurona_id, r.documento, r.drive_file_id, r.pagina, r.capitulo,
          r.nombre_propiedad, r.nombre_ingles, JSON.stringify(r.sinonimos), r.categoria, r.tipo_propiedad,
          r.familia_material, r.subfamilia_material, r.material, r.componente,
          r.unidad, r.simbolo, r.valor_encontrado, r.valor_minimo, r.valor_maximo,
          r.condicion_ensayo, r.metodo_ensayo, r.instrumento_usado, r.norma,
          r.ecuacion_formula, r.relacion_otras_propiedades, r.nivel_confianza,
          r.origen_dato, r.observaciones,
        ],
      })),
      'write'
    );
  } catch (error) {
    console.error('Error guardando lote de propiedades de componente en Turso:', error);
  }
}
