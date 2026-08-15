// ============================================================
// src/turso/guardarConocimiento.ts
// Guarda en Turso lo que encuentra extractorConocimiento.ts.
// Todo entra con estado = 'pendiente' — el agente (motorEncadenamiento.ts)
// solo usa lo que tenga estado = 'validada'. Nada se activa solo.
// ============================================================

import { turso } from './tursoClient';
import { ConocimientoCandidato, ReglaCandidata } from '../extraction-neurons/base/extractorConocimiento';

export async function guardarConocimientoLote(
  documento: string,
  pagina: number,
  candidatos: ConocimientoCandidato[]
): Promise<void> {
  if (candidatos.length === 0) return;

  for (const c of candidatos) {
    try {
      await turso.execute({
        sql: `INSERT INTO conocimiento_material
              (material, tipo_conocimiento, contenido, porcentaje, mecanismo, documento, pagina, confianza, estado)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
        args: [
          c.material,
          c.tipo_conocimiento,
          c.contenido,
          c.porcentaje,
          c.mecanismo,
          documento,
          pagina,
          0.65, // confianza inicial moderada, se ajusta al validar
        ],
      });
    } catch (error) {
      console.error('Error guardando conocimiento conceptual en Turso:', error);
    }
  }
}

export async function guardarReglasLote(
  documento: string,
  pagina: number,
  reglas: ReglaCandidata[]
): Promise<void> {
  if (reglas.length === 0) return;

  for (const r of reglas) {
    try {
      await turso.execute({
        sql: `INSERT INTO reglas_extraidas
              (propiedad_causa, direccion_causa, propiedad_efecto, direccion_efecto, condicion, documento, pagina, confianza, estado)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
        args: [
          r.propiedad_causa,
          r.direccion_causa,
          r.propiedad_efecto,
          r.direccion_efecto,
          r.condicion,
          documento,
          pagina,
          r.confianza,
        ],
      });
    } catch (error) {
      console.error('Error guardando regla candidata en Turso:', error);
    }
  }
}
