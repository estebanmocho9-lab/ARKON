// ============================================================
// src/comprehension-neuron/mapa/columnas.ts
// Una columna detectada. Igual que en filas.ts, usa Id<'COL'> de
// la Parte 1 en vez de un id string genérico nuevo.
// ============================================================

import { Id } from '../tipos/ids';

export interface ColumnaDetectada {
  id: Id<'COL'>;
  textoOriginal: string;
  indice: number;
  posicionInicio: number;
  posicionFin: number;
  // No estaba explícito en el documento, pero hace falta para
  // responder la pregunta que el propio documento plantea en la
  // Sección 12 ("¿la propiedad aparece como encabezado de la
  // columna?") — sin este campo, ninguna función podría contestar
  // esa pregunta.
  encabezado: string | null;
}
