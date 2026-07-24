// ============================================================
// src/extraction-neurons/base/motorExtraccion.ts
// El motor de análisis de UNA página de texto. Nada de IA: solo
// diccionarios + expresiones regulares + reglas de proximidad,
// tal como pide la especificación (sección 5 y 6).
//
// Nota de organización: la especificación original preveía toda
// esta lógica dentro de NeuronExtraccionBase.ts; se separó en
// este archivo (mismo carpeta base/) solo para que el código no
// sea un archivo gigante de 700 líneas — es el único cambio de
// estructura respecto al documento, nada de lógica cambia.
// ============================================================

import { PROPIEDADES } from '../diccionarios/propiedades';
import { UNIDADES, variantesDeMagnitud } from '../diccionarios/unidades';
import { INSTRUMENTOS } from '../diccionarios/instrumentos';
import { buscarNorma } from '../diccionarios/normas';
import { ATRIBUTOS } from '../diccionarios/atributos';
import { buscarControversiasDeInteres } from '../diccionarios/controversias';
import { EntradaMaterial, PropiedadExtraida } from './tipos';

const VENTANA_CONTEXTO = parseInt(process.env.VENTANA_CONTEXTO || '150', 10);

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

function escaparRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ── Ventana de contexto alrededor de una coincidencia ────────────
function tomarVentana(texto: string, inicio: number, fin: number): { ventana: string; inicioVentana: number } {
  const inicioVentana = Math.max(0, inicio - VENTANA_CONTEXTO);
  const finVentana = Math.min(texto.length, fin + VENTANA_CONTEXTO);
  return { ventana: texto.substring(inicioVentana, finVentana), inicioVentana };
}

// ── Busca un valor numérico + unidad de una magnitud dada, dentro
//    de una ventana de texto ─────────────────────────────────────
function buscarValorYUnidad(ventana: string, magnitudes: string[]): { valor: string; unidad: string; posicion: number } | null {
  const variantes = magnitudes.flatMap(m => variantesDeMagnitud(m)).filter(Boolean);
  if (variantes.length === 0) return null;

  const patronUnidades = variantes.map(escaparRegex).join('|');
  const regex = new RegExp(`(-?\\d{1,4}(?:[.,]\\d{1,6})?(?:e[-+]?\\d+)?)\\s*(${patronUnidades})|(${patronUnidades})\\s*(-?\\d{1,4}(?:[.,]\\d{1,6})?(?:e[-+]?\\d+)?)`, 'i');
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
  if (!match) return null;
  const a = parseFloat(match[1].replace(',', '.'));
  const b = parseFloat(match[2].replace(',', '.'));
  if (isNaN(a) || isNaN(b)) return null;
  return { min: Math.min(a, b), max: Math.max(a, b) };
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

// ── Material dentro de la ventana ÚNICAMENTE. Se sacó el "plan B"
//    de buscar en la página completa: eso era lo que causaba que
//    un material sin relación real apareciera pegado a una
//    propiedad que no tenía nada que ver (falso positivo real que
//    encontramos en la primera corrida) ─────────────────────────
function buscarMaterial(
  ventana: string,
  materiales: EntradaMaterial[]
): { material: string | null; familia: string | null; subfamilia: string | null } {
  for (const entrada of materiales) {
    const terminos = [entrada.nombre_es, entrada.nombre_en, ...entrada.sinonimos];
    for (const termino of terminos) {
      if (!termino || termino.length < 3) continue;
      const regex = new RegExp(`\\b${escaparRegex(termino)}\\b`, 'i');
      if (regex.test(ventana)) {
        return { material: entrada.nombre_es, familia: entrada.familia, subfamilia: entrada.subfamilia || null };
      }
    }
  }
  return { material: null, familia: null, subfamilia: null };
}

// ── Componente dentro de la ventana, contra su propio diccionario
//    (separado del de materiales) ───────────────────────────────
function buscarComponente(ventana: string, componentes: EntradaMaterial[]): string | null {
  for (const entrada of componentes) {
    const terminos = [entrada.nombre_es, entrada.nombre_en, ...entrada.sinonimos];
    for (const termino of terminos) {
      if (!termino || termino.length < 3) continue;
      const regex = new RegExp(`\\b${escaparRegex(termino)}\\b`, 'i');
      if (regex.test(ventana)) return entrada.nombre_es;
    }
  }
  return null;
}

// ── Ecuación / fórmula: patrón "símbolo = expresión", pero ahora
//    EXIGE que el símbolo sea uno de los símbolos propios de la
//    propiedad que ya matcheó (ρ, E, G, etc.) — antes aceptaba
//    cualquier letra + número ("q3 = 181") sin relación real con
//    la propiedad detectada. Esto elimina ese tipo de falso
//    positivo. ──────────────────────────────────────────────────
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

// ── Análisis completo de una página ──────────────────────────────
export function analizarPagina(
  textoPagina: string,
  materiales: EntradaMaterial[],
  componentes: EntradaMaterial[]
): ResultadoAnalisisPagina {
  const registros: ResultadoAnalisisPagina['registros'] = [];
  const candidatos: CandidatoNoClasificado[] = [];
  const rangosCubiertos: [number, number][] = [];

  const textoNormalizado = textoPagina.replace(/\s+/g, ' ');

  for (const propiedad of PROPIEDADES) {
    const terminos = [propiedad.nombre_es, propiedad.nombre_en, ...propiedad.sinonimos];

    for (const termino of terminos) {
      if (!termino) continue;
      const regexTermino = new RegExp(`\\b${escaparRegex(termino)}\\b`, 'gi');
      let match: RegExpExecArray | null;

      while ((match = regexTermino.exec(textoNormalizado)) !== null) {
        const { ventana, inicioVentana } = tomarVentana(textoNormalizado, match.index, match.index + termino.length);

        const hallazgoValor = buscarValorYUnidad(ventana, propiedad.magnitudes);
        const ecuacion = buscarEcuacion(ventana, propiedad.simbolos);

        // Sin valor numérico ni ecuación: solo se guarda si la
        // propiedad es del tipo Constante/Ecuación/Ley (esas sí
        // valen aunque no traigan un número asociado en esta
        // ventana puntual).
        if (!hallazgoValor && !ecuacion && !['Constante', 'Ecuación', 'Ley'].includes(propiedad.categoria)) {
          continue;
        }

        const rango = hallazgoValor ? buscarRango(ventana, hallazgoValor.posicion) : null;
        const norma = buscarNorma(ventana);
        const { instrumento, metodo } = buscarInstrumentoYMetodo(ventana);
        const materialInfo = buscarMaterial(ventana, materiales);
        const componenteEncontrado = buscarComponente(ventana, componentes);
        const condicionEnsayo = buscarCondicionEnsayo(ventana);
        const observaciones = buscarObservaciones(ventana);
        const relacion = buscarRelacionConOtrasPropiedades(ventana, propiedad.id);
        const origen = determinarOrigen(ventana);

        const simboloEncontrado = propiedad.simbolos.find(s => ventana.includes(s)) || null;

        // Explícito si el valor apareció muy cerca del término
        // (misma zona inmediata); Inferido si vino de más lejos
        // en la ventana.
        const nivelConfianza: 'Explícito' | 'Inferido' =
          hallazgoValor && Math.abs(hallazgoValor.posicion - (match.index - inicioVentana)) < 60
            ? 'Explícito'
            : 'Inferido';

        // Si existe una controversia científica conocida sobre esta
        // propiedad, se anota como alerta en observaciones (además de
        // lo que ya se haya encontrado ahí).
        const controversias = buscarControversiasDeInteres(propiedad.nombre_es);
        const notaControversia = controversias.length > 0
          ? `⚠ Controversia conocida: ${controversias[0].titulo_es}`
          : null;
        const observacionesFinal = [observaciones, notaControversia].filter(Boolean).join(' | ') || null;

        registros.push({
          nombre_propiedad: propiedad.nombre_es,
          nombre_ingles: propiedad.nombre_en,
          sinonimos: propiedad.sinonimos,
          categoria: propiedad.categoria,
          tipo_propiedad: propiedad.tipo_propiedad,
          familia_material: materialInfo.familia,
          subfamilia_material: materialInfo.subfamilia,
          material: materialInfo.material,
          componente: componenteEncontrado,
          unidad: hallazgoValor ? hallazgoValor.unidad : null,
          simbolo: simboloEncontrado,
          valor_encontrado: hallazgoValor ? hallazgoValor.valor : (ecuacion ? null : null),
          valor_minimo: rango ? rango.min : null,
          valor_maximo: rango ? rango.max : null,
          condicion_ensayo: condicionEnsayo,
          metodo_ensayo: metodo,
          instrumento_usado: instrumento,
          norma,
          ecuacion_formula: ecuacion,
          relacion_otras_propiedades: relacion,
          nivel_confianza: nivelConfianza,
          origen_dato: origen,
          observaciones: observacionesFinal,
        });

        rangosCubiertos.push([inicioVentana, inicioVentana + ventana.length]);
      }
    }
  }

  // ── Atributos/cualidades DESCRIPTIVAS: a diferencia de las
  //    propiedades de arriba, estas se guardan con solo aparecer
  //    mencionadas — no necesitan un valor numérico al lado, porque
  //    son adjetivos ("dúctil", "resistente al desgaste"), no
  //    magnitudes. Cubre el caso de un libro que describe un
  //    material con palabras en vez de cifras. ────────────────────
  for (const atributo of ATRIBUTOS) {
    const terminos = [atributo.nombre_es, atributo.nombre_en];
    for (const termino of terminos) {
      if (!termino) continue;
      const regexTermino = new RegExp(`\\b${escaparRegex(termino)}\\b`, 'gi');
      let match: RegExpExecArray | null;

      while ((match = regexTermino.exec(textoNormalizado)) !== null) {
        const { ventana } = tomarVentana(textoNormalizado, match.index, match.index + termino.length);

        const materialInfo = buscarMaterial(ventana, materiales);
        const componenteEncontrado = buscarComponente(ventana, componentes);
        const origen = determinarOrigen(ventana);

        registros.push({
          nombre_propiedad: atributo.nombre_es,
          nombre_ingles: atributo.nombre_en,
          sinonimos: [],
          categoria: 'Atributo/Cualidad',
          tipo_propiedad: 'Cualitativa',
          familia_material: materialInfo.familia,
          subfamilia_material: materialInfo.subfamilia,
          material: materialInfo.material,
          componente: componenteEncontrado,
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
          origen_dato: origen,
          observaciones: atributo.definicion,
        });
      }
    }
  }

  // ── Candidatos no clasificados: número + unidad conocida que no
  //    cayó dentro de ninguna ventana ya cubierta ─────────────────
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

  return { registros, candidatos };
}
