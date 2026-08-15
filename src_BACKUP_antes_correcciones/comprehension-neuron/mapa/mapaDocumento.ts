// ============================================================
// src/comprehension-neuron/mapa/mapaDocumento.ts
// Traduce lo que YA calculó el sistema existente (gestorBloques.ts,
// la Memoria Temporal de la Neurona de Comprensión) al formato de
// coordenadas de la Neurona Central. No recalcula nada — no vuelve
// a detectar dónde empieza un bloque ni una página, solo consulta
// lo que ya existe y le pone IDs.
// ============================================================

import { MemoriaTemporalDocumento } from '../../extraction-neurons/comprension/tipos';
import { BloqueMaterial } from '../../extraction-neurons/comprension/gestorBloques';
import { Id, registroIds } from '../tipos/ids';
import { CoordenadaCompleta } from '../tipos/coordenadas';

// ── Encuentra, dentro de la lista de bloques que YA calculó
//    gestorBloques.ts, cuál contiene esta posición. No inventa
//    ningún criterio nuevo de qué es un bloque. ────────────────────
function encontrarBloque(posicion: number, bloques: BloqueMaterial[]): BloqueMaterial | null {
  return bloques.find(b => posicion >= b.inicio && posicion < b.fin) ?? null;
}

// ── Firma tal como la pide el documento: documentoId, posicion,
//    memoria, bloques. Se agrega un 5º parámetro OPCIONAL,
//    offsetsPorPagina, porque ninguno de los 4 parámetros
//    originales trae esa información — `memoria` no guarda
//    offsets de página (eso vive hoy en NeuronExtraccionBase.ts,
//    calculado ahí mismo antes de llamar a analizarPagina/bloques,
//    y esta Parte 3 tiene explícitamente prohibido modificar ese
//    archivo). Sin ese parámetro, la coordenada de PÁGINA queda en
//    null — no se inventa un número de página sin evidencia. ──────
export function armarCoordenada(
  documentoId: string,
  posicion: number,
  memoria: MemoriaTemporalDocumento,
  bloques: BloqueMaterial[],
  offsetsPorPagina?: number[]
): CoordenadaCompleta {
  const doc = registroIds.obtenerOAsignar('DOC', documentoId) as Id<'DOC'>;

  const bloqueEncontrado = encontrarBloque(posicion, bloques);
  // El BLQ se identifica con documentoId + el número de bloque que
  // ya asignó gestorBloques.ts — así el mismo bloque siempre
  // resuelve al mismo BLQ-XXXXXX, sin duplicar el criterio de qué
  // es un bloque.
  const blq = bloqueEncontrado
    ? (registroIds.obtenerOAsignar('BLQ', `${documentoId}::bloque-${bloqueEncontrado.id}`) as Id<'BLQ'>)
    : null;

  let pag: Id<'PAG'> | null = null;
  if (offsetsPorPagina && offsetsPorPagina.length > 0) {
    let numeroPagina = 1;
    for (let i = 0; i < offsetsPorPagina.length; i++) {
      if (offsetsPorPagina[i] <= posicion) numeroPagina = i + 1;
      else break;
    }
    pag = registroIds.obtenerOAsignar('PAG', `${documentoId}::pagina-${numeroPagina}`) as Id<'PAG'>;
  }

  return {
    documento: doc,
    pagina: pag,
    bloque: blq,
    tabla: null, // lo completa quien llame, si detectó una tabla ahí (ver mapa/tablas.ts)
    fila: null,
    columna: null,
    posicionAbsoluta: posicion,
  };
}
