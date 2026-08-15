// ============================================================
// src/comprehension-neuron/mapa/coordenadasEspaciales.ts
// Solo la interfaz, tal como pide el documento (Sección 13) — sin
// implementación todavía. Extraer coordenadas x/y reales de un
// PDF (dónde cae cada palabra en la página, en píxeles/puntos)
// queda pendiente para una parte futura, cuando haga falta
// distinguir columnas por posición física y no solo por texto.
// ============================================================

export interface CoordenadaEspacial {
  pagina: number;
  x?: number;
  y?: number;
  ancho?: number;
  alto?: number;
}
