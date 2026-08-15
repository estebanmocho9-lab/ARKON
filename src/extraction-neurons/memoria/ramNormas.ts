// ============================================================
// src/extraction-neurons/memoria/ramNormas.ts
// Mini-neurona de Normas.
//
// Qué reconoce: ASTM, ISO, IRAM, EN, DIN, UNE-EN, etc. — no es
// una lista cerrada de normas (existen miles), son los mismos
// patrones de FORMATO que ya tenías en
// diccionarios/normas.ts (PATRONES_NORMAS), sin tocarlos.
// Qué guarda: cada norma encontrada en el bloque completo, con
// su posición.
// Qué entrega: la lista completa de normas vistas en el bloque
// (un mismo bloque puede citar varias normas distintas, ej. una
// tabla comparativa ASTM vs ISO para la misma propiedad).
//
// Diferencia con el motor actual: buscarNorma() de
// motorExtraccion.ts devuelve solo la PRIMERA norma que
// encuentra en la ventana de 150 caracteres alrededor de una
// propiedad. Acá se escanea el bloque completo y se devuelven
// TODAS, con posición — el Consolidador es quien decide después
// cuál le corresponde a cada propiedad según cercanía, en vez de
// quedarse con la primera que aparezca en todo el documento.
// ============================================================

import { PATRONES_NORMAS } from '../diccionarios/normas';
import { Evento, DatoNorma } from '../eventos/tipos';
import { HallazgoRAM, RAM } from './tipos';

// ── Detecta TODAS las normas del bloque completo, recorriendo
//    los mismos patrones de PATRONES_NORMAS uno por uno. Se
//    reinicia lastIndex de cada regex antes de usarla porque son
//    compartidas (globales) y si no se resetean, arrastran
//    posición entre llamadas distintas. ───────────────────────────
function detectarMenciones(texto: string): HallazgoRAM<DatoNorma>[] {
  const hallazgos: HallazgoRAM<DatoNorma>[] = [];

  for (const patronOriginal of PATRONES_NORMAS) {
    const patron = new RegExp(patronOriginal.source, patronOriginal.flags.includes('g') ? patronOriginal.flags : patronOriginal.flags + 'g');
    let match: RegExpExecArray | null;
    while ((match = patron.exec(texto)) !== null) {
      hallazgos.push({
        dato: { norma: match[0] },
        posicion: match.index,
        origen: 'parrafo',
      });
      // Salvavidas: si el patrón matcheara string vacío por algún
      // motivo, evita loop infinito.
      if (match[0].length === 0) patron.lastIndex++;
    }
  }

  hallazgos.sort((a, b) => a.posicion - b.posicion);
  return hallazgos;
}

export function crearRAMNormas(): RAM<DatoNorma> {
  let hallazgosBloque: HallazgoRAM<DatoNorma>[] = [];

  function agregar(evento: Evento<DatoNorma>): void {
    hallazgosBloque.push({ dato: evento.dato, posicion: evento.posicion, origen: evento.origen });
  }

  function activarDesdeTexto(texto: string, offsetBloque: number): void {
    const detectados = detectarMenciones(texto);
    for (const h of detectados) {
      hallazgosBloque.push({ ...h, posicion: offsetBloque + h.posicion });
    }
  }

  function consultar(): HallazgoRAM<DatoNorma>[] {
    return [...hallazgosBloque];
  }

  function entregar(): HallazgoRAM<DatoNorma>[] {
    const resultado = [...hallazgosBloque];
    hallazgosBloque = [];
    return resultado;
  }

  function cantidadAcumulada(): number {
    return hallazgosBloque.length;
  }

  return {
    nombre: 'RAM-Normas',
    agregar,
    consultar,
    entregar,
    cantidadAcumulada,
    // @ts-expect-error — método propio de escaneo, ídem las otras RAM.
    activarDesdeTexto,
  };
}
