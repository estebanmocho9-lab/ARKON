// ============================================================
// src/turso/guardarConocimientoESP001.ts
// Guarda en Turso lo que encuentran los 10 extractores nuevos de
// extractorESP001.ts. Todo con estado 'pendiente', mismo criterio
// que guardarConocimientoAmpliado.ts (que no se tocó).
// ============================================================

import { turso } from './tursoClient';
import {
  SignificadoPropiedad,
  FuncionPropiedad,
  FactorModificador,
  RelacionPropiedad,
  ProcesoPropiedad,
  AplicacionPropiedad,
  VentajaPropiedad,
  LimitacionPropiedad,
  IdentidadExtendida,
  CitaBibliografica,
  EstadoNaturalPropiedad,
} from '../extraction-neurons/base/extractorESP001';

async function guardarGenerico(
  tabla: string,
  documento: string,
  pagina: number,
  items: { material: string; tipo: string; contenido: string }[],
  etiquetaError: string
): Promise<void> {
  if (items.length === 0) return;
  try {
    await turso.batch(
      items.map((it) => ({
        sql: `INSERT INTO ${tabla}
              (material, tipo, contenido, documento, pagina, confianza, estado)
              VALUES (?, ?, ?, ?, ?, 0.6, 'pendiente')`,
        args: [it.material, it.tipo, it.contenido, documento, pagina],
      })),
      'write'
    );
  } catch (error) {
    console.error(`Error guardando lote de ${etiquetaError}:`, error);
  }
}

export async function guardarSignificadoLote(documento: string, pagina: number, items: SignificadoPropiedad[]): Promise<void> {
  await guardarGenerico('significado_propiedad', documento, pagina, items, 'significado de propiedad');
}

export async function guardarFuncionLote(documento: string, pagina: number, items: FuncionPropiedad[]): Promise<void> {
  await guardarGenerico('funcion_propiedad', documento, pagina, items, 'función de propiedad');
}

export async function guardarFactoresModificadoresLote(documento: string, pagina: number, items: FactorModificador[]): Promise<void> {
  await guardarGenerico('factores_modificadores', documento, pagina, items, 'factor modificador');
}

export async function guardarRelacionesLote(documento: string, pagina: number, items: RelacionPropiedad[]): Promise<void> {
  await guardarGenerico('relaciones_propiedad', documento, pagina, items, 'relación de propiedad');
}

export async function guardarProcesosLote(documento: string, pagina: number, items: ProcesoPropiedad[]): Promise<void> {
  await guardarGenerico('procesos_propiedad', documento, pagina, items, 'proceso de propiedad');
}

export async function guardarAplicacionesLote(documento: string, pagina: number, items: AplicacionPropiedad[]): Promise<void> {
  await guardarGenerico('aplicaciones_propiedad', documento, pagina, items, 'aplicación de propiedad');
}

export async function guardarVentajasLote(documento: string, pagina: number, items: VentajaPropiedad[]): Promise<void> {
  await guardarGenerico('ventajas_propiedad', documento, pagina, items, 'ventaja de propiedad');
}

export async function guardarLimitacionesLote(documento: string, pagina: number, items: LimitacionPropiedad[]): Promise<void> {
  await guardarGenerico('limitaciones_propiedad', documento, pagina, items, 'limitación de propiedad');
}

export async function guardarIdentidadExtendidaLote(documento: string, pagina: number, items: IdentidadExtendida[]): Promise<void> {
  await guardarGenerico('identidad_extendida', documento, pagina, items, 'identidad extendida');
}

export async function guardarBibliografiaLote(documento: string, pagina: number, items: CitaBibliografica[]): Promise<void> {
  await guardarGenerico('bibliografia_propiedad', documento, pagina, items, 'cita bibliográfica');
}

// Estado natural tiene forma distinta (no tiene "tipo"/"contenido"),
// así que usa su propia inserción en vez de guardarGenerico.
export async function guardarEstadoNaturalLote(documento: string, pagina: number, items: EstadoNaturalPropiedad[]): Promise<void> {
  if (items.length === 0) return;
  try {
    await turso.batch(
      items.map((it) => ({
        sql: `INSERT INTO estado_natural_material
              (material, estado_natural, documento, pagina, confianza, estado)
              VALUES (?, ?, ?, ?, 0.6, 'pendiente')`,
        args: [it.material, it.estado_natural, documento, pagina],
      })),
      'write'
    );
  } catch (error) {
    console.error('Error guardando lote de estado natural:', error);
  }
}
