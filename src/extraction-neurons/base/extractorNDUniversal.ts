// ============================================================
// Extractor universal ND v2
// Todas las ND ejecutan el MISMO extractor; cambia solo la
// carpeta de Google Drive. Conserva lo que ya hacia ND para las
// fichas de propiedades y agrega extraccion transversal.
// ============================================================

import { extraerDefinicionesPropiedades } from './extractorDefiniciones';
import { HallazgoND, TipoDocumentoND } from '../memoria-nd/tipos';

const RE_MATERIAL = /\b(?:material|materiales|sustancia|sustancias|mezcla|mezclas|conglomerante|composite|composito)\b/giu;
const RE_COMPONENTE = /\b(?:componente|componentes|fase|constituyente|constituyentes|aditivo|agregado|carga|relleno|binder|aggregate|additive|filler|phase)\b/giu;
const RE_MAGNITUD = /(?:[-+]?\d+(?:[.,]\d+)?(?:\s*[×x]\s*10\s*[−-]?\s*\d+)?\s*(?:±\s*\d+(?:[.,]\d+)?\s*)?(?:MPa|kPa|Pa|GPa|N|kN|kg|g|mg|µm|μm|nm|mm|cm|m|°C|K|%|W\/mK|W\/m·K|J\/kgK|J\/kg·K|g\/cm³|g\/cm3|kg\/m³|kg\/m3|m²|m2|m³|m3|s|min|h|day|d))\b/giu;
const RE_FORMULA = /(?:[A-Za-zα-ωΑ-Ωρσσεε][A-Za-z0-9α-ωΑ-Ωρσσεε₀₁₂₃]*\s*=\s*[^.;\n]{2,180})/gu;
const RE_NORMA = /\b(?:ASTM|ISO|IRAM|EN|UNE|AASHTO|DIN|BS|JIS)\s*[- ]?\s*[A-Z]?\s*\d{2,6}(?:[-:]\d{2,4})?\b/giu;
const RE_RELACION = /\b(?:aumenta|disminuye|incrementa|reduce|depende de|influye|afecta|afectado por|relacionad[oa] con|correlaciona|proporcional|inversamente proporcional|directamente proporcional|associated with|depends on|increases|decreases|affects|correlates with|proportional to)\b[^.;\n]{0,300}/giu;
const RE_CONDICION = /\b(?:temperatura|temperature|humedad|humidity|presión|presion|pressure|tiempo de curado|curing time|edad|age|estado seco|dry state|estado húmedo|estado humedo|wet state|fraguado|setting|curado|cured|saturado|saturated|acondicionamiento|conditioning|velocidad de ensayo|test speed|velocidad de carga|loading rate|pH)\b[^.;\n]{0,220}/giu;
const RE_METODO = /\b(?:método|metodo|procedimiento|ensayo|test|measurement|method|procedure|determination|determinación|technique|técnica)\b[^.;\n]{0,300}/giu;
const RE_INSTRUMENTO = /\b(?:instrumento|instrument|equipo|apparatus|máquina|maquina|machine|microscopio|microscope|balanza|balance|prensa|press|durómetro|durometro|hardness tester|termómetro|termometro|thermometer|calibrador|caliper|espectrómetro|espectrometro|spectrometer)\b[^.;\n]{0,220}/giu;
const RE_APLICACION = /\b(?:aplicación|aplicaciones|application|applications|se utiliza|se usa|used for|used in|suitable for|industria|industry|construction|construcción|manufacturing|fabricación)\b[^.;\n]{0,300}/giu;
const RE_COMPORTAMIENTO = /\b(?:comportamiento|behavior|behaviour|consecuencia|efecto|effect|increases|decreases|aumenta|disminuye|deterioro|degradación|degradation|failure|falla|fractura|fracture|durability|durabilidad)\b[^.;\n]{0,300}/giu;

function normalizar(s: string): string { return s.replace(/\s+/g, ' ').trim(); }
function idioma(texto: string): 'es' | 'en' | 'mixto' {
  const t = texto.toLowerCase();
  const es = (t.match(/\b(?:el|la|los|las|de|del|que|una|un|para|con|se|como|mediante|propiedad|material)\b/g) || []).length;
  const en = (t.match(/\b(?:the|of|and|is|are|a|an|for|with|by|as|used|defined|property|material)\b/g) || []).length;
  if (es && en) return 'mixto';
  return en > es ? 'en' : 'es';
}
function tipoDocumento(nombre: string, texto: string): TipoDocumentoND {
  const n = `${nombre} ${texto.slice(0, 2500)}`.toLowerCase();
  if (/\b(?:datasheet|technical data sheet|ficha técnica|ficha tecnica)\b/.test(n)) return 'ficha_tecnica';
  if (/\b(?:handbook|manual|manual de)\b/.test(n)) return 'manual';
  if (/\b(?:astm|iso|iram|une|aashto|din|standard|norma)\b/.test(n)) return 'norma';
  if (/\b(?:thesis|tesis|dissertation)\b/.test(n)) return 'tesis';
  if (/\b(?:catalog|catálogo|catalogue)\b/.test(n)) return 'catalogo';
  if (/\b(?:journal|article|paper|artículo|articulo)\b/.test(n)) return 'articulo';
  if (/\b(?:book|libro|chapter|capítulo|capitulo)\b/.test(n)) return 'libro';
  if (/\b(?:report|informe)\b/.test(n)) return 'informe';
  return 'desconocido';
}
function contexto(texto: string, inicio: number, fin: number, antes = 240, despues = 600): string {
  return normalizar(texto.slice(Math.max(0, inicio - antes), Math.min(texto.length, fin + despues)));
}
function agregarMatches(out: HallazgoND[], neuronId: string, texto: string, pagina: number, documento: string,
  tipo: HallazgoND['tipo'], regex: RegExp, campo?: string, confianza = 0.5): void {
  regex.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(texto))) {
    const original = normalizar(m[0]);
    const ctx = contexto(texto, m.index, m.index + m[0].length);
    const lang = idioma(ctx);
    out.push({ neuronId, tipo, campo, textoOriginal: original,
      textoNormalizado: normalizar(original.toLowerCase()), contexto: ctx, idioma: lang, confianza,
      evidencia: { documento, pagina, fragmento: ctx, idioma: lang, tipoDocumento: tipoDocumento(documento, texto),
        posicionInicio: m.index, posicionFin: m.index + m[0].length } });
  }
}
function deduplicar(out: HallazgoND[]): HallazgoND[] {
  const seen = new Set<string>();
  return out.filter(h => {
    const key = [h.neuronId, h.tipo, h.campo || '', h.evidencia.documento, h.evidencia.pagina,
      h.textoNormalizado.slice(0, 500)].join('|');
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
}

export function extraerNDUniversal(texto: string, pagina: number, documento: string, neuronId: string): HallazgoND[] {
  const out: HallazgoND[] = [];

  // Conservamos el extractor especializado de definiciones ya existente:
  // cubre los campos acumulables de fichas_propiedades y sus diccionarios ES/EN.
  for (const h of extraerDefinicionesPropiedades(texto)) {
    const ctx = normalizar(h.contenido);
    const lang = h.idioma;
    out.push({ neuronId, tipo: 'DEFINICION', campo: h.campo,
      textoOriginal: ctx, textoNormalizado: normalizar(ctx.toLowerCase()), entidadCandidata: h.nombre_propiedad,
      contexto: ctx, idioma: lang, confianza: 0.65,
      evidencia: { documento, pagina, fragmento: ctx, idioma: lang, tipoDocumento: tipoDocumento(documento, texto) },
      metadatos: { extractor: 'extractorDefiniciones', propiedadCandidata: h.nombre_propiedad } });
  }

  agregarMatches(out, neuronId, texto, pagina, documento, 'MATERIAL', RE_MATERIAL, 'material', 0.45);
  agregarMatches(out, neuronId, texto, pagina, documento, 'COMPONENTE', RE_COMPONENTE, 'componente', 0.45);
  agregarMatches(out, neuronId, texto, pagina, documento, 'MAGNITUD', RE_MAGNITUD, 'valor_unidad', 0.75);
  agregarMatches(out, neuronId, texto, pagina, documento, 'FORMULA', RE_FORMULA, 'formula', 0.6);
  agregarMatches(out, neuronId, texto, pagina, documento, 'NORMA', RE_NORMA, 'norma', 0.8);
  agregarMatches(out, neuronId, texto, pagina, documento, 'RELACION', RE_RELACION, 'relacion', 0.5);
  agregarMatches(out, neuronId, texto, pagina, documento, 'CONDICION', RE_CONDICION, 'condicion_medicion', 0.55);
  agregarMatches(out, neuronId, texto, pagina, documento, 'METODO', RE_METODO, 'metodo_medicion', 0.5);
  agregarMatches(out, neuronId, texto, pagina, documento, 'INSTRUMENTO', RE_INSTRUMENTO, 'instrumento', 0.5);
  agregarMatches(out, neuronId, texto, pagina, documento, 'APLICACION', RE_APLICACION, 'aplicacion', 0.45);
  agregarMatches(out, neuronId, texto, pagina, documento, 'COMPORTAMIENTO', RE_COMPORTAMIENTO, 'comportamiento', 0.45);

  // Reserva de informacion tecnica aun no clasificada: evita perder
  // contenido por no conocer todavia su destino semantico.
  const parrafos = texto.split(/\n{2,}|(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ])/g);
  for (const p of parrafos) {
    const n = normalizar(p);
    if (n.length < 80 || n.length > 2500) continue;
    if (!/[0-9%°]|(?:property|properties|material|component|measure|measurement|propiedad|material|componente|medición|medicion|ensayo|método|metodo)/iu.test(n)) continue;
    const lang = idioma(n);
    out.push({ neuronId, tipo: 'DESCONOCIDO', textoOriginal: n, textoNormalizado: normalizar(n.toLowerCase()),
      contexto: n, idioma: lang, confianza: 0.25,
      evidencia: { documento, pagina, fragmento: n, idioma: lang, tipoDocumento: tipoDocumento(documento, texto) },
      metadatos: { extractor: 'bloque-tecnico', motivo: 'sin-clasificacion-definitiva' } });
  }
  return deduplicar(out);
}
