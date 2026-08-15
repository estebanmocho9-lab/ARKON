// ============================================================
// src/extraction-neurons/memoria/ramValores.ts
// Mini-neurona de Valores.
//
// Qué reconoce: números seguidos (o precedidos) de una unidad
// conocida — kg/m³, °C, %, MPa, etc. — usando el diccionario de
// siempre, diccionarios/unidades.ts, sin tocarlo.
// Qué guarda: cada valor+unidad encontrado en el bloque completo,
// con su posición, y el rango mín/máx si había uno pegado al
// lado (reusa la misma lógica de buscarRango() que ya tenía
// motorExtraccion.ts, con la misma distancia de 25/80 caracteres
// — esa parte del diseño viejo funcionaba bien porque un rango
// SÍ suele estar pegado al número, así que se mantiene igual).
// Qué entrega: la lista completa de valores vistos en el bloque.
//
// Diferencia clave con motorExtraccion.ts actual: hoy
// buscarValorYUnidad() recibe las magnitudes de UNA propiedad
// puntual (las que le pasa extraerPropiedadesDeBloque para esa
// propiedad específica) y busca dentro de una ventana de 150
// caracteres alrededor de esa propiedad. Acá se da vuelta el
// orden: esta RAM escanea el bloque completo buscando CUALQUIER
// número con CUALQUIER unidad conocida (de todas las magnitudes
// juntas), sin saber todavía a qué propiedad pertenece cada uno.
// Es el Consolidador el que después, con la lista completa de
// ramPropiedades.ts y esta lista completa de valores, empareja
// cada propiedad con el valor más cercano en posición dentro del
// mismo bloque. Esto es necesario porque ahora el bloque puede
// ser mucho más grande que 150 caracteres (una página entera o
// más), así que no alcanza con mirar nada más que el entorno
// inmediato de una propiedad particular.
// ============================================================

import { EntradaUnidad } from '../base/tipos';
import { Evento, DatoValor } from '../eventos/tipos';
import { HallazgoRAM, RAM } from './tipos';

function escaparRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ── Mismo patrón de rango que ya usaba motorExtraccion.ts:
//    "X a Y", "X-Y", "X ± Y" muy cerca del valor, y como segundo
//    intento "mín ... máx" como etiquetas separadas de tabla. Se
//    copia tal cual porque esta parte del sistema viejo no tenía
//    el problema del bug — el problema era la ventana para
//    encontrar el MATERIAL, no esto. ─────────────────────────────
function buscarRangoCercano(texto: string, posicionValor: number): { min: number; max: number } | null {
  const DISTANCIA_MAXIMA = 25;
  const inicio = Math.max(0, posicionValor - DISTANCIA_MAXIMA);
  const fin = Math.min(texto.length, posicionValor + DISTANCIA_MAXIMA);
  const entorno = texto.substring(inicio, fin);

  const patronRango = /(-?\d+(?:[.,]\d+)?)\s*(?:a|to|[-–]|±)\s*(-?\d+(?:[.,]\d+)?)/;
  const match = patronRango.exec(entorno);
  if (match) {
    const a = parseFloat(match[1].replace(',', '.'));
    const b = parseFloat(match[2].replace(',', '.'));
    if (!isNaN(a) && !isNaN(b)) return { min: Math.min(a, b), max: Math.max(a, b) };
  }

  const DISTANCIA_TABLA = 80;
  const inicioTabla = Math.max(0, posicionValor - DISTANCIA_TABLA);
  const finTabla = Math.min(texto.length, posicionValor + DISTANCIA_TABLA);
  const entornoTabla = texto.substring(inicioTabla, finTabla);

  const patronMin = /\b(?:m[ií]n(?:imo)?|min)\.?\s*:?\s*(-?\d+(?:[.,]\d+)?)/i;
  const patronMax = /\b(?:m[áa]x(?:imo)?|max)\.?\s*:?\s*(-?\d+(?:[.,]\d+)?)/i;
  const matchMin = patronMin.exec(entornoTabla);
  const matchMax = patronMax.exec(entornoTabla);
  if (matchMin && matchMax) {
    const min = parseFloat(matchMin[1].replace(',', '.'));
    const max = parseFloat(matchMax[1].replace(',', '.'));
    if (!isNaN(min) && !isNaN(max)) return { min: Math.min(min, max), max: Math.max(min, max) };
  }

  return null;
}

// ── Detecta TODOS los pares número+unidad del bloque completo,
//    juntando las variantes de texto de TODAS las unidades del
//    diccionario (no filtradas por una magnitud puntual, a
//    diferencia de buscarValorYUnidad() original). ────────────────
const NUMERO = `(-?\\d{1,4}(?:[.,]\\d{1,6})?(?:e[-+]?\\d+)?)`;
const LETRA = 'A-Za-zÀ-ÿ';

function armarPatron(variantes: string[]): string {
  return [...new Set(variantes)]
    .sort((a, b) => b.length - a.length) // más largas primero: "kg/m3" antes que "m"
    .map(escaparRegex)
    .join('|');
}

function detectarValores(texto: string, unidades: EntradaUnidad[]): HallazgoRAM<DatoValor>[] {
  const hallazgos: HallazgoRAM<DatoValor>[] = [];

  const variantes = unidades.flatMap(u => u.variantes_texto).filter(v => v && v.length > 0);
  if (variantes.length === 0) return hallazgos;

  // ── Dos familias de unidades, con reglas distintas, porque una
  //    sola regex permisiva es lo que causó el bug real que
  //    encontramos en el primer lote grande de documentos: 8 de
  //    cada 10 filas guardadas tenían una "unidad" de una sola
  //    letra ("t", "a", "s"...) que en realidad era la primera
  //    letra de otra palabra ("Tabla", "Adsorción") o el sufijo de
  //    una cita bibliográfica ("1984a", "1984b"), no una unidad
  //    real. ────────────────────────────────────────────────────
  //  - Unidades que EMPIEZAN CON LETRA (t, s, MPa, psi...): exigen
  //    un espacio real antes ("45 s", nunca "45s" ni "1984a"), y
  //    no pueden ser el prefijo de una palabra más larga ("Tabla"
  //    no cuenta como "T" + "abla").
  //  - Unidades que EMPIEZAN CON SÍMBOLO (°C, %, μm...): se
  //    escriben pegadas al número por convención ("20°C", "5%"),
  //    así que ahí sí se permite espacio opcional.
  const unidadesLetra = variantes.filter(v => new RegExp(`^[${LETRA}]`).test(v));
  const unidadesSimbolo = variantes.filter(v => !new RegExp(`^[${LETRA}]`).test(v));

  const regexes: RegExp[] = [];
  if (unidadesLetra.length > 0) {
    const patron = armarPatron(unidadesLetra);
    regexes.push(
      new RegExp(`(?<![\\d.])${NUMERO}\\s+(${patron})(?![${LETRA}])|(?<![${LETRA}])(${patron})(?![${LETRA}])\\s+(?<![\\d.])${NUMERO}`, 'gi')
    );
  }
  if (unidadesSimbolo.length > 0) {
    const patron = armarPatron(unidadesSimbolo);
    regexes.push(new RegExp(`(?<![\\d.])${NUMERO}\\s*(${patron})|(${patron})\\s*(?<![\\d.])${NUMERO}`, 'gi'));
  }

  for (const regex of regexes) {
    let match: RegExpExecArray | null;
    while ((match = regex.exec(texto)) !== null) {
      let valor: string | null = null;
      let unidad: string | null = null;

      if (match[1] && match[2]) {
        valor = match[1];
        unidad = match[2];
      } else if (match[3] && match[4]) {
        valor = match[4];
        unidad = match[3];
      }
      if (!valor || !unidad) continue;

      const rango = buscarRangoCercano(texto, match.index);

      hallazgos.push({
        dato: {
          valor,
          unidad,
          valor_minimo: rango?.min ?? null,
          valor_maximo: rango?.max ?? null,
        },
        posicion: match.index,
        origen: 'ventana',
      });
    }
  }

  hallazgos.sort((a, b) => a.posicion - b.posicion);
  return hallazgos;
}

export function crearRAMValores(unidades: EntradaUnidad[]): RAM<DatoValor> {
  let hallazgosBloque: HallazgoRAM<DatoValor>[] = [];

  function agregar(evento: Evento<DatoValor>): void {
    hallazgosBloque.push({ dato: evento.dato, posicion: evento.posicion, origen: evento.origen });
  }

  function activarDesdeTexto(texto: string, offsetBloque: number): void {
    const detectados = detectarValores(texto, unidades);
    for (const h of detectados) {
      hallazgosBloque.push({ ...h, posicion: offsetBloque + h.posicion });
    }
  }

  function consultar(): HallazgoRAM<DatoValor>[] {
    return [...hallazgosBloque];
  }

  function entregar(): HallazgoRAM<DatoValor>[] {
    const resultado = [...hallazgosBloque];
    hallazgosBloque = [];
    return resultado;
  }

  function cantidadAcumulada(): number {
    return hallazgosBloque.length;
  }

  return {
    nombre: 'RAM-Valores',
    agregar,
    consultar,
    entregar,
    cantidadAcumulada,
    // @ts-expect-error — método propio de escaneo, ídem las otras RAM.
    activarDesdeTexto,
  };
}
