// ============================================================
// src/turso/guardarConocimientoAmpliado.ts
// Guarda en Turso lo que encuentran los 5 extractores nuevos de
// extractorAmpliado.ts. Todo con estado 'pendiente'.
// ============================================================

import { turso } from './tursoClient';
import {
  EspecificacionDiseno,
  ReaccionQuimica,
  HallazgoExperimental,
  DatoMercado,
  TablaComparativa,
} from '../extraction-neurons/base/extractorAmpliado';

export async function guardarEspecificacionesLote(
  documento: string,
  pagina: number,
  items: EspecificacionDiseno[]
): Promise<void> {
  for (const it of items) {
    try {
      await turso.execute({
        sql: `INSERT INTO especificaciones_diseno
              (material, tipo_especificacion, contenido, documento, pagina, confianza, estado)
              VALUES (?, ?, ?, ?, ?, 0.6, 'pendiente')`,
        args: [it.material, it.tipo_especificacion, it.contenido, documento, pagina],
      });
    } catch (error) {
      console.error('Error guardando especificacion de diseno:', error);
    }
  }
}

export async function guardarReaccionesLote(
  documento: string,
  pagina: number,
  items: ReaccionQuimica[]
): Promise<void> {
  for (const it of items) {
    try {
      await turso.execute({
        sql: `INSERT INTO reacciones_quimicas
              (material, tipo_reaccion, contenido, documento, pagina, confianza, estado)
              VALUES (?, ?, ?, ?, ?, 0.6, 'pendiente')`,
        args: [it.material, it.tipo_reaccion, it.contenido, documento, pagina],
      });
    } catch (error) {
      console.error('Error guardando reaccion quimica:', error);
    }
  }
}

export async function guardarHallazgosLote(
  documento: string,
  pagina: number,
  items: HallazgoExperimental[]
): Promise<void> {
  for (const it of items) {
    try {
      await turso.execute({
        sql: `INSERT INTO hallazgos_experimentales
              (material, tipo_hallazgo, contenido, documento, pagina, confianza, estado)
              VALUES (?, ?, ?, ?, ?, 0.6, 'pendiente')`,
        args: [it.material, it.tipo_hallazgo, it.contenido, documento, pagina],
      });
    } catch (error) {
      console.error('Error guardando hallazgo experimental:', error);
    }
  }
}

export async function guardarDatosMercadoLote(
  documento: string,
  pagina: number,
  items: DatoMercado[]
): Promise<void> {
  for (const it of items) {
    try {
      await turso.execute({
        sql: `INSERT INTO datos_mercado
              (material, tipo_dato, contenido, documento, pagina, confianza, estado)
              VALUES (?, ?, ?, ?, ?, 0.6, 'pendiente')`,
        args: [it.material, it.tipo_dato, it.contenido, documento, pagina],
      });
    } catch (error) {
      console.error('Error guardando dato de mercado:', error);
    }
  }
}

export async function guardarTablasComparativasLote(
  documento: string,
  pagina: number,
  items: TablaComparativa[]
): Promise<void> {
  for (const it of items) {
    try {
      await turso.execute({
        sql: `INSERT INTO datos_comparativos
              (documento, pagina, texto_tabla, materiales_mencionados, propiedades_mencionadas, estado)
              VALUES (?, ?, ?, ?, ?, 'pendiente')`,
        args: [
          documento,
          pagina,
          it.texto_tabla,
          JSON.stringify(it.materiales_mencionados),
          JSON.stringify(it.propiedades_mencionadas),
        ],
      });
    } catch (error) {
      console.error('Error guardando tabla comparativa:', error);
    }
  }
}
