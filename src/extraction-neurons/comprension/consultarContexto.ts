// ============================================================
// src/extraction-neurons/comprension/consultarContexto.ts
// Dada una Memoria Temporal ya construida, responde en O(log n)
// "¿qué material/capítulo/sección está activo en esta posición
// exacta del texto?" — sin volver a leer ni recalcular nada.
// Esto es lo que usará motorExtraccion.ts en cada hallazgo.
// ============================================================

import { MemoriaTemporalDocumento, ContextoEnPosicion } from './tipos';

export function consultarContextoEnPosicion(
  memoria: MemoriaTemporalDocumento,
  posicion: number
): ContextoEnPosicion {
  const linea = memoria.lineaDeTiempo;

  if (linea.length === 0) {
    return {
      materialActivo: null,
      familiaActiva: null,
      subfamiliaActiva: null,
      capituloActivo: null,
      seccionActiva: null,
      enTabla: false,
      enFigura: false,
      tipoNodoActivo: null,
      origenMaterialActivo: 'sin_determinar',
    };
  }

  // Búsqueda binaria: el ÚLTIMO checkpoint cuya posición sea <= a
  // la posición consultada (línea ya viene ordenada ascendente).
  let lo = 0;
  let hi = linea.length - 1;
  let resultado = 0;

  while (lo <= hi) {
    const medio = Math.floor((lo + hi) / 2);
    if (linea[medio].posicion <= posicion) {
      resultado = medio;
      lo = medio + 1;
    } else {
      hi = medio - 1;
    }
  }

  const cp = linea[resultado];
  return {
    materialActivo: cp.materialActivo,
    familiaActiva: cp.familiaActiva,
    subfamiliaActiva: cp.subfamiliaActiva,
    capituloActivo: cp.capituloActivo,
    seccionActiva: cp.seccionActiva,
    enTabla: cp.enTabla,
    enFigura: cp.enFigura,
    tipoNodoActivo: cp.tipoNodoActivo,
    origenMaterialActivo: cp.origenMaterialActivo,
  };
}
