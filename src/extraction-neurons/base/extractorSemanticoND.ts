// ============================================================
// Extraccion semantica ND (sin clasificacion definitiva).
// Busca entidades que ya tienen vocabulario en ARKON y atributos
// fisicos/medibles frecuentes en literatura ES/EN.
// No asigna una entidad a ninguna de las 100 neuronas cientificas.
// ============================================================

import { PROPIEDADES } from '../diccionarios/propiedades';
import { HallazgoND } from '../memoria-nd/tipos';

function normalizar(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

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

const ATRIBUTOS: Array<{ termino: string; sinonimos: string[] }> = [
  { termino: 'masa', sinonimos: ['mass', 'weight'] },
  { termino: 'fuerza', sinonimos: ['force'] },
  { termino: 'longitud', sinonimos: ['length'] },
  { termino: 'ancho', sinonimos: ['width'] },
  { termino: 'altura', sinonimos: ['height'] },
  { termino: 'espesor', sinonimos: ['thickness'] },
  { termino: 'área', sinonimos: ['area'] },
  { termino: 'volumen', sinonimos: ['volume'] },
  { termino: 'temperatura', sinonimos: ['temperature'] },
  { termino: 'presión', sinonimos: ['pressure'] },
  { termino: 'tiempo', sinonimos: ['time'] },
  { termino: 'humedad', sinonimos: ['humidity', 'moisture'] },
  { termino: 'deformación', sinonimos: ['strain', 'deformation'] },
  { termino: 'desplazamiento', sinonimos: ['displacement'] },
  { termino: 'velocidad', sinonimos: ['velocity', 'speed'] },
  { termino: 'aceleración', sinonimos: ['acceleration'] },
  { termino: 'frecuencia', sinonimos: ['frequency'] },
  { termino: 'concentración', sinonimos: ['concentration'] },
  { termino: 'porcentaje', sinonimos: ['percentage', 'percent'] },
  { termino: 'contenido de agua', sinonimos: ['water content', 'moisture content'] },
  { termino: 'diámetro', sinonimos: ['diameter'] },
  { termino: 'porosidad', sinonimos: ['porosity'] },
];

function escapar(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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
    neuronId,
    tipo,
    campo,
    textoOriginal: termino,
    textoNormalizado: termino.toLowerCase(),
    entidadCandidata: termino,
    contexto: ctx,
    idioma: lang,
    confianza,
    evidencia: {
      documento,
      pagina,
      fragmento: ctx,
      idioma: lang,
      tipoDocumento: 'desconocido',
      posicionInicio: indice,
      posicionFin: indice + termino.length,
    },
    metadatos,
  };
}

/**
 * Extrae menciones de propiedades conocidas por el diccionario y
 * atributos primitivos. Son CANDIDATOS: el clasificador posterior
 * decidirá si la mención realmente representa esa entidad.
 */
export function extraerCandidatosSemanticosND(
  texto: string,
  pagina: number,
  documento: string,
  neuronId: string,
): HallazgoND[] {
  const out: HallazgoND[] = [];
  const normalizado = texto.replace(/\s+/g, ' ');

  for (const propiedad of PROPIEDADES) {
    const terminos = [propiedad.nombre_es, propiedad.nombre_en, ...(propiedad.sinonimos || [])]
      .filter((t): t is string => !!t && t.trim().length >= 4);
    const unicos = [...new Set(terminos.map(t => t.trim()))];
    for (const termino of unicos) {
      const re = new RegExp(`\\b${escapar(termino)}\\b`, 'giu');
      let m: RegExpExecArray | null;
      while ((m = re.exec(normalizado))) {
        out.push(crearHallazgo(
          neuronId,
          'PROPIEDAD',
          'mencion_propiedad',
          m[0],
          normalizado,
          pagina,
          documento,
          m.index,
          0.7,
          { propiedadDiccionario: propiedad.id, terminoDiccionario: termino },
        ));
      }
    }
  }

  for (const atributo of ATRIBUTOS) {
    const terminos = [atributo.termino, ...atributo.sinonimos];
    for (const termino of terminos) {
      const re = new RegExp(`\\b${escapar(termino)}\\b`, 'giu');
      let m: RegExpExecArray | null;
      while ((m = re.exec(normalizado))) {
        out.push(crearHallazgo(
          neuronId,
          'ATRIBUTO',
          'atributo_primitivo',
          m[0],
          normalizado,
          pagina,
          documento,
          m.index,
          0.55,
          { atributoBase: atributo.termino, sinonimo: termino !== atributo.termino },
        ));
      }
    }
  }

  return out;
}
