// ============================================================
// src/extraction-neurons/memoria/ramCondicionEnsayo.ts
// Mini-neurona de Condición de Ensayo / Instrumento / Método.
// Es la fusión de las dos últimas que mencionaba el PDF (punto
// 3.6): condición de ensayo + instrumento + método en una sola,
// porque no son tan centrales como las otras cuatro y comparten
// la misma forma de trabajar.
//
// Qué reconoce:
//  - Frases de condición ("a 20°C", "bajo condiciones de...") —
//    mismos patrones fijos que ya tenías en
//    buscarCondicionEnsayo() de motorExtraccion.ts.
//  - Instrumentos y métodos de ensayo conocidos — mismo
//    diccionario diccionarios/instrumentos.ts de siempre.
// Qué guarda: cada hallazgo con su posición y qué tipo es
// (condición, instrumento o método).
// Qué entrega: la lista completa de los tres, para que el
// Consolidador arme el registro final con el que esté más cerca
// de cada propiedad/valor, si corresponde.
//
// Diferencia con el motor actual: buscarCondicionEnsayo() y
// buscarInstrumentoYMetodo() hoy devuelven como mucho UN
// resultado cada uno (el primero que encuentran) dentro de la
// ventana de 150 caracteres de una propiedad puntual. Acá se
// escanea el bloque completo y se guardan TODAS las apariciones.
// ============================================================

import { EntradaInstrumento } from '../base/tipos';
import { Evento, DatoCondicionEnsayo } from '../eventos/tipos';
import { HallazgoRAM, RAM } from './tipos';

function escaparRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ── Mismos patrones fijos que ya tenía buscarCondicionEnsayo()
//    en motorExtraccion.ts, sin cambios. ─────────────────────────
export const PATRONES_CONDICION: RegExp[] = [
  /a\s+\d{1,4}\s*°?\s?C[^.,;]{0,30}/gi,
  /at\s+\d{1,4}\s*°?\s?C[^.,;]{0,30}/gi,
  /bajo condiciones? de[^.,;]{0,40}/gi,
  /under[^.,;]{0,15}conditions?[^.,;]{0,25}/gi,
];

function detectarCondiciones(texto: string): HallazgoRAM<DatoCondicionEnsayo>[] {
  const hallazgos: HallazgoRAM<DatoCondicionEnsayo>[] = [];

  for (const patron of PATRONES_CONDICION) {
    patron.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = patron.exec(texto)) !== null) {
      hallazgos.push({
        dato: { condicion_ensayo: match[0].trim(), metodo_ensayo: null, instrumento_usado: null },
        posicion: match.index,
        origen: 'parrafo',
      });
      if (match[0].length === 0) patron.lastIndex++;
    }
  }

  return hallazgos;
}

function detectarInstrumentosYMetodos(
  texto: string,
  instrumentos: EntradaInstrumento[]
): HallazgoRAM<DatoCondicionEnsayo>[] {
  const hallazgos: HallazgoRAM<DatoCondicionEnsayo>[] = [];

  for (const entrada of instrumentos) {
    const terminos = [entrada.nombre_es, entrada.nombre_en, ...entrada.sinonimos].filter(Boolean);
    for (const termino of terminos) {
      const regex = new RegExp(`\\b${escaparRegex(termino)}\\b`, 'gi');
      let match: RegExpExecArray | null;
      while ((match = regex.exec(texto)) !== null) {
        hallazgos.push({
          dato: {
            condicion_ensayo: null,
            metodo_ensayo: entrada.tipo === 'metodo' ? entrada.nombre_es : null,
            instrumento_usado: entrada.tipo === 'instrumento' ? entrada.nombre_es : null,
          },
          posicion: match.index,
          origen: 'parrafo',
        });
      }
    }
  }

  return hallazgos;
}

export function crearRAMCondicionEnsayo(instrumentos: EntradaInstrumento[]): RAM<DatoCondicionEnsayo> {
  let hallazgosBloque: HallazgoRAM<DatoCondicionEnsayo>[] = [];

  function agregar(evento: Evento<DatoCondicionEnsayo>): void {
    hallazgosBloque.push({ dato: evento.dato, posicion: evento.posicion, origen: evento.origen });
  }

  function activarDesdeTexto(texto: string, offsetBloque: number): void {
    const detectados = [
      ...detectarCondiciones(texto),
      ...detectarInstrumentosYMetodos(texto, instrumentos),
    ].sort((a, b) => a.posicion - b.posicion);

    for (const h of detectados) {
      hallazgosBloque.push({ ...h, posicion: offsetBloque + h.posicion });
    }
  }

  function consultar(): HallazgoRAM<DatoCondicionEnsayo>[] {
    return [...hallazgosBloque];
  }

  function entregar(): HallazgoRAM<DatoCondicionEnsayo>[] {
    const resultado = [...hallazgosBloque];
    hallazgosBloque = [];
    return resultado;
  }

  function cantidadAcumulada(): number {
    return hallazgosBloque.length;
  }

  return {
    nombre: 'RAM-CondicionEnsayo',
    agregar,
    consultar,
    entregar,
    cantidadAcumulada,
    // @ts-expect-error — método propio de escaneo, ídem las otras RAM.
    activarDesdeTexto,
  };
}
