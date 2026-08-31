// ============================================================
// Extractor universal ND v3
// Todas las ND ejecutan el MISMO extractor; cambia solo la
// carpeta de Google Drive. Conserva definiciones y amplia la
// captura transversal. No clasifica definitivamente.
// ============================================================

import { extraerDefinicionesPropiedades } from './extractorDefiniciones';
import { extraerCandidatosSemanticosND } from './extractorSemanticoND';
import { HallazgoND, TipoDocumentoND } from '../memoria-nd/tipos';

const RE_MATERIAL = /\b(?:material|materiales|sustancia|sustancias|mezcla|mezclas|conglomerante|composite|composites|composito|cemento|cement|gypsum|yeso|glass fiber|fibra de vidrio)\b/giu;
const RE_COMPONENTE = /\b(?:componente|componentes|fase|constituyente|constituyentes|aditivo|agregado|árido|carga|relleno|binder|aggregate|additive|filler|phase|constituent)\b/giu;
const RE_MAGNITUD = /(?:[-+]?\d+(?:[.,]\d+)?(?:\s*[×x]\s*10\s*[−-]?\s*\d+)?\s*(?:±\s*\d+(?:[.,]\d+)?\s*)?(?:MPa|kPa|Pa|GPa|N|kN|MN|kg|g|mg|µm|μm|nm|mm|cm|m|°C|K|%|W\/mK|W\/m·K|J\/kgK|J\/kg·K|g\/cm³|g\/cm3|kg\/m³|kg\/m3|m²|m2|m³|m3|s|min|h|day|days|d|Hz|kHz|V|kV|A|mA|Ω|ohm|S|mol|mol\/L|Pa·s|mPa·s))\b/giu;
const RE_FORMULA = /(?:[A-Za-zα-ωΑ-Ωρσσεε][A-Za-z0-9α-ωΑ-Ωρσσεε₀₁₂₃]*\s*=\s*[^.;\n]{2,220})/gu;
const RE_NORMA = /\b(?:ASTM|ISO|IRAM|EN|UNE|AASHTO|DIN|BS|JIS|IEC|NF|CSA|GB|ABNT)\s*[- ]?\s*[A-Z]?\s*\d{2,6}(?:[-:]\d{2,4})?(?:\s*[-:]?\s*[A-Z]\d{0,3})?\b/giu;
const RE_RELACION = /\b(?:aumenta|disminuye|incrementa|reduce|depende de|influye|afecta|afectado por|relacionad[oa] con|correlaciona|proporcional|inversamente proporcional|directamente proporcional|asociad[oa] con|increase|increases|decrease|decreases|depends on|influences|affects|associated with|correlates with|proportional to|inversely proportional to|directly proportional to)\b[^.;\n]{0,360}/giu;
const RE_CONDICION = /\b(?:temperatura|temperature|humedad|humidity|contenido de humedad|moisture content|presión|presion|pressure|tiempo de curado|curing time|edad|age|estado seco|dry state|estado húmedo|estado humedo|wet state|fraguado|setting|curado|cured|saturado|saturated|acondicionamiento|conditioning|velocidad de ensayo|test speed|velocidad de carga|loading rate|tasa de carga|pH|atmósfera|atmosphere|vacío|vacuum)\b[^.;\n]{0,240}/giu;
const RE_METODO = /\b(?:método|metodo|métodos|metodos|procedimiento|procedimientos|ensayo|ensayos|test|tests|measurement|measurements|method|methods|procedure|procedures|determination|determinación|technique|técnica|protocol|protocolo)\b[^.;\n]{0,340}/giu;
const RE_INSTRUMENTO = /\b(?:instrumento|instrument|instrumentation|equipo|equipment|apparatus|aparato|máquina|maquina|machine|microscopio|microscope|balanza|balance|prensa|press|durómetro|durometro|hardness tester|termómetro|termometro|thermometer|calibrador|caliper|espectrómetro|espectrometro|spectrometer|extensómetro|extensometer|sensor|probe|sonda)\b[^.;\n]{0,240}/giu;
const RE_APLICACION = /\b(?:aplicación|aplicaciones|application|applications|se utiliza|se usa|used for|used in|suitable for|industria|industry|construcción|construction|manufacturing|fabricación|aerospace|automotive|biomedical|packaging|embalaje)\b[^.;\n]{0,320}/giu;
const RE_COMPORTAMIENTO = /\b(?:comportamiento|behavior|behaviour|consecuencia|efecto|effect|increases|decreases|aumenta|disminuye|deterioro|degradación|degradation|failure|falla|fractura|fracture|durability|durabilidad|aging|envejecimiento|damage|daño)\b[^.;\n]{0,320}/giu;
const RE_CABLE = /\b(?:variable de entrada|variable independiente|entrada requerida|input variable|input parameter|required input|dependent variable|variable dependiente|required quantity|magnitud de entrada|se requiere|requires|must be known|known quantity)\b[^.;\n]{0,260}/giu;

function normalizar(s: string): string { return s.replace(/\s+/g, ' ').trim(); }
function idioma(texto: string): 'es' | 'en' | 'mixto' {
  const t = texto.toLowerCase();
  const es = (t.match(/\b(?:el|la|los|las|de|del|que|una|un|para|con|se|como|mediante|propiedad|material|muestra|ensayo|definición|medición)\b/g) || []).length;
  const en = (t.match(/\b(?:the|of|and|is|are|a|an|for|with|by|as|used|defined|property|material|sample|test|measurement|definition)\b/g) || []).length;
  if (es && en) return 'mixto';
  return en > es ? 'en' : 'es';
}
function tipoDocumento(nombre: string, texto: string): TipoDocumentoND {
  const n = `${nombre} ${texto.slice(0, 5000)}`.toLowerCase();
  if (/\b(?:datasheet|technical data sheet|technical datasheet|ficha técnica|ficha tecnica|product data sheet)\b/.test(n)) return 'ficha_tecnica';
  if (/\b(?:handbook|manual|manual de|user guide|guide)\b/.test(n)) return 'manual';
  if (/\b(?:astm|iso|iram|une|aashto|din|standard|norma|specification|specifications)\b/.test(n)) return 'norma';
  if (/\b(?:thesis|tesis|dissertation)\b/.test(n)) return 'tesis';
  if (/\b(?:catalog|catálogo|catalogue|product catalogue)\b/.test(n)) return 'catalogo';
  if (/\b(?:journal|article|paper|artículo|articulo|proceedings)\b/.test(n)) return 'articulo';
  if (/\b(?:book|libro|chapter|capítulo|capitulo|textbook)\b/.test(n)) return 'libro';
  if (/\b(?:report|informe|technical report)\b/.test(n)) return 'informe';
  if (/\b(?:patent|patente)\b/.test(n)) return 'patente';
  if (/\b(?:presentation|presentación|slides|diapositivas)\b/.test(n)) return 'presentacion';
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
      h.evidencia.posicionInicio ?? '', h.textoNormalizado.slice(0, 500)].join('|');
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
}

export function extraerNDUniversal(texto: string, pagina: number, documento: string, neuronId: string): HallazgoND[] {
  const out: HallazgoND[] = [];

  for (const h of extraerDefinicionesPropiedades(texto)) {
    const ctx = normalizar(h.contenido);
    const lang = h.idioma;
    out.push({ neuronId, tipo: 'DEFINICION', campo: h.campo,
      textoOriginal: ctx, textoNormalizado: normalizar(ctx.toLowerCase()), entidadCandidata: h.nombre_propiedad,
      contexto: ctx, idioma: lang, confianza: 0.65,
      evidencia: { documento, pagina, fragmento: ctx, idioma: lang, tipoDocumento: tipoDocumento(documento, texto) },
      metadatos: { extractor: 'extractorDefiniciones', propiedadCandidata: h.nombre_propiedad } });
  }

  // Candidatos de propiedades y atributos usan los diccionarios vivos de ARKON.
  out.push(...extraerCandidatosSemanticosND(texto, pagina, documento, neuronId));

  agregarMatches(out, neuronId, texto, pagina, documento, 'MATERIAL', RE_MATERIAL, 'material', 0.45);
  agregarMatches(out, neuronId, texto, pagina, documento, 'COMPONENTE', RE_COMPONENTE, 'componente', 0.45);
  agregarMatches(out, neuronId, texto, pagina, documento, 'MAGNITUD', RE_MAGNITUD, 'valor_unidad', 0.75);
  agregarMatches(out, neuronId, texto, pagina, documento, 'FORMULA', RE_FORMULA, 'formula', 0.6);
  agregarMatches(out, neuronId, texto, pagina, documento, 'NORMA', RE_NORMA, 'norma', 0.8);
  agregarMatches(out, neuronId, texto, pagina, documento, 'RELACION', RE_RELACION, 'relacion', 0.55);
  agregarMatches(out, neuronId, texto, pagina, documento, 'CONDICION', RE_CONDICION, 'condicion_medicion', 0.55);
  agregarMatches(out, neuronId, texto, pagina, documento, 'METODO', RE_METODO, 'metodo_medicion', 0.55);
  agregarMatches(out, neuronId, texto, pagina, documento, 'INSTRUMENTO', RE_INSTRUMENTO, 'instrumento', 0.55);
  agregarMatches(out, neuronId, texto, pagina, documento, 'APLICACION', RE_APLICACION, 'aplicacion', 0.45);
  agregarMatches(out, neuronId, texto, pagina, documento, 'COMPORTAMIENTO', RE_COMPORTAMIENTO, 'comportamiento', 0.45);
  agregarMatches(out, neuronId, texto, pagina, documento, 'CABLE', RE_CABLE, 'entrada_cable', 0.5);

  // Conserva bloques tecnicos que todavia no tienen clase segura.
  const parrafos = texto.split(/\n{2,}|(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ])/g);
  for (const p of parrafos) {
    const n = normalizar(p);
    if (n.length < 80 || n.length > 2500) continue;
    if (!/[0-9%°]|(?:property|properties|material|component|measure|measurement|specimen|sample|test|method|formula|propiedad|material|componente|medición|medicion|muestra|espécimen|ensayo|método|fórmula)/iu.test(n)) continue;
    const lang = idioma(n);
    out.push({ neuronId, tipo: 'DESCONOCIDO', textoOriginal: n, textoNormalizado: normalizar(n.toLowerCase()),
      contexto: n, idioma: lang, confianza: 0.25,
      evidencia: { documento, pagina, fragmento: n, idioma: lang, tipoDocumento: tipoDocumento(documento, texto) },
      metadatos: { extractor: 'bloque-tecnico', motivo: 'sin-clasificacion-definitiva' } });
  }
  return deduplicar(out);
}
