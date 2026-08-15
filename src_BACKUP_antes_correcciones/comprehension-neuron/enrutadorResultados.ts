// ============================================================
// src/comprehension-neuron/enrutadorResultados.ts
// Separa las hipótesis ya decididas por la Parte 4 en tres
// destinos, según `hipotesis.estado`. No vuelve a analizar, no
// vuelve a validar, no vuelve a decidir — solo mira un campo que
// ya está resuelto y clasifica.
// ============================================================

import { Hipotesis } from './tipos/hipotesis';

export interface ResultadoEnrutado {
  paraGuardar: Hipotesis[];
  paraRevision: Hipotesis[];
  descartados: Hipotesis[];
}

export function enrutarResultados(hipotesis: Hipotesis[]): ResultadoEnrutado {
  const resultado: ResultadoEnrutado = { paraGuardar: [], paraRevision: [], descartados: [] };

  for (const h of hipotesis) {
    if (h.estado === 'ACEPTADO') resultado.paraGuardar.push(h);
    else if (h.estado === 'PENDIENTE') resultado.paraRevision.push(h);
    else resultado.descartados.push(h);
  }

  return resultado;
}
