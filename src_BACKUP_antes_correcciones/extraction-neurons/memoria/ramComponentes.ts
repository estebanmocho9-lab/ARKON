// ============================================================
// src/extraction-neurons/memoria/ramComponentes.ts
// Mini-neurona de Componentes.
//
// Qué reconoce: óxidos, elementos y compuestos químicos conocidos
// (óxido de calcio, sílice, etc.) — hoy vive en tu tabla de
// componentes de Supabase, se sigue leyendo de ahí igual, esta
// RAM no cambia de dónde sale el diccionario.
// Qué guarda: cada componente encontrado en el bloque completo,
// con su posición y el material padre si el catálogo lo tiene
// asociado (campo materialAsociado, igual que ya usa
// resolverMaterialFinal() en el motor actual para no dejar datos
// "huérfanos" cuando el texto nombra el componente pero no el
// material completo).
// Qué entrega: la lista completa de componentes vistos en el
// bloque — igual que propiedades y valores, acá puede haber
// varios por bloque (ej. una tabla de composición química con
// cinco óxidos distintos).
//
// Se mantienen las DOS formas de detectar que ya tenía el motor:
// 1) contra el diccionario cerrado de componentes conocidos
//    (buscarComponente original), y
// 2) por patrón de frase ("compuesto por", "se compone de",
//    "formado por"...) cuando el componente no está en la lista
//    fija (buscarComponentePorPatron original) — así no queda
//    limitado a lo que ya está cargado en Supabase.
// La diferencia con el motor actual es la misma que en las otras
// RAM: acá se escanea el bloque de material completo, no una
// ventana de 150 caracteres alrededor de otro hallazgo.
// ============================================================

import { EntradaMaterial } from '../base/tipos';
import { Evento, DatoComponente } from '../eventos/tipos';
import { HallazgoRAM, RAM } from './tipos';

function escaparRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ── Mismo patrón de frase que ya usaba motorExtraccion.ts para
//    detectar componentes no catalogados. Se copia tal cual. ────
const FRASES_COMPOSICION =
  /\b(?:compuest[oa]\s+(?:por|de)|se\s+compone\s+de|formad[oa]\s+por|constituid[oa]\s+por|integrad[oa]\s+por|contiene)\b/gi;

function detectarPorPatron(texto: string): HallazgoRAM<DatoComponente>[] {
  const hallazgos: HallazgoRAM<DatoComponente>[] = [];
  let match: RegExpExecArray | null;

  while ((match = FRASES_COMPOSICION.exec(texto)) !== null) {
    const inicioResto = match.index + match[0].length;
    const resto = texto.slice(inicioResto, inicioResto + 120);
    const candidato = resto.match(
      /([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+de\s+[a-záéíóúñ]+){0,2}|(?:óxido|silicato|carbonato|sulfato|hidróxido|aluminato|cloruro|fluoruro)\s+de\s+[a-záéíóúñ]+)/i
    );
    if (!candidato) continue;

    const nombre = candidato[0].trim();
    if (nombre.length < 4) continue;

    hallazgos.push({
      dato: { nombre, materialAsociado: null },
      posicion: inicioResto + (candidato.index ?? 0),
      origen: 'parrafo',
    });
  }

  return hallazgos;
}

// ── Detecta TODAS las menciones de componentes del catálogo
//    dentro de un texto completo, sin ventana, más las que salen
//    del patrón de frase para componentes no catalogados. ────────
function detectarMenciones(
  texto: string,
  componentes: EntradaMaterial[]
): HallazgoRAM<DatoComponente>[] {
  const hallazgos: HallazgoRAM<DatoComponente>[] = [];

  for (const entrada of componentes) {
    const terminos = [entrada.nombre_es, entrada.nombre_en, ...entrada.sinonimos].filter(
      (t): t is string => !!t && t.length >= 3
    );
    for (const termino of terminos) {
      const regex = new RegExp(`\\b${escaparRegex(termino)}\\b`, 'gi');
      let match: RegExpExecArray | null;
      while ((match = regex.exec(texto)) !== null) {
        hallazgos.push({
          dato: {
            nombre: entrada.nombre_es,
            materialAsociado: entrada.materialAsociado || null,
          },
          posicion: match.index,
          origen: 'parrafo',
        });
      }
    }
  }

  hallazgos.push(...detectarPorPatron(texto));
  hallazgos.sort((a, b) => a.posicion - b.posicion);
  return hallazgos;
}

export function crearRAMComponentes(componentes: EntradaMaterial[]): RAM<DatoComponente> {
  let hallazgosBloque: HallazgoRAM<DatoComponente>[] = [];

  function agregar(evento: Evento<DatoComponente>): void {
    hallazgosBloque.push({ dato: evento.dato, posicion: evento.posicion, origen: evento.origen });
  }

  function activarDesdeTexto(texto: string, offsetBloque: number): void {
    const detectados = detectarMenciones(texto, componentes);
    for (const h of detectados) {
      hallazgosBloque.push({ ...h, posicion: offsetBloque + h.posicion });
    }
  }

  function consultar(): HallazgoRAM<DatoComponente>[] {
    return [...hallazgosBloque];
  }

  function entregar(): HallazgoRAM<DatoComponente>[] {
    const resultado = [...hallazgosBloque];
    hallazgosBloque = [];
    return resultado;
  }

  function cantidadAcumulada(): number {
    return hallazgosBloque.length;
  }

  return {
    nombre: 'RAM-Componentes',
    agregar,
    consultar,
    entregar,
    cantidadAcumulada,
    // @ts-expect-error — método propio de escaneo, ídem las otras RAM.
    activarDesdeTexto,
  };
}
