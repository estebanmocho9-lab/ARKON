// ============================================================
// src/comprehension-neuron/mapa/filas.ts
// Una fila detectada dentro de una tabla simple. Va antes que
// tablas.ts en el orden de lectura porque TablaDetectada (en
// tablas.ts) se arma a partir de FilaDetectada.
//
// El `id` usa el tipo Id<'FIL'> que ya definió la Parte 1 en
// tipos/ids.ts (coordenadas.ts ya tiene CoordenadaFila con ese
// mismo tipo) — el documento de la Parte 3 sugería `id: string`
// genérico, pero eso duplicaría un sistema de identidad que ya
// existe. Se usa el real.
// ============================================================

import { Id } from '../tipos/ids';

export interface FilaDetectada {
  id: Id<'FIL'>;
  textoOriginal: string;
  columnas: string[];
  posicionInicio: number;
  posicionFin: number;
}
