// ============================================================
// src/comprehension-neuron/mapa/tablas.ts
// Detecta tablas simples (separadas por tabs, 2+ espacios, o "|")
// dentro de un bloque de texto. Regla de oro (Sección 10 del
// documento): "NO SABER > INVENTAR" — si la estructura es
// ambigua, devuelve null y el texto se queda como texto corrido,
// nunca se fuerza una fila/columna dudosa.
// ============================================================

import { Id, registroIds } from '../tipos/ids';
import { FilaDetectada } from './filas';
import { ColumnaDetectada } from './columnas';

export interface TablaDetectada {
  id: Id<'TAB'>;
  encabezados: string[] | null;
  columnas: ColumnaDetectada[];
  filas: FilaDetectada[];
}

const SEPARADOR_PIPE = /\s*\|\s*/;
const SEPARADOR_ESPACIOS = /\s{2,}|\t+/;

// ── Separa una línea en celdas, probando primero "|" (más
//    inequívoco: nadie escribe "|" por casualidad en prosa) y
//    recién si no hay pipes, espacios múltiples/tabs. ─────────────
function separarCeldas(linea: string): string[] {
  if (linea.includes('|')) {
    return linea
      .split(SEPARADOR_PIPE)
      .map(c => c.trim())
      .filter(c => c.length > 0);
  }
  return linea
    .split(SEPARADOR_ESPACIOS)
    .map(c => c.trim())
    .filter(c => c.length > 0);
}

const UMBRAL_CONSISTENCIA = 0.7; // al menos 70% de las líneas candidatas deben compartir la cantidad de columnas del "modo"

export function detectarTablaEnBloque(textoBloque: string, documentoId: string, offsetBloque: number): TablaDetectada | null {
  const lineas = textoBloque.split('\n');
  let cursor = offsetBloque;

  const candidatas: { texto: string; celdas: string[]; inicio: number; fin: number }[] = [];
  for (const linea of lineas) {
    const inicio = cursor;
    const fin = cursor + linea.length;
    cursor = fin + 1; // +1 por el '\n' que se comió el split

    const celdas = separarCeldas(linea);
    // Una línea "candidata a fila de tabla" necesita al menos 2
    // celdas — una sola celda es indistinguible de texto corrido.
    if (celdas.length >= 2) {
      candidatas.push({ texto: linea, celdas, inicio, fin });
    }
  }

  if (candidatas.length < 2) return null; // hace falta encabezado + al menos una fila para llamarlo tabla

  // ── Consistencia de cantidad de columnas: el "modo" (la cantidad
  //    más frecuente) tiene que cubrir al menos UMBRAL_CONSISTENCIA
  //    de las líneas candidatas. Si no, la estructura es demasiado
  //    irregular — degradación segura, se devuelve null. ───────────
  const conteoColumnas = new Map<number, number>();
  for (const c of candidatas) {
    conteoColumnas.set(c.celdas.length, (conteoColumnas.get(c.celdas.length) ?? 0) + 1);
  }
  let cantidadModo = 0;
  let vecesModo = 0;
  for (const [cantidad, veces] of conteoColumnas) {
    if (veces > vecesModo) {
      cantidadModo = cantidad;
      vecesModo = veces;
    }
  }
  if (vecesModo / candidatas.length < UMBRAL_CONSISTENCIA) return null;

  const lineasConsistentes = candidatas.filter(c => c.celdas.length === cantidadModo);
  if (lineasConsistentes.length < 2) return null;

  const [encabezadoLinea, ...filasLineas] = lineasConsistentes;

  const idTabla = registroIds.obtenerOAsignar('TAB', `${documentoId}::tabla-${offsetBloque}`) as Id<'TAB'>;

  const columnas: ColumnaDetectada[] = encabezadoLinea.celdas.map((texto, indice) => ({
    id: registroIds.obtenerOAsignar('COL', `${documentoId}::tabla-${offsetBloque}::col-${indice}`) as Id<'COL'>,
    textoOriginal: texto,
    indice,
    posicionInicio: encabezadoLinea.inicio,
    posicionFin: encabezadoLinea.fin,
    encabezado: texto,
  }));

  const filas: FilaDetectada[] = filasLineas.map((linea, indice) => ({
    id: registroIds.obtenerOAsignar('FIL', `${documentoId}::tabla-${offsetBloque}::fil-${indice}`) as Id<'FIL'>,
    textoOriginal: linea.texto,
    columnas: linea.celdas,
    posicionInicio: linea.inicio,
    posicionFin: linea.fin,
  }));

  return {
    id: idTabla,
    encabezados: encabezadoLinea.celdas,
    columnas,
    filas,
  };
}
