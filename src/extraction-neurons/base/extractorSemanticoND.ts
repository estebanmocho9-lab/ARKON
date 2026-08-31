// ============================================================
// Extraccion semantica ND (sin clasificacion definitiva).
// Reutiliza los diccionarios cientificos de ARKON para reconocer
// propiedades y atributos en documentos ES/EN.
// No asigna una entidad a ninguna de las 100 neuronas cientificas.
// ============================================================

import { PROPIEDADES } from '../diccionarios/propiedades';
import { ATRIBUTOS } from '../diccionarios/atributos';
import { HallazgoND } from '../memoria-nd/tipos';

function normalizar(s: string): string { return s.replace(/\s+/g, ' ').trim(); }

function idioma(texto: string): 'es' | 'en' | 'mixto' {
  const t = texto.toLowerCase();
  const es = (t.match(/\b(?:el|la|los|las|de|del|que|una|un|para|con|se|como|mediante|propiedad|material|muestra|ensayo)\b/g) || []).length;
  const en = (t.match(/\b(?:the|of|and|is|are|a|an|for|with|by|as|used|defined|property|material|sample|test|measurement)\b/g) || []).length;
  if (es && en) return 'mixto';
  return en > es ? 'en' : 'es';
}

function contexto(texto: string, inicio: number, fin: number): string {
  return normalizar(texto.slice(Math.max(0, inicio - 260), Math.min(texto.length, fin + 650)));
}

function escapar(s: string): string { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function crearHallazgo(
  neuronId: string,
  tipo: HallazgoND['tipo'],
  campo: string,
  termino: string,
  texto: string,
  pagina: number,
  documento: string,
  indice: number,
  confianza: number,
  metadatos?: Record<string, unknown>,
): HallazgoND {
  const ctx = contexto(texto, indice, indice + termino.length);
  const lang = idioma(ctx);
  return {
    neuronId, tipo, campo,
    textoOriginal: termino,
    textoNormalizado: termino.toLowerCase(),
    entidadCandidata: termino,
    contexto: ctx,
    idioma: lang,
    confianza,
    evidencia: {
      documento, pagina, fragmento: ctx, idioma: lang,
      tipoDocumento: 'desconocido',
      posicionInicio: indice, posicionFin: indice + termino.length,
    },
    metadatos,
  };
}

/** Reconoce candidatos usando los vocabularios ya existentes en ARKON. */
export function extraerCandidatosSemanticosND(
  texto: string, pagina: number, documento: string, neuronId: string,
): HallazgoND[] {
  const out: HallazgoND[] = [];
  const normalizado = texto.replace(/\s+/g, ' ');

  for (const propiedad of PROPIEDADES) {
    const terminos = [...new Set([
      propiedad.nombre_es, propiedad.nombre_en, ...(propiedad.sinonimos || []), ...(propiedad.simbolos || []),
    ].filter((t): t is string => !!t && t.trim().length >= 2).map(t => t.trim()))];

    for (const termino of terminos) {
      // Simbolos de una letra son ambiguos; solo se reconocen cerca de
      // una expresion de formula/valor para evitar falsos positivos masivos.
      const esSimbolo = (propiedad.simbolos || []).includes(termino);
      const patron = esSimbolo && termino.length === 1
        ? `(?<![A-Za-z0-9])${escapar(termino)}(?=\\s*[=:])`
        : `(?<![\\p{L}\\p{N}])${escapar(termino)}(?![\\p{L}\\p{N}])`;
      const re = new RegExp(patron, 'giu');
      let m: RegExpExecArray | null;
      while ((m = re.exec(normalizado))) {
        out.push(crearHallazgo(neuronId, 'PROPIEDAD', 'mencion_propiedad', m[0], normalizado,
          pagina, documento, m.index, esSimbolo ? 0.62 : 0.7,
          { propiedadDiccionario: propiedad.id, terminoDiccionario: termino, esSimbolo }));
      }
    }
  }

  // Los atributos descriptivos de ARKON son distintos de las propiedades
  // cuantitativas: pueden aparecer sin ningun numero al lado.
  for (const atributo of ATRIBUTOS) {
    const terminos = [...new Set([atributo.nombre_es, atributo.nombre_en]
      .filter(Boolean).map(t => t.trim()).filter(t => t.length >= 4))];
    for (const termino of terminos) {
      const re = new RegExp(`(?<![\\p{L}\\p{N}])${escapar(termino)}(?![\\p{L}\\p{N}])`, 'giu');
      let m: RegExpExecArray | null;
      while ((m = re.exec(normalizado))) {
        out.push(crearHallazgo(neuronId, 'ATRIBUTO', 'atributo_descriptivo', m[0], normalizado,
          pagina, documento, m.index, 0.62,
          { atributoDiccionario: atributo.id, terminoDiccionario: termino }));
      }
    }
  }

  return out;
}
