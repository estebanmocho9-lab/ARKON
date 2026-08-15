// ============================================================
// src/extraction-neurons/base/extractorDefiniciones.ts
// VERSION MEJORADA: captura parrafo completo alrededor del
// hallazgo (no solo la frase pegada al patron), y cubre los
// 38 campos de fichas_propiedades.
// ============================================================

import { PROPIEDADES } from '../diccionarios/propiedades';
import { PATRONES_DEFINICION } from '../diccionarios/patronesDefinicionPropiedad';
import { PATRONES_DEFINICION_2 } from '../diccionarios/patronesDefinicion2';
import { PATRONES_DEFINICION_3 } from '../diccionarios/patronesDefinicion3';
import { PATRONES_DEFINICION_4 } from '../diccionarios/patronesDefinicion4';

const TODOS_LOS_PATRONES = [
  ...PATRONES_DEFINICION,
  ...PATRONES_DEFINICION_2,
  ...PATRONES_DEFINICION_3,
  ...PATRONES_DEFINICION_4,
];

// Ventana ampliada y BIDIRECCIONAL: antes se miraba solo hacia
// adelante de la mencion (perdiendo definiciones que el libro
// escribe antes de nombrar la propiedad). Ahora se mira tambien
// hacia atras. El "despues" se subio de 500 a 2000 caracteres
// para dar lugar a parrafos largos de handbooks tecnicos.
const VENTANA_ANTES = 800;
const VENTANA_DESPUES = 2000;

// Cuanto contexto se guarda alrededor del match encontrado
// (antes y despues), expandido a limites de oracion cuando se puede
const CONTEXTO_ANTES = 150;
const CONTEXTO_DESPUES = 350;
const LARGO_MAXIMO_CONTENIDO = 700;

function escaparRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface HallazgoDefinicion {
  nombre_propiedad: string;
  campo: string;
  contenido: string;
  idioma: 'es' | 'en';
}

function detectarIdioma(texto: string): 'es' | 'en' {
  const minusc = texto.toLowerCase();
  const marcadoresEs = ['de', 'la', 'el', 'que', 'es', 'una', 'del', 'las', 'los'];
  const marcadoresEn = ['the', 'of', 'is', 'and', 'to', 'in', 'as', 'by', 'with'];

  let puntajeEs = 0;
  let puntajeEn = 0;
  for (const palabra of minusc.split(/\s+/)) {
    if (marcadoresEs.includes(palabra)) puntajeEs++;
    if (marcadoresEn.includes(palabra)) puntajeEn++;
  }
  return puntajeEn > puntajeEs ? 'en' : 'es';
}

// Expande el fragmento encontrado hacia atras y adelante dentro
// de la ventana completa, buscando limites de oracion (punto
// seguido de mayuscula, o simplemente el limite de caracteres
// si no encuentra un punto cerca) — asi el contenido guardado
// es un parrafo/contexto amplio, no solo la frase corta del regex.
function expandirContexto(ventanaCompleta: string, inicioMatch: number, finMatch: number): string {
  let inicio = Math.max(0, inicioMatch - CONTEXTO_ANTES);
  let fin = Math.min(ventanaCompleta.length, finMatch + CONTEXTO_DESPUES);

  // Intentar retroceder hasta el inicio de una oracion (despues de un punto)
  const trozoAntes = ventanaCompleta.substring(inicio, inicioMatch);
  const ultimoPunto = trozoAntes.lastIndexOf('. ');
  if (ultimoPunto !== -1) {
    inicio = inicio + ultimoPunto + 2;
  }

  // Intentar avanzar hasta el fin de una oracion
  const trozoDespues = ventanaCompleta.substring(finMatch, fin);
  const proximoPunto = trozoDespues.indexOf('. ');
  if (proximoPunto !== -1) {
    fin = finMatch + proximoPunto + 1;
  }

  return ventanaCompleta.substring(inicio, fin).trim().slice(0, LARGO_MAXIMO_CONTENIDO);
}

// Un simbolo de una sola letra latina (n, e, D...) es demasiado
// comun en texto corrido — aparece como palabra suelta en
// cualquier parrafo sin relacion con la propiedad. Para esos,
// solo cuenta como mencion real si aparece en contexto de
// formula/valor (seguido de "=" o ":"). Simbolos griegos o de
// mas de un caracter (ρ, φ, ρb, WA, d50...) son lo bastante
// distintivos como para buscarse directo.
function esSimboloAmbiguo(simbolo: string): boolean {
  return /^[a-zA-Z]$/.test(simbolo);
}

function construirRegexMencion(termino: string, esSimbolo: boolean): RegExp {
  const escapado = escaparRegex(termino);
  if (esSimbolo && esSimboloAmbiguo(termino)) {
    // Solo cuenta si esta en contexto de formula/valor
    return new RegExp(`\\b${escapado}\\s*[=:]`, 'giu');
  }
  if (esSimbolo) {
    // Simbolos griegos o de varios caracteres: sin \b (no siempre
    // es fiable con letras griegas), pero lo bastante distintivos
    return new RegExp(`${escapado}`, 'giu');
  }
  return new RegExp(`\\b${escapado}\\b`, 'gi');
}

export function extraerDefinicionesPropiedades(texto: string): HallazgoDefinicion[] {
  const resultados: HallazgoDefinicion[] = [];
  const textoNormalizado = texto.replace(/\s+/g, ' ');

  for (const propiedad of PROPIEDADES) {
    const terminosNombre = [propiedad.nombre_es, propiedad.nombre_en, ...propiedad.sinonimos]
      .filter((t) => t && t.length >= 4)
      .map((t) => ({ termino: t as string, esSimbolo: false }));
    const terminosSimbolo = (propiedad.simbolos || [])
      .filter((s) => !!s)
      .map((s) => ({ termino: s, esSimbolo: true }));
    const terminos = [...terminosNombre, ...terminosSimbolo];

    for (const { termino, esSimbolo } of terminos) {
      const regexTermino = construirRegexMencion(termino, esSimbolo);
      let m: RegExpExecArray | null;

      while ((m = regexTermino.exec(textoNormalizado)) !== null) {
        const inicioMencion = m.index;
        const finMencion = m.index + termino.length;
        const inicioVentana = Math.max(0, inicioMencion - VENTANA_ANTES);
        const finVentana = Math.min(textoNormalizado.length, finMencion + VENTANA_DESPUES);
        const ventana = textoNormalizado.substring(inicioVentana, finVentana);

        for (const patron of TODOS_LOS_PATRONES) {
          const regexLocal = new RegExp(patron.regex.source, patron.regex.flags.includes('g') ? patron.regex.flags.replace('g', '') : patron.regex.flags);
          const match = regexLocal.exec(ventana);
          if (match && match.index !== undefined) {
            const contenidoAmplio = expandirContexto(ventana, match.index, match.index + match[0].length);

            // Validacion extra para 'diferenciacion_con_conceptos_similares':
            // palabras como "unlike"/"a diferencia de" aparecen muchas veces
            // sin comparar conceptos de verdad (ej. "studs having unlike
            // threads"). Se exige que el contenido mencione OTRA propiedad
            // conocida — asi confirmamos que realmente esta comparando dos
            // propiedades, no una coincidencia de palabra suelta.
            if (patron.campo === 'diferenciacion_con_conceptos_similares') {
              const mencionaOtraPropiedad = PROPIEDADES.some((otra) => {
                if (otra.id === propiedad.id) return false;
                const terminosOtra = [otra.nombre_es, otra.nombre_en, ...otra.sinonimos];
                return terminosOtra.some(
                  (t) => t && t.length > 3 && contenidoAmplio.toLowerCase().includes(t.toLowerCase())
                );
              });
              if (!mencionaOtraPropiedad) continue; // descartado, no es una comparacion real
            }

            resultados.push({
              nombre_propiedad: propiedad.id,
              campo: patron.campo,
              contenido: contenidoAmplio,
              idioma: detectarIdioma(contenidoAmplio),
            });
          }
        }
      }
    }
  }

  return resultados;
}
