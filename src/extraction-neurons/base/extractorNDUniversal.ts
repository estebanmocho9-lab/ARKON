// ============================================================
// Extractor universal ND v1
// Todas las ND ejecutan EL MISMO extractor. Lo unico que cambia
// entre ND01...ND10 es la carpeta de Google Drive que procesan.
// El extractor conserva candidatos; NO decide todavia a que una
// de las 100 neuronas cientificas pertenece un hallazgo.
// ============================================================

import { HallazgoND, TipoCandidatoND, TipoDocumentoND } from '../memoria-nd/tipos';

const RE_MATERIAL = /\b(?:material|materiales|sustancia|mezcla|conglomerante|composite|composito|cemento|yeso|fibra de vidrio)\b/giu;
const RE_COMPONENTE = /\b(?:componente|componentes|fase|constituyente|constituyentes|clinker|clínker|aditivo|agregado|carga|relleno)\b/giu;
const RE_UNIDAD = /(?:\d+(?:[.,]\d+)?\s*(?:±\s*\d+(?:[.,]\d+)?\s*)?(?:MPa|kPa|Pa|GPa|N|kN|kg|g|mg|mm|cm|m|°C|K|%|\%|W\/mK|W\/m·K|g\/cm³|kg\/m³|kg\/m3|m²|m2|m³|m3|s|min|h))\b/giu;
const RE_FORMULA = /(?:[A-Za-zρσσεε][A-Za-z0-9ρσσεε₀₁₂₃]*\s*=\s*[^.;\n]{2,120})/gu;
const RE_NORMA = /\b(?:ASTM|ISO|IRAM|EN|UNE|AASHTO|DIN)\s*[- ]?\s*[A-Z]?\s*\d{2,6}(?:[-:]\d{2,4})?\b/giu;
const RE_RELACION = /\b(?:aumenta|disminuye|incrementa|reduce|depende de|influye|afecta|relacionad[oa] con|correlaciona|proporcional|inversamente proporcional|directamente proporcional|asociad[oa] con)\b[^.;\n]{0,220}/giu;
const RE_CONDICION = /\b(?:temperatura|humedad|presión|presion|tiempo de curado|edad|estado seco|estado húmedo|estado humedo|fraguado|curado|saturado|acondicionamiento|velocidad de ensayo|velocidad de carga)\b[^.;\n]{0,180}/giu;
const RE_METODO = /\b(?:método|metodo|procedimiento|ensayo|test|measurement|method|procedure|determination|determinación)\b[^.;\n]{0,220}/giu;
const RE_INSTRUMENTO = /\b(?:instrumento|instrument|equipo|apparatus|máquina|maquina|microscopio|balanza|prensa|durómetro|durometro|termómetro|termometro|calibrador|espectrómetro|espectrometro)\b[^.;\n]{0,180}/giu;
const RE_DEFINICION = /\b(?:se define como|definido como|definición|definicion|se entiende por|means|defined as|definition|is the|is a measure of|refers to)\b[^.;\n]{0,420}/giu;
const RE_APLICACION = /\b(?:aplicación|aplicaciones|application|applications|se utiliza|se usa|used for|used in|suitable for|industria|industry)\b[^.;\n]{0,240}/giu;
const RE_COMPORTAMIENTO = /\b(?:comportamiento|behavior|behaviour|consecuencia|efecto|effect|increases|decreases|aumenta|disminuye|deterioro|degradación|degradation|failure|falla|fractura)\b[^.;\n]{0,240}/giu;

function normalizar(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

function idioma(texto: string): 'es' | 'en' | 'mixto' {
  const t = texto.toLowerCase();
  const es = (t.match(/\b(?:el|la|los|las|de|del|que|una|un|para|con|se|como|mediante)\b/g) || []).length;
  const en = (t.match(/\b(?:the|of|and|is|are|a|an|for|with|by|as|used|defined)\b/g) || []).length;
  if (es > 0 && en > 0) return 'mixto';
  return en > es ? 'en' : 'es';
}

function tipoDocumento(nombre: string): TipoDocumentoND {
  const n = nombre.toLowerCase();
  if (n.includes('ficha') || n.includes('datasheet') || n.includes('technical data')) return 'ficha_tecnica';
  if (n.includes('manual') || n.includes('handbook')) return 'manual';
  if (n.includes('norma') || /\b(?:astm|iso|iram|en)\b/.test(n)) return 'norma';
  if (n.includes('tesis') || n.includes('thesis')) return 'tesis';
  if (n.includes('catalog')) return 'catalogo';
  if (n.includes('paper') || n.includes('journal') || n.includes('article')) return 'articulo';
  if (n.includes('book') || n.includes('libro')) return 'libro';
  return 'desconocido';
}

function contexto(texto: string, inicio: number, fin: number, antes = 220, despues = 520): string {
  const a = Math.max(0, inicio - antes);
  const b = Math.min(texto.length, fin + despues);
  return normalizar(texto.slice(a, b));
}

function agregarMatches(
  out: HallazgoND[],
  neuronId: string,
  texto: string,
  pagina: number,
  documento: string,
  tipo: TipoCandidatoND,
  regex: RegExp,
  campo?: string,
): void {
  regex.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(texto))) {
    const original = normalizar(m[0]);
    const ctx = contexto(texto, m.index, m.index + m[0].length);
    out.push({
      neuronId,
      tipo,
      campo,
      textoOriginal: original,
      textoNormalizado: normalizar(original.toLowerCase()),
      contexto: ctx,
      idioma: idioma(ctx),
      confianza: 0.5,
      evidencia: {
        documento,
        pagina,
        fragmento: ctx,
        idioma: idioma(ctx),
        tipoDocumento: tipoDocumento(documento),
        posicionInicio: m.index,
        posicionFin: m.index + m[0].length,
      },
    });
  }
}

export function extraerNDUniversal(texto: string, pagina: number, documento: string, neuronId: string): HallazgoND[] {
  const out: HallazgoND[] = [];

  // Entidades y vocabulario base.
  agregarMatches(out, neuronId, texto, pagina, documento, 'MATERIAL', RE_MATERIAL, 'identidad_material');
  agregarMatches(out, neuronId, texto, pagina, documento, 'COMPONENTE', RE_COMPONENTE, 'identidad_componente');

  // Magnitudes/atributos documentales. Se conservan como candidatos,
  // aunque todavia no sepamos a que propiedad pertenecen.
  agregarMatches(out, neuronId, texto, pagina, documento, 'MAGNITUD', RE_UNIDAD, 'valor_y_unidad');
  agregarMatches(out, neuronId, texto, pagina, documento, 'FORMULA', RE_FORMULA, 'formula');
  agregarMatches(out, neuronId, texto, pagina, documento, 'NORMA', RE_NORMA, 'norma');
  agregarMatches(out, neuronId, texto, pagina, documento, 'RELACION', RE_RELACION, 'relacion');
  agregarMatches(out, neuronId, texto, pagina, documento, 'CONDICION', RE_CONDICION, 'condicion');
  agregarMatches(out, neuronId, texto, pagina, documento, 'METODO', RE_METODO, 'metodo_medicion');
  agregarMatches(out, neuronId, texto, pagina, documento, 'INSTRUMENTO', RE_INSTRUMENTO, 'instrumento');
  agregarMatches(out, neuronId, texto, pagina, documento, 'DEFINICION', RE_DEFINICION, 'definicion');
  agregarMatches(out, neuronId, texto, pagina, documento, 'APLICACION', RE_APLICACION, 'aplicacion');
  agregarMatches(out, neuronId, texto, pagina, documento, 'COMPORTAMIENTO', RE_COMPORTAMIENTO, 'comportamiento');

  // Todo parrafo cientifico puede contener informacion valiosa que
  // aun no sabemos clasificar. Lo conservamos como DESCONOCIDO cuando
  // contiene señales de contenido tecnico, evitando guardar paginas
  // enteras sin señal.
  const parrafos = texto.split(/\n{2,}|(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ])/g);
  for (const p of parrafos) {
    const n = normalizar(p);
    if (n.length < 60 || n.length > 2500) continue;
    if (!/[0-9%°]|(?:property|material|component|measure|propiedad|material|componente|medición|medicion|ensayo|método|metodo)/iu.test(n)) continue;
    out.push({
      neuronId,
      tipo: 'DESCONOCIDO',
      textoOriginal: n,
      textoNormalizado: normalizar(n.toLowerCase()),
      contexto: n,
      idioma: idioma(n),
      confianza: 0.25,
      evidencia: {
        documento,
        pagina,
        fragmento: n,
        idioma: idioma(n),
        tipoDocumento: tipoDocumento(documento),
      },
      metadatos: { motivo: 'bloque_tecnico_sin_clasificacion_definitiva' },
    });
  }

  return out;
}
