// ============================================================
// src/comprehension-neuron/tipos/coordenadas.ts
// El "Google Maps del PDF": dónde exactamente apareció cada cosa.
// Separado a propósito de qué ES cada cosa (eso vive en
// entidades.ts) — una coordenada nunca dice qué significa algo,
// solo dónde está.
//
// Importante: esto NO reemplaza tu sistema de bloques actual
// (gestorBloques.ts, BloqueMaterial) — lo referencia. BLQ acá
// apunta al mismo bloque de material que ya calcula
// comprension/gestorBloques.ts, no es un concepto nuevo paralelo.
// ============================================================

import { Id } from './ids';

export interface CoordenadaDocumento {
  id: Id<'DOC'>;
  nombreArchivo: string;
  driveFileId: string;
}

export interface CoordenadaPagina {
  id: Id<'PAG'>;
  documento: Id<'DOC'>;
  numero: number;
}

export interface CoordenadaBloque {
  id: Id<'BLQ'>;
  documento: Id<'DOC'>;
  // Mismo id numérico que ya asigna calcularBloques() en
  // gestorBloques.ts — se reusa, no se recalcula.
  bloqueIdOriginal: number;
  posicionInicio: number;
  posicionFin: number;
  tipoNodoDominante: string | null;
}

export interface CoordenadaTabla {
  id: Id<'TAB'>;
  bloque: Id<'BLQ'>;
  indice: number; // orden de la tabla dentro del bloque/página
  encabezados: string[] | null;
}

export interface CoordenadaFila {
  id: Id<'FIL'>;
  tabla: Id<'TAB'>;
  indice: number;
}

export interface CoordenadaColumna {
  id: Id<'COL'>;
  tabla: Id<'TAB'>;
  indice: number;
  encabezado: string | null;
}

// ── Coordenada completa de un punto del documento. No hace falta
//    convertirla en una cadena — se pasa como objeto, con lo que
//    corresponda lleno y el resto en null (una palabra en texto
//    corrido no tiene tabla/fila/columna, por ejemplo). ────────────
export interface CoordenadaCompleta {
  documento: Id<'DOC'>;
  pagina: Id<'PAG'> | null;
  bloque: Id<'BLQ'> | null;
  tabla: Id<'TAB'> | null;
  fila: Id<'FIL'> | null;
  columna: Id<'COL'> | null;
  posicionAbsoluta: number; // offset de caracter, igual que ya usa todo el sistema
}
