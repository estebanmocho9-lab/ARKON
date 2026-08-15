// ============================================================
// src/extraction-neurons/base/motorExtraccion.ts
// El motor de análisis de UNA página de texto. Nada de IA: solo
// diccionarios + expresiones regulares + reglas de proximidad.
//
// ARQUITECTURA (reescrita): antes el algoritmo recorría las
// PROPIEDADES una por una y recién después intentaba adivinar
// el material más cercano — eso producía cientos de registros
// con material = NULL, porque el material se buscaba DESPUÉS de
// la propiedad y solo dentro de una ventana puntual alrededor de
// cada coincidencia.
//
// Ahora el motor está centrado en el MATERIAL:
//
//   dividir el texto en bloques (respetando fin de oración)
//   → para cada bloque:
//       - buscar si aparece un material en el bloque
//       - si aparece, actualizar el ContextoMaterial activo
//       - si no aparece, mantener el material anterior
//       - extraer todas las propiedades del bloque y asociarlas
//         al ContextoMaterial activo
//       - extraer componentes, estado, instrumentos, normas
//       - guardar registros
//
// La extracción de propiedades depende del ContextoMaterial.
// Nunca al revés.
//
// Prioridad para resolver el material de un bloque:
//   1. material encontrado en el bloque actual
//   2. material heredado del contexto activo (bloques anteriores)
//   3. memoria documental (Neurona de Comprensión), solo si no hay
//      contexto activo — es un respaldo, no una fuente primaria.
//
// Nota de organización: la especificación original preveía toda
// esta lógica dentro de NeuronExtraccionBase.ts; se separó en
// este archivo (misma carpeta base/) solo para que el código no
// sea un archivo gigante — es el único cambio de estructura
// respecto al documento original, nada de lógica de negocio.
// ============================================================

import { PROPIEDADES } from '../diccionarios/propiedades';
import { UNIDADES, variantesDeMagnitud } from '../diccionarios/unidades';
import { INSTRUMENTOS } from '../diccionarios/instrumentos';
import { buscarNorma } from '../diccionarios/normas';
import { ATRIBUTOS } from '../diccionarios/atributos';
import { ESTADOS } from '../diccionarios/estados';
import { AGENTES_EXPOSICION } from '../diccionarios/agentesExposicion';
import { buscarControversiasDeInteres } from '../diccionarios/controversias';
import { EntradaMaterial, PropiedadExtraida } from './tipos';
import { MemoriaTemporalDocumento, ContextoEnPosicion } from '../comprension/tipos';
import { consultarContextoEnPosicion } from '../comprension/consultarContexto';

const VENTANA_CONTEXTO = parseInt(process.env.VENTANA_CONTEXTO || '150', 10);

// Tamaño objetivo de cada bloque de recorrido documental. Es más
// grande que VENTANA_CONTEXTO a propósito: un bloque representa
// "un tramo de prosa que probablemente habla de un solo material",
// mientras que VENTANA_CONTEXTO sigue usándose puntualmente para
// acotar la búsqueda de valor/unidad/instrumento/etc. alrededor de
// cada mención de propiedad dentro del bloque.
const TAMANO_BLOQUE = parseInt(process.env.TAMANO_BLOQUE || '500', 10);

export interface CandidatoNoClasificado {
  pagina: number;
  fragmento: string;
  numero: string;
  unidadDetectada: string;
}

export interface ResultadoAnalisisPagina {
  registros: Omit<PropiedadExtraida, 'neurona_id' | 'documento' | 'drive_file_id' | 'pagina' | 'capitulo'>[];
  candidatos: CandidatoNoClasificado[];
}

// ── Contexto de material vigente durante el recorrido del
//    documento. Se reemplaza cada vez que aparece un material
//    nuevo; mientras no aparezca otro, todas las propiedades del
//    bloque pertenecen al material activo. ───────────────────────
interface ContextoMaterial {
  materialActual: string | null;
  familia: string | null;
  subfamilia: string | null;
  origen: 'titulo' | 'parrafo' | 'ventana' | 'memoria' | 'componente';
}

// ── Un bloque del documento: un tramo de texto + el offset donde
//    arranca dentro de la página (para poder consultar la memoria
//    documental en la posición absoluta correcta). ────────────────
interface Bloque {
  texto: string;
  inicio: number;
}

function escaparRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ── Ventana de contexto alrededor de una coincidencia. Primero
//    toma el margen fijo (VENTANA_CONTEXTO), y después intenta
//    ajustar los bordes al punto más cercano (". ") para no cortar
//    una oración a la mitad y arrastrar texto de la oración de al
//    lado, que puede hablar de otro material sin relación. Si no
//    encuentra un punto cerca, se queda con el margen fijo. ───────
function tomarVentana(texto: string, inicio: number, fin: number): { ventana: string; inicioVentana: number } {
  let inicioVentana = Math.max(0, inicio - VENTANA_CONTEXTO);
  let finVentana = Math.min(texto.length, fin + VENTANA_CONTEXTO);

  const trozoAntes = texto.substring(inicioVentana, inicio);
  const ultimoPunto = trozoAntes.lastIndexOf('. ');
  if (ultimoPunto !== -1) {
    inicioVentana = inicioVentana + ultimoPunto + 2;
  }

  const trozoDespues = texto.substring(fin, finVentana);
  const proximoPunto = trozoDespues.indexOf('. ');
  if (proximoPunto !== -1) {
    finVentana = fin + proximoPunto + 1;
  }

  return { ventana: texto.substring(inicioVentana, finVentana), inicioVentana };
}

// ── Busca un valor numérico + unidad de una magnitud dada, dentro
//    de una ventana de texto ─────────────────────────────────────
function buscarValorYUnidad(ventana: string, magnitudes: string[]): { valor: string; unidad: string; posicion: number } | null {
  const variantes = magnitudes.flatMap(m => variantesDeMagnitud(m)).filter(Boolean);
  if (variantes.length === 0) return null;

  const patronUnidades = variantes.map(escaparRegex).join('|');
  const regex = new RegExp(`(?<![\\d.])(-?\\d{1,4}(?:[.,]\\d{1,6})?(?:e[-+]?\\d+)?)\\s*(${patronUnidades})|(${patronUnidades})\\s*(?<![\\d.])(-?\\d{1,4}(?:[.,]\\d{1,6})?(?:e[-+]?\\d+)?)`, 'i');
  const match = regex.exec(ventana);
  if (!match) return null;

  if (match[1] && match[2]) {
    return { valor: match[1], unidad: match[2], posicion: match.index };
  }
  if (match[3] && match[4]) {
    return { valor: match[4], unidad: match[3], posicion: match.index };
  }
  return null;
}

// ── Busca un rango "de X a Y", "X-Y", "X ± Y" MUY cerca del
//    valor ya encontrado (no en cualquier parte de la ventana,
//    para no emparejar con un número sin relación, como un
//    número de página) ───────────────────────────────────────────
function buscarRango(ventana: string, posicionValor: number): { min: number; max: number } | null {
  const DISTANCIA_MAXIMA = 25;
  const inicio = Math.max(0, posicionValor - DISTANCIA_MAXIMA);
  const fin = Math.min(ventana.length, posicionValor + DISTANCIA_MAXIMA);
  const entorno = ventana.substring(inicio, fin);

  const patronRango = /(-?\d+(?:[.,]\d+)?)\s*(?:a|to|[-–]|±)\s*(-?\d+(?:[.,]\d+)?)/;
  const match = patronRango.exec(entorno);
  if (match) {
    const a = parseFloat(match[1].replace(',', '.'));
    const b = parseFloat(match[2].replace(',', '.'));
    if (!isNaN(a) && !isNaN(b)) return { min: Math.min(a, b), max: Math.max(a, b) };
  }

  // Segundo intento: tablas técnicas que ponen "mín" y "máx" como
  // etiquetas separadas, sin ninguna palabra que conecte los dos
  // números (típico de tablas de Ashby/CRC, columna por columna)
  const DISTANCIA_TABLA = 80;
  const inicioTabla = Math.max(0, posicionValor - DISTANCIA_TABLA);
  const finTabla = Math.min(ventana.length, posicionValor + DISTANCIA_TABLA);
  const entornoTabla = ventana.substring(inicioTabla, finTabla);

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

// ── Condición de ensayo (temperatura, condiciones) ───────────────
function buscarCondicionEnsayo(ventana: string): string | null {
  const patrones = [
    /a\s+\d{1,4}\s*°?\s?C[^.,;]{0,30}/i,
    /at\s+\d{1,4}\s*°?\s?C[^.,;]{0,30}/i,
    /bajo condiciones? de[^.,;]{0,40}/i,
    /under[^.,;]{0,15}conditions?[^.,;]{0,25}/i,
  ];
  for (const p of patrones) {
    const m = p.exec(ventana);
    if (m) return m[0].trim();
  }
  return null;
}

// ── Instrumento / método dentro de una ventana ───────────────────
function buscarInstrumentoYMetodo(ventana: string): { instrumento: string | null; metodo: string | null } {
  let instrumento: string | null = null;
  let metodo: string | null = null;

  for (const entrada of INSTRUMENTOS) {
    const terminos = [entrada.nombre_es, entrada.nombre_en, ...entrada.sinonimos];
    for (const termino of terminos) {
      if (!termino) continue;
      const regex = new RegExp(`\\b${escaparRegex(termino)}\\b`, 'i');
      if (regex.test(ventana)) {
        if (entrada.tipo === 'instrumento' && !instrumento) instrumento = entrada.nombre_es;
        if (entrada.tipo === 'metodo' && !metodo) metodo = entrada.nombre_es;
      }
    }
    if (instrumento && metodo) break;
  }

  return { instrumento, metodo };
}

// ── Estado físico/de curado del material dentro de la ventana ───
function buscarEstado(ventana: string): string | null {
  for (const estado of ESTADOS) {
    const terminos = [estado.nombre_es, estado.nombre_en, ...estado.sinonimos];
    for (const termino of terminos) {
      if (!termino) continue;
      const regex = new RegExp(`\\b${escaparRegex(termino)}\\b`, 'i');
      if (regex.test(ventana)) return estado.nombre_es;
    }
  }
  return null;
}

// ── Agente de exposición (humedad, cloruros, corrosión, pintura...)
//    dentro de la ventana, junto con su posición (para poder buscar
//    después si el valor corresponde a "antes" o "después" de esa
//    exposición) ────────────────────────────────────────────────
function buscarAgenteExposicion(ventana: string): { nombre: string; posicion: number } | null {
  for (const agente of AGENTES_EXPOSICION) {
    const terminos = [agente.nombre_es, agente.nombre_en, ...agente.sinonimos];
    for (const termino of terminos) {
      if (!termino) continue;
      const regex = new RegExp(`\\b${escaparRegex(termino)}\\b`, 'i');
      const match = regex.exec(ventana);
      if (match) return { nombre: agente.nombre_es, posicion: match.index };
    }
  }
  return null;
}

// ── Dado que se encontró un agente de exposición en cierta posición,
//    mira el texto inmediatamente alrededor para ver si el valor
//    corresponde a ANTES o DESPUÉS de esa exposición (ej. "antes de
//    la exposición a humedad" vs "después de saturar en agua") ────
const PALABRAS_ANTES = /\b(antes de|previo a|sin exponer|sin exposición|before|prior to|unexposed)\b/i;
const PALABRAS_DESPUES = /\b(despu[eé]s de|tras|luego de|una vez expuesto|posterior a|after|following exposure)\b/i;

function buscarMomentoExposicion(ventana: string, posicionAgente: number): 'Antes' | 'Después' | null {
  const DISTANCIA = 50;
  const inicio = Math.max(0, posicionAgente - DISTANCIA);
  const fin = Math.min(ventana.length, posicionAgente + DISTANCIA);
  const entorno = ventana.substring(inicio, fin);

  if (PALABRAS_DESPUES.test(entorno)) return 'Después';
  if (PALABRAS_ANTES.test(entorno)) return 'Antes';
  return null;
}

// ── Material dentro de un fragmento de texto dado (bloque o
//    ventana, según quien la llame). ─────────────────────────────
function buscarMaterial(
  texto: string,
  materiales: EntradaMaterial[]
): { material: string | null; familia: string | null; subfamilia: string | null } {
  for (const entrada of materiales) {
    const terminos = [entrada.nombre_es, entrada.nombre_en, ...entrada.sinonimos];
    for (const termino of terminos) {
      if (!termino || termino.length < 3) continue;
      const regex = new RegExp(`\\b${escaparRegex(termino)}\\b`, 'i');
      if (regex.test(texto)) {
        return { material: entrada.nombre_es, familia: entrada.familia, subfamilia: entrada.subfamilia || null };
      }
    }
  }
  return { material: null, familia: null, subfamilia: null };
}

// ── Igual que buscarMaterial(), pero además devuelve la posición
//    donde matcheó el término dentro del texto. Se usa para la
//    heurística de "¿esto parece un título?" al actualizar el
//    ContextoMaterial. ────────────────────────────────────────────
function buscarMaterialConPosicion(
  texto: string,
  materiales: EntradaMaterial[]
): { material: string | null; familia: string | null; subfamilia: string | null; posicion: number } {
  for (const entrada of materiales) {
    const terminos = [entrada.nombre_es, entrada.nombre_en, ...entrada.sinonimos];
    for (const termino of terminos) {
      if (!termino || termino.length < 3) continue;
      const regex = new RegExp(`\\b${escaparRegex(termino)}\\b`, 'i');
      const match = regex.exec(texto);
      if (match) {
        return { material: entrada.nombre_es, familia: entrada.familia, subfamilia: entrada.subfamilia || null, posicion: match.index };
      }
    }
  }
  return { material: null, familia: null, subfamilia: null, posicion: -1 };
}

// ── Cuenta cuántas veces aparece cada material en TODO el texto
//    del documento (no en una ventana puntual). Sirve para saber
//    si un material es un TEMA real del libro o solo una mención
//    de paso (ej. "tiza" usada como ejemplo en un libro de
//    estadística). Se calcula UNA vez por documento, no por página.
const UMBRAL_MENCION_BAJA = 3;

export function calcularDensidadMenciones(
  textoCompletoDocumento: string,
  materiales: EntradaMaterial[]
): Map<string, number> {
  const conteos = new Map<string, number>();
  const textoNormalizado = textoCompletoDocumento.replace(/\s+/g, ' ');

  for (const entrada of materiales) {
    const terminos = [entrada.nombre_es, entrada.nombre_en, ...entrada.sinonimos].filter(
      (t): t is string => !!t && t.length >= 3
    );
    let total = 0;
    for (const termino of terminos) {
      const regex = new RegExp(`\\b${escaparRegex(termino)}\\b`, 'gi');
      const matches = textoNormalizado.match(regex);
      total += matches ? matches.length : 0;
    }
    conteos.set(entrada.nombre_es, total);
  }
  return conteos;
}

export function esMencionDeBajaDensidad(material: string, densidad: Map<string, number>): boolean {
  const conteo = densidad.get(material);
  return conteo !== undefined && conteo < UMBRAL_MENCION_BAJA;
}

// ── Componente dentro de la ventana, contra su propio diccionario
//    (separado del de materiales) ───────────────────────────────
function buscarComponente(
  ventana: string,
  componentes: EntradaMaterial[]
): { nombre: string; materialAsociado: string | null } | null {
  for (const entrada of componentes) {
    const terminos = [entrada.nombre_es, entrada.nombre_en, ...entrada.sinonimos];
    for (const termino of terminos) {
      if (!termino || termino.length < 3) continue;
      const regex = new RegExp(`\\b${escaparRegex(termino)}\\b`, 'i');
      if (regex.test(ventana)) return { nombre: entrada.nombre_es, materialAsociado: entrada.materialAsociado || null };
    }
  }
  return null;
}

// ── Componente NUEVO, no catalogado: cuando buscarComponente() no
//    encuentra nada en el diccionario, probamos con frases típicas
//    de composición ("compuesto por", "se compone de", "contiene",
//    "formado por", "constituido por", "integrado por") seguidas de
//    un término con mayúscula inicial o un nombre químico típico
//    (óxido de..., silicato de..., carbonato de..., sulfato de...).
//    Así el sistema no queda limitado a una lista fija. ────────────
const FRASES_COMPOSICION = /\b(?:compuest[oa]\s+(?:por|de)|se\s+compone\s+de|formad[oa]\s+por|constituid[oa]\s+por|integrad[oa]\s+por|contiene)\b/i;

function buscarComponentePorPatron(ventana: string): { nombre: string; materialAsociado: null } | null {
  const match = FRASES_COMPOSICION.exec(ventana);
  if (!match) return null;

  const resto = ventana.slice(match.index + match[0].length, match.index + match[0].length + 120);
  const candidato = resto.match(
    /([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+de\s+[a-záéíóúñ]+){0,2}|(?:óxido|silicato|carbonato|sulfato|hidróxido|aluminato|cloruro|fluoruro)\s+de\s+[a-záéíóúñ]+)/i
  );
  if (!candidato) return null;

  const nombre = candidato[0].trim();
  if (nombre.length < 4) return null;

  return { nombre, materialAsociado: null };
}

// ── Si no se encontró material directo pero SÍ un componente
//    con material padre conocido (vía tu tabla real), lo usamos
//    como material — así ningún dato queda "huérfano" solo porque
//    el texto nombró el componente y no el material completo ────
function resolverMaterialFinal(
  materialInfo: { material: string | null; familia: string | null; subfamilia: string | null },
  componenteInfo: { nombre: string; materialAsociado: string | null } | null,
  materiales: EntradaMaterial[]
): { material: string | null; familia: string | null; subfamilia: string | null; inferidoPorComponente: boolean } {
  if (materialInfo.material) {
    return { ...materialInfo, inferidoPorComponente: false };
  }
  if (componenteInfo?.materialAsociado) {
    const entradaMaterial = materiales.find(m => m.nombre_es === componenteInfo.materialAsociado);
    return {
      material: componenteInfo.materialAsociado,
      familia: entradaMaterial?.familia || null,
      subfamilia: entradaMaterial?.subfamilia || null,
      inferidoPorComponente: true,
    };
  }
  return { ...materialInfo, inferidoPorComponente: false };
}

// ── Ecuación / fórmula: patrón "símbolo = expresión", exige que el
//    símbolo sea uno de los símbolos propios de la propiedad que ya
//    matcheó (ρ, E, G, etc.) para no aceptar cualquier letra +
//    número sin relación real con la propiedad detectada. ─────────
function buscarEcuacion(ventana: string, simbolosPropiedad: string[]): string | null {
  if (simbolosPropiedad.length === 0) return null;
  const patronSimbolos = simbolosPropiedad.map(escaparRegex).join('|');
  const patron = new RegExp(`(?:${patronSimbolos})\\s*=\\s*[^.;\\n]{2,60}`);
  const match = patron.exec(ventana);
  return match ? match[0].trim() : null;
}

// ── Origen del dato: Tabla / Texto / Gráfico ─────────────────────
function determinarOrigen(ventana: string): 'Tabla' | 'Texto' | 'Gráfico' {
  if (/\b(Fig\.|Figura|Gr[aá]fico|Chart)\b/i.test(ventana)) return 'Gráfico';
  const numerosEnVentana = (ventana.match(/\d+([.,]\d+)?/g) || []).length;
  const palabras = ventana.split(/\s+/).length;
  if (numerosEnVentana >= 3 && palabras < 40) return 'Tabla';
  return 'Texto';
}

// ── Observaciones: menciones de controversia/aproximación ────────
function buscarObservaciones(ventana: string): string | null {
  const patron = /\b(controvertid[oa]|discutid[oa]|aproximad[oa]|estimad[oa]|controversial|approximate|estimated)\b[^.;\n]{0,60}/i;
  const match = patron.exec(ventana);
  return match ? match[0].trim() : null;
}

// ── Relación con otras propiedades: ¿aparece otra propiedad
//    conocida en la misma ventana? ───────────────────────────────
function buscarRelacionConOtrasPropiedades(ventana: string, propiedadActualId: string): string | null {
  for (const otra of PROPIEDADES) {
    if (otra.id === propiedadActualId) continue;
    const terminos = [otra.nombre_es, otra.nombre_en, ...otra.sinonimos];
    for (const termino of terminos) {
      if (!termino) continue;
      const regex = new RegExp(`\\b${escaparRegex(termino)}\\b`, 'i');
      if (regex.test(ventana)) {
        return `Relacionado con: ${otra.nombre_es}`;
      }
    }
  }
  return null;
}

// ============================================================
// NUEVO: recorrido documental centrado en el material
// ============================================================

// ── Divide el texto en bloques respetando fin de oración (". ").
//    Nunca corta una oración a la mitad. Cada bloque intenta
//    acercarse a TAMANO_BLOQUE caracteres, pero puede ser más
//    corto o más largo según dónde caigan los puntos reales del
//    texto. Devuelve también el offset de inicio de cada bloque
//    dentro del texto de la página, para poder consultar la
//    memoria documental en la posición absoluta correcta. ────────
function dividirEnBloques(texto: string, tamanoObjetivo: number = TAMANO_BLOQUE): Bloque[] {
  if (texto.length === 0) return [];

  const finalesDeOracion: number[] = [];
  const regexFinOracion = /\.\s+/g;
  let m: RegExpExecArray | null;
  while ((m = regexFinOracion.exec(texto)) !== null) {
    finalesDeOracion.push(m.index + m[0].length);
  }
  finalesDeOracion.push(texto.length);

  const bloques: Bloque[] = [];
  let inicioBloque = 0;
  let ultimoFinDisponible = 0;

  for (const finOracion of finalesDeOracion) {
    if (finOracion - inicioBloque >= tamanoObjetivo) {
      // Cortamos en el último fin de oración disponible; si no hay
      // ninguno todavía (una sola oración gigante), cortamos igual
      // acá para no dejar crecer el bloque sin límite.
      const corte = ultimoFinDisponible > inicioBloque ? ultimoFinDisponible : finOracion;
      bloques.push({ texto: texto.substring(inicioBloque, corte), inicio: inicioBloque });
      inicioBloque = corte;
    }
    ultimoFinDisponible = finOracion;
  }

  if (inicioBloque < texto.length) {
    bloques.push({ texto: texto.substring(inicioBloque), inicio: inicioBloque });
  }

  return bloques;
}

// ── Heurística para distinguir si un material apareció en algo
//    parecido a un título/encabezado de sección (aparece muy al
//    principio del bloque, sin ningún punto de oración antes) o
//    en prosa corrida normal (aparece en medio de una oración,
//    con texto y puntuación previos). ─────────────────────────────
function pareceTitulo(bloque: string, posicionMaterial: number): boolean {
  const LARGO_MAXIMO_ENCABEZADO = 50;
  if (posicionMaterial < 0 || posicionMaterial > LARGO_MAXIMO_ENCABEZADO) return false;
  const trozoPrevio = bloque.substring(0, posicionMaterial);
  return !trozoPrevio.includes('. ');
}

// ── Actualiza el ContextoMaterial al entrar a un nuevo bloque,
//    respetando la prioridad: 1) material del bloque actual,
//    2) material heredado del contexto activo, 3) memoria
//    documental (solo como último respaldo, nunca al revés). ──────
function actualizarContextoMaterial(
  bloque: Bloque,
  materiales: EntradaMaterial[],
  contextoPrevio: ContextoMaterial,
  memoria?: MemoriaTemporalDocumento,
  offsetPagina?: number
): ContextoMaterial {
  // 1. Material encontrado en el bloque actual.
  const encontrado = buscarMaterialConPosicion(bloque.texto, materiales);
  if (encontrado.material) {
    const origen: ContextoMaterial['origen'] = pareceTitulo(bloque.texto, encontrado.posicion) ? 'titulo' : 'parrafo';
    return { materialActual: encontrado.material, familia: encontrado.familia, subfamilia: encontrado.subfamilia, origen };
  }

  // 2. Material heredado del contexto activo (bloques anteriores).
  if (contextoPrevio.materialActual) {
    return contextoPrevio;
  }

  // 3. Memoria documental, solo como respaldo cuando todavía no
  //    hay ningún material activo (ni en el bloque, ni heredado).
  if (memoria && offsetPagina !== undefined) {
    const posicionAbsoluta = offsetPagina + bloque.inicio;
    const contexto: ContextoEnPosicion = consultarContextoEnPosicion(memoria, posicionAbsoluta);
    if (contexto.materialActivo) {
      return {
        materialActual: contexto.materialActivo,
        familia: contexto.familiaActiva,
        subfamilia: contexto.subfamiliaActiva,
        origen: 'memoria',
      };
    }
  }

  // Ninguna de las tres fuentes tiene un material todavía.
  return { materialActual: null, familia: null, subfamilia: null, origen: contextoPrevio.origen };
}

// ── Resuelve el material final de UN registro puntual (una
//    propiedad o atributo encontrado dentro de una ventana local
//    dentro del bloque). Por defecto hereda el ContextoMaterial
//    del bloque. Si la ventana ESTRECHA alrededor de esta mención
//    concreta nombra un material distinto, esa mención local pesa
//    más — cubre el caso de un bloque largo (ej. tabla comparativa)
//    que toca más de un material. Si no hay ningún material ni en
//    el contexto ni en la ventana, se intenta inferir por
//    componente antes de dejarlo vacío. ───────────────────────────
function resolverMaterialDeRegistro(
  ventana: string,
  contextoMaterial: ContextoMaterial,
  componenteInfo: { nombre: string; materialAsociado: string | null } | null,
  materiales: EntradaMaterial[]
): { material: string | null; familia: string | null; subfamilia: string | null; origen: ContextoMaterial['origen']; inferidoPorComponente: boolean } {
  const materialVentana = buscarMaterial(ventana, materiales);
  if (materialVentana.material && materialVentana.material !== contextoMaterial.materialActual) {
    return { ...materialVentana, origen: 'ventana', inferidoPorComponente: false };
  }

  if (contextoMaterial.materialActual) {
    return {
      material: contextoMaterial.materialActual,
      familia: contextoMaterial.familia,
      subfamilia: contextoMaterial.subfamilia,
      origen: contextoMaterial.origen,
      inferidoPorComponente: false,
    };
  }

  const resuelto = resolverMaterialFinal({ material: null, familia: null, subfamilia: null }, componenteInfo, materiales);
  if (resuelto.material) {
    return { ...resuelto, origen: 'componente' };
  }

  return { material: null, familia: null, subfamilia: null, origen: contextoMaterial.origen, inferidoPorComponente: false };
}

// ── Extrae todas las propiedades numéricas/constantes dentro de
//    UN bloque, asociándolas al ContextoMaterial vigente. ─────────
function extraerPropiedadesDeBloque(
  bloque: Bloque,
  contextoMaterial: ContextoMaterial,
  materiales: EntradaMaterial[],
  componentes: EntradaMaterial[],
  densidadMenciones: Map<string, number> | undefined,
  rangosCubiertos: [number, number][]
): ResultadoAnalisisPagina['registros'] {
  const registros: ResultadoAnalisisPagina['registros'] = [];
  const texto = bloque.texto;

  for (const propiedad of PROPIEDADES) {
    const terminos = [propiedad.nombre_es, propiedad.nombre_en, ...propiedad.sinonimos];

    for (const termino of terminos) {
      if (!termino) continue;
      const regexTermino = new RegExp(`\\b${escaparRegex(termino)}\\b`, 'gi');
      let match: RegExpExecArray | null;

      while ((match = regexTermino.exec(texto)) !== null) {
        const { ventana, inicioVentana } = tomarVentana(texto, match.index, match.index + termino.length);

        const hallazgoValor = buscarValorYUnidad(ventana, propiedad.magnitudes);
        const ecuacion = buscarEcuacion(ventana, propiedad.simbolos);

        // Sin valor numérico ni ecuación: solo se guarda si la
        // propiedad es del tipo Constante/Ecuación/Ley.
        if (!hallazgoValor && !ecuacion && !['Constante', 'Ecuación', 'Ley'].includes(propiedad.categoria)) {
          continue;
        }

        const rango = hallazgoValor ? buscarRango(ventana, hallazgoValor.posicion) : null;
        const norma = buscarNorma(ventana);
        const { instrumento, metodo } = buscarInstrumentoYMetodo(ventana);
        const componenteInfo = buscarComponente(ventana, componentes) || buscarComponentePorPatron(ventana);

        const materialFinal = resolverMaterialDeRegistro(ventana, contextoMaterial, componenteInfo, materiales);

        const estadoEncontrado = buscarEstado(ventana);
        const agenteInfo = buscarAgenteExposicion(ventana);
        const momentoExposicion = agenteInfo ? buscarMomentoExposicion(ventana, agenteInfo.posicion) : null;
        const condicionEnsayo = buscarCondicionEnsayo(ventana);
        const observaciones = buscarObservaciones(ventana);
        const relacion = buscarRelacionConOtrasPropiedades(ventana, propiedad.id);
        const origenDato = determinarOrigen(ventana);
        const simboloEncontrado = propiedad.simbolos.find(s => ventana.includes(s)) || null;

        // Explícito si el valor apareció muy cerca del término;
        // Inferido si vino de más lejos en la ventana.
        let nivelConfianza: 'Explícito' | 'Inferido' =
          hallazgoValor && Math.abs(hallazgoValor.posicion - (match.index - inicioVentana)) < 60
            ? 'Explícito'
            : 'Inferido';

        // Material con muy pocas menciones en TODO el documento:
        // nunca se marca "Explícito" aunque el valor haya caído al lado.
        if (densidadMenciones && materialFinal.material && esMencionDeBajaDensidad(materialFinal.material, densidadMenciones)) {
          nivelConfianza = 'Inferido';
        }

        // Material heredado de la memoria documental (sin
        // declaración propia en este bloque) es una señal débil.
        if (materialFinal.origen === 'memoria') {
          nivelConfianza = 'Inferido';
        }

        const controversias = buscarControversiasDeInteres(propiedad.nombre_es);
        const notaControversia = controversias.length > 0
          ? `⚠ Controversia conocida: ${controversias[0].titulo_es}`
          : null;
        const notaMaterialInferido = materialFinal.inferidoPorComponente
          ? `Material inferido a partir del componente "${componenteInfo?.nombre}" (relación de tu catálogo)`
          : null;
        const notaOrigenAsociacion =
          materialFinal.origen === 'titulo' ? 'Material asignado por título de sección/capítulo'
          : materialFinal.origen === 'memoria' ? 'Material heredado de la memoria documental, sin declaración propia en este bloque (revisar)'
          : null;
        const observacionesFinal = [observaciones, notaControversia, notaMaterialInferido, notaOrigenAsociacion].filter(Boolean).join(' | ') || null;

        registros.push({
          nombre_propiedad: propiedad.nombre_es,
          nombre_ingles: propiedad.nombre_en,
          sinonimos: propiedad.sinonimos,
          categoria: propiedad.categoria,
          tipo_propiedad: propiedad.tipo_propiedad,
          familia_material: materialFinal.familia,
          subfamilia_material: materialFinal.subfamilia,
          material: materialFinal.material,
          componente: componenteInfo ? componenteInfo.nombre : null,
          estado_material: estadoEncontrado,
          agente_exposicion: agenteInfo ? agenteInfo.nombre : null,
          momento_exposicion: momentoExposicion,
          unidad: hallazgoValor ? hallazgoValor.unidad : null,
          simbolo: simboloEncontrado,
          valor_encontrado: hallazgoValor ? hallazgoValor.valor : null,
          valor_minimo: rango ? rango.min : null,
          valor_maximo: rango ? rango.max : null,
          condicion_ensayo: condicionEnsayo,
          metodo_ensayo: metodo,
          instrumento_usado: instrumento,
          norma,
          ecuacion_formula: ecuacion,
          relacion_otras_propiedades: relacion,
          nivel_confianza: nivelConfianza,
          origen_dato: origenDato,
          observaciones: observacionesFinal,
        });

        rangosCubiertos.push([bloque.inicio + inicioVentana, bloque.inicio + inicioVentana + ventana.length]);
      }
    }
  }

  return registros;
}

// ── Extrae atributos/cualidades DESCRIPTIVAS dentro de UN bloque.
//    A diferencia de las propiedades, se guardan con solo aparecer
//    mencionadas — no necesitan un valor numérico al lado, porque
//    son adjetivos ("dúctil", "resistente al desgaste"). ──────────
function extraerAtributosDeBloque(
  bloque: Bloque,
  contextoMaterial: ContextoMaterial,
  materiales: EntradaMaterial[],
  componentes: EntradaMaterial[]
): ResultadoAnalisisPagina['registros'] {
  const registros: ResultadoAnalisisPagina['registros'] = [];
  const texto = bloque.texto;

  for (const atributo of ATRIBUTOS) {
    const terminos = [atributo.nombre_es, atributo.nombre_en];
    for (const termino of terminos) {
      if (!termino) continue;
      const regexTermino = new RegExp(`\\b${escaparRegex(termino)}\\b`, 'gi');
      let match: RegExpExecArray | null;

      while ((match = regexTermino.exec(texto)) !== null) {
        const { ventana } = tomarVentana(texto, match.index, match.index + termino.length);

        const componenteInfo = buscarComponente(ventana, componentes) || buscarComponentePorPatron(ventana);
        const materialFinal = resolverMaterialDeRegistro(ventana, contextoMaterial, componenteInfo, materiales);
        const estadoEncontrado = buscarEstado(ventana);
        const agenteInfo = buscarAgenteExposicion(ventana);
        const momentoExposicion = agenteInfo ? buscarMomentoExposicion(ventana, agenteInfo.posicion) : null;
        const origenDato = determinarOrigen(ventana);
        const notaMaterialInferido = materialFinal.inferidoPorComponente
          ? `Material inferido a partir del componente "${componenteInfo?.nombre}" (relación de tu catálogo)`
          : null;

        registros.push({
          nombre_propiedad: atributo.nombre_es,
          nombre_ingles: atributo.nombre_en,
          sinonimos: [],
          categoria: 'Atributo/Cualidad',
          tipo_propiedad: 'Cualitativa',
          familia_material: materialFinal.familia,
          subfamilia_material: materialFinal.subfamilia,
          material: materialFinal.material,
          componente: componenteInfo ? componenteInfo.nombre : null,
          estado_material: estadoEncontrado,
          agente_exposicion: agenteInfo ? agenteInfo.nombre : null,
          momento_exposicion: momentoExposicion,
          unidad: null,
          simbolo: null,
          valor_encontrado: null,
          valor_minimo: null,
          valor_maximo: null,
          condicion_ensayo: null,
          metodo_ensayo: null,
          instrumento_usado: null,
          norma: atributo.norma_metodo || null,
          ecuacion_formula: null,
          relacion_otras_propiedades: atributo.propiedades_asociadas || null,
          nivel_confianza: 'Explícito',
          origen_dato: origenDato,
          observaciones: [atributo.definicion, notaMaterialInferido].filter(Boolean).join(' | ') || null,
        });
      }
    }
  }

  return registros;
}

// ── Candidatos no clasificados: número + unidad conocida (o
//    "sospechosa" de serlo) que no cayó dentro de ninguna ventana
//    ya cubierta por un registro. Opera sobre la página completa,
//    no bloque por bloque, porque es una red de seguridad final. ──
function extraerCandidatosNoClasificados(
  textoNormalizado: string,
  rangosCubiertos: [number, number][]
): CandidatoNoClasificado[] {
  const candidatos: CandidatoNoClasificado[] = [];

  // Unidades catalogadas
  for (const unidad of UNIDADES) {
    for (const variante of unidad.variantes_texto) {
      if (!variante) continue;
      const regex = new RegExp(`(-?\\d{1,4}(?:[.,]\\d{1,6})?)\\s*${escaparRegex(variante)}\\b`, 'gi');
      let m: RegExpExecArray | null;
      while ((m = regex.exec(textoNormalizado)) !== null) {
        const yaCubierto = rangosCubiertos.some(([ini, fin]) => m!.index >= ini && m!.index <= fin);
        if (yaCubierto) continue;

        const inicioFrag = Math.max(0, m.index - 60);
        const finFrag = Math.min(textoNormalizado.length, m.index + variante.length + 60);
        candidatos.push({
          pagina: 0, // se completa en el llamador, que sabe el número real de página
          fragmento: textoNormalizado.substring(inicioFrag, finFrag).trim(),
          numero: m[1],
          unidadDetectada: variante,
        });
      }
    }
  }

  // Número + palabra corta que PARECE unidad pero no está catalogada
  {
    const regexUnidadGenerica = /(-?\d{1,4}(?:[.,]\d{1,6})?)\s*([a-zA-Zµ°%][a-zA-Z°%/²³\.]{0,9})\b/g;
    let m: RegExpExecArray | null;
    const TOPE_UNIDAD_GENERICA = 25;
    let contadorUnidadGenerica = 0;
    while ((m = regexUnidadGenerica.exec(textoNormalizado)) !== null) {
      if (contadorUnidadGenerica >= TOPE_UNIDAD_GENERICA) break;
      const yaCubierto = rangosCubiertos.some(([ini, fin]) => m!.index >= ini && m!.index <= fin);
      if (yaCubierto) continue;
      const posibleUnidad = m[2].toLowerCase();
      const yaConocida = UNIDADES.some(u => u.variantes_texto.some(v => v.toLowerCase() === posibleUnidad));
      if (yaConocida) continue;

      const inicioFrag = Math.max(0, m.index - 60);
      const finFrag = Math.min(textoNormalizado.length, m.index + m[0].length + 60);
      candidatos.push({
        pagina: 0,
        fragmento: textoNormalizado.substring(inicioFrag, finFrag).trim(),
        numero: m[1],
        unidadDetectada: `${m[2]} (no catalogada)`,
      });
      contadorUnidadGenerica++;
    }
  }

  // Campos con forma "Etiqueta: valor" — típico de fichas técnicas
  {
    const regexEtiquetaValor = /\b([A-ZÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚÑáéíóúñ ]{2,40}):\s*([^\n.;]{2,80})/g;
    let m: RegExpExecArray | null;
    const TOPE_ETIQUETA_VALOR = 25;
    let contadorEtiquetaValor = 0;
    while ((m = regexEtiquetaValor.exec(textoNormalizado)) !== null) {
      if (contadorEtiquetaValor >= TOPE_ETIQUETA_VALOR) break;
      const yaCubierto = rangosCubiertos.some(([ini, fin]) => m!.index >= ini && m!.index <= fin);
      if (yaCubierto) continue;

      candidatos.push({
        pagina: 0,
        fragmento: m[0].trim(),
        numero: '',
        unidadDetectada: `etiqueta: "${m[1].trim()}"`,
      });
      contadorEtiquetaValor++;
    }
  }

  return candidatos;
}

// ── Análisis completo de una página ──────────────────────────────
// Los parámetros 4-6 son OPCIONALES: si no se pasan, la función
// funciona igual que antes de estos cambios (útil para código
// viejo que llame a analizarPagina con solo 3 argumentos).
//   - densidadMenciones: baja confianza de materiales con pocas
//     menciones en todo el documento.
//   - memoria + offsetPagina: Memoria Temporal de la Neurona de
//     Comprensión Documental, usada como respaldo (ver prioridad
//     en actualizarContextoMaterial). offsetPagina es la posición
//     donde arranca el texto de ESTA página dentro del texto
//     completo del documento (ya normalizado con espacios simples)
//     — sin este dato la memoria no puede ubicar en qué parte del
//     documento cae cada bloque, así que si se pasa memoria hay
//     que pasar también offsetPagina.
export function analizarPagina(
  textoPagina: string,
  materiales: EntradaMaterial[],
  componentes: EntradaMaterial[],
  densidadMenciones?: Map<string, number>,
  memoria?: MemoriaTemporalDocumento,
  offsetPagina?: number
): ResultadoAnalisisPagina {
  const textoNormalizado = textoPagina.replace(/\s+/g, ' ');
  const bloques = dividirEnBloques(textoNormalizado);

  const registros: ResultadoAnalisisPagina['registros'] = [];
  const rangosCubiertos: [number, number][] = [];

  let contextoMaterial: ContextoMaterial = { materialActual: null, familia: null, subfamilia: null, origen: 'parrafo' };

  // Recorrido documental: bloque por bloque, nunca propiedad por
  // propiedad. El contexto de material persiste entre bloques y
  // solo se reemplaza cuando aparece un material nuevo.
  for (const bloque of bloques) {
    contextoMaterial = actualizarContextoMaterial(bloque, materiales, contextoMaterial, memoria, offsetPagina);

    registros.push(...extraerPropiedadesDeBloque(bloque, contextoMaterial, materiales, componentes, densidadMenciones, rangosCubiertos));
    registros.push(...extraerAtributosDeBloque(bloque, contextoMaterial, materiales, componentes));
  }

  const candidatos = extraerCandidatosNoClasificados(textoNormalizado, rangosCubiertos);

  return { registros, candidatos };
}
