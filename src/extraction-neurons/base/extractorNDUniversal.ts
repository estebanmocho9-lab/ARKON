// ============================================================
// Extractor universal ND v4
// Todas las ND ejecutan el MISMO extractor; cambia únicamente
// la carpeta de Google Drive asignada a cada neurona.
//
// ND pertenece a la RED DE EXTRACCIÓN. Su trabajo es conservar
// evidencia documental amplia, explícita y trazable. NO intenta
// convertirse en la NE cuantitativa: la extracción fina de
// propiedad + valor + unidad queda principalmente en NE.
//
// Importante: ND no razona científicamente ni decide todavía la
// clasificación definitiva. Detecta candidatos, contexto y
// fragmentos completos para que la clasificación posterior no
// pierda información.
// ============================================================

import { extraerDefinicionesPropiedades } from './extractorDefiniciones';
import { extraerCandidatosSemanticosND } from './extractorSemanticoND';
import { HallazgoND, TipoDocumentoND } from '../memoria-nd/tipos';

const RE_MATERIAL = /\b(?:material|materiales|sustancia|sustancias|mezcla|mezclas|conglomerante|composite|composites|compuesto|compuestos|cemento|cement|gypsum|yeso|glass fiber|fibra de vidrio)\b/giu;
const RE_COMPONENTE = /\b(?:componente|componentes|fase|constituyente|constituyentes|aditivo|agregado|árido|carga|relleno|binder|aggregate|additive|filler|phase|constituent)\b/giu;
const RE_NORMA = /\b(?:ASTM|ISO|IRAM|EN|UNE|AASHTO|DIN|BS|JIS|IEC|NF|CSA|GB|ABNT)\s*[- ]?\s*[A-Z]?\s*\d{2,6}(?:[-:]\d{2,4})?(?:\s*[-:]?\s*[A-Z]\d{0,3})?\b/giu;

// Frases que suelen introducir relaciones científicas explícitas.
const RE_RELACION = /\b(?:aumenta|aumentar|aumentado|incrementa|incrementar|incremento|reduce|reducir|reducido|disminuye|disminuir|disminución|depende de|depender de|influye|influye en|afecta|afectado por|relacionad[oa] con|correlaciona|correlacionado|proporcional|inversamente proporcional|directamente proporcional|increase|increases|increased|increase in|decrease|decreases|decreased|decrease in|reduces|reduced|depends on|influences|affects|affected by|associated with|correlates with|correlated with|proportional to|inversely proportional|directly proportional)\b[^.;\n]{0,520}/giu;

const RE_CONDICION = /\b(?:temperatura|temperature|humedad|humidity|contenido de humedad|moisture content|presión|presion|pressure|tiempo de curado|curing time|edad|age|estado seco|dry state|estado húmedo|estado humedo|wet state|fraguado|setting|curado|cured|sin curar|uncured|saturado|saturated|acondicionamiento|conditioning|velocidad de ensayo|test speed|velocidad de carga|loading rate|tasa de carga|pH|atmósfera|atmosphere|vacío|vacuum|tiempo de exposición|exposure time|ciclo térmico|thermal cycle)\b[^.;\n]{0,420}/giu;

const RE_METODO = /\b(?:método|metodo|métodos|metodos|procedimiento|procedimientos|ensayo|ensayos|test|tests|measurement|measurements|method|methods|procedure|procedures|determination|determinación|technique|técnica|protocol|protocolo|characterization|caracterización)\b[^.;\n]{0,520}/giu;
const RE_INSTRUMENTO = /\b(?:instrumento|instrument|instrumentation|equipo|equipment|apparatus|aparato|máquina|maquina|machine|microscopio|microscope|balanza|balance|prensa|press|durómetro|durometro|hardness tester|termómetro|termometro|thermometer|calibrador|caliper|espectrómetro|espectrometro|spectrometer|extensómetro|extensometer|sensor|probe|sonda)\b[^.;\n]{0,420}/giu;
const RE_APLICACION = /\b(?:aplicación|aplicaciones|application|applications|se utiliza|se usa|utilizado para|utilizada para|used for|used in|suitable for|industria|industry|construcción|construction|manufacturing|fabricación|aerospace|automotive|biomedical|packaging|embalaje)\b[^.;\n]{0,520}/giu;
const RE_COMPORTAMIENTO = /\b(?:comportamiento|behavior|behaviour|consecuencia|consecuencias|efecto|efectos|effect|effects|deterioro|degradación|degradation|failure|falla|fallas|fractura|fracture|durability|durabilidad|aging|envejecimiento|damage|daño|resistencia|rigidez|deformación|deformation|cracking|fisuración|porosidad|porosity|permeabilidad|permeability)\b[^.;\n]{0,520}/giu;
const RE_COMPOSICION = /\b(?:composición|composicion|composition|contenido de|content of|formado por|formada por|composed of|consists of|contains|contiene|constituido por|constituted by|made of|hecho de|porcentaje|percentage|proporción|proportion|ratio)\b[^.;\n]{0,620}/giu;
const RE_PROCESO = /\b(?:fabricación|fabricacion|manufactura|manufacturing|production|producción|produccion|obtención|obtencion|preparación|preparacion|preparation|mezclado|mixing|molienda|grinding|secado|drying|curado|curing|fraguado|setting|sinterización|sinterization|calcinación|calcination|tratamiento|treatment|procesamiento|processing)\b[^.;\n]{0,620}/giu;
const RE_DETERIORO = /\b(?:deterioro|degradación|degradacion|degradation|deterioration|daño|damage|falla|fallo|failure|fractura|fracture|fisura|fisuración|crack|cracking|corrosión|corrosion|desgaste|wear|fatiga|fatigue|ataque químico|chemical attack|chemical degradation)\b[^.;\n]{0,620}/giu;
const RE_RECOMENDACION = /\b(?:recomendado|recomendada|recomendación|recomendacion|se recomienda|debe utilizarse|debe evitarse|recommended|recommendation|recommended practice|should be used|should be avoided|not recommended|no se recomienda)\b[^.;\n]{0,520}/giu;
const RE_LIMITACION = /\b(?:limitación|limitaciones|limitacion|limitations|limitado|limited|desventaja|desventajas|drawback|drawbacks|disadvantage|disadvantages|no es adecuado|no resulta adecuado|not suitable|not applicable|cannot be used|no puede utilizarse)\b[^.;\n]{0,520}/giu;
const RE_COMPARACION = /\b(?:a diferencia de|diferente de|se diferencia de|comparado con|comparada con|en comparación con|similar a|semejante a|distinto de|different from|differs from|compared with|compared to|in comparison with|similar to|unlike|whereas|while)\b[^.;\n]{0,520}/giu;
const RE_SEGURIDAD = /\b(?:seguridad|riesgo|riesgos|peligro|peligros|safety|risk|risks|hazard|hazards|precaución|precauciones|precaution|precautions|toxic|tóxico|tóxica|corrosive|corrosivo)\b[^.;\n]{0,520}/giu;

function normalizar(s: string): string { return s.replace(/\s+/g, ' ').trim(); }

function idioma(texto: string): 'es' | 'en' | 'mixto' {
  const t = texto.toLowerCase();
  const es = (t.match(/\b(?:el|la|los|las|de|del|que|una|un|para|con|se|como|mediante|propiedad|material|muestra|ensayo|definición|definicion|medición|medicion|resultado|puede|debe|cuando|entre)\b/g) || []).length;
  const en = (t.match(/\b(?:the|of|and|is|are|a|an|for|with|by|as|used|defined|property|material|sample|test|measurement|definition|result|can|must|when|between)\b/g) || []).length;
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
  if (/\b(?:book|libro|chapter|capítulo|capitulo|textbook|handbook)\b/.test(n)) return 'libro';
  if (/\b(?:report|informe|technical report)\b/.test(n)) return 'informe';
  if (/\b(?:patent|patente)\b/.test(n)) return 'patente';
  if (/\b(?:presentation|presentación|slides|diapositivas)\b/.test(n)) return 'presentacion';
  if (/\b(?:technical document|documento técnico|documento tecnico)\b/.test(n)) return 'documento_tecnico';
  return 'desconocido';
}

function contexto(texto: string, inicio: number, fin: number, antes = 320, despues = 900): string {
  return normalizar(texto.slice(Math.max(0, inicio - antes), Math.min(texto.length, fin + despues)));
}

function agregarMatches(
  out: HallazgoND[], neuronId: string, texto: string, pagina: number, documento: string,
  tipo: HallazgoND['tipo'], regex: RegExp, campo: string, confianza = 0.5,
): void {
  regex.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(texto))) {
    const original = normalizar(m[0]);
    const ctx = contexto(texto, m.index, m.index + m[0].length);
    const lang = idioma(ctx);
    out.push({
      neuronId, tipo, campo, textoOriginal: original,
      textoNormalizado: normalizar(original.toLowerCase()), contexto: ctx,
      idioma: lang, confianza,
      evidencia: {
        documento, pagina, fragmento: ctx, idioma: lang,
        tipoDocumento: tipoDocumento(documento, texto),
        posicionInicio: m.index, posicionFin: m.index + m[0].length,
      },
      metadatos: { extractor: 'extractorNDUniversal', alcance: 'documental_semantico' },
    });
  }
}

function extraerBloquesExplicitos(
  texto: string, pagina: number, documento: string, neuronId: string,
): HallazgoND[] {
  const out: HallazgoND[] = [];
  const bloques = texto.split(/\n{2,}/g);
  let cursor = 0;

  for (const bloque of bloques) {
    const n = normalizar(bloque);
    const inicio = texto.indexOf(bloque, cursor);
    cursor = inicio >= 0 ? inicio + bloque.length : cursor + bloque.length;
    if (n.length < 100 || n.length > 4000) continue;

    // ND conserva párrafos técnicos completos, no solo la palabra que disparó
    // el patrón. Esto es especialmente importante para libros y manuales.
    const relevante = /(?:\b(?:material|materials|materiales|material|property|properties|propiedad|propiedades|component|components|componente|componentes|sample|specimen|muestra|probeta|test|tests|ensayo|ensayos|method|methods|método|métodos|measurement|medición|medicion|behavior|behaviour|comportamiento|composition|composición|manufacturing|fabrication|fabricación|degradation|degradación|failure|falla|application|aplicación|recommended|recomendado|limitation|limitación|microstructure|microestructura|mechanism|mecanismo|cause|causa|effect|efecto|depends|depende)\b)/iu.test(n);
    if (!relevante) continue;

    const lang = idioma(n);
    out.push({
      neuronId,
      tipo: 'EVIDENCIA',
      campo: 'fragmento_explicito',
      textoOriginal: n,
      textoNormalizado: n.toLowerCase(),
      contexto: n,
      idioma: lang,
      confianza: 0.55,
      evidencia: {
        documento, pagina, fragmento: n, idioma: lang,
        tipoDocumento: tipoDocumento(documento, texto),
        ...(inicio >= 0 ? { posicionInicio: inicio, posicionFin: inicio + bloque.length } : {}),
      },
      metadatos: {
        extractor: 'bloco-explicito-nd',
        alcance: 'parrafo_tecnico_completo',
        clasificacionPosterior: true,
      },
    });
  }
  return out;
}

export function extraerNDUniversal(texto: string, pagina: number, documento: string, neuronId: string): HallazgoND[] {
  const out: HallazgoND[] = [];

  // 1) Definiciones: se conservan como evidencia textual completa.
  for (const h of extraerDefinicionesPropiedades(texto)) {
    const ctx = normalizar(h.contenido);
    const lang = h.idioma;
    out.push({
      neuronId, tipo: 'DEFINICION', campo: h.campo,
      textoOriginal: ctx, textoNormalizado: normalizar(ctx.toLowerCase()),
      entidadCandidata: h.nombre_propiedad, contexto: ctx, idioma: lang,
      confianza: 0.65,
      evidencia: { documento, pagina, fragmento: ctx, idioma: lang, tipoDocumento: tipoDocumento(documento, texto) },
      metadatos: { extractor: 'extractorDefiniciones', propiedadCandidata: h.nombre_propiedad },
    });
  }

  // 2) Menciones semánticas: material, componente, propiedad y atributo.
  //    Son candidatos, no clasificación definitiva.
  out.push(...extraerCandidatosSemanticosND(texto, pagina, documento, neuronId));

  // 3) Evidencia documental explícita de alto valor.
  agregarMatches(out, neuronId, texto, pagina, documento, 'MATERIAL', RE_MATERIAL, 'mencion_material', 0.45);
  agregarMatches(out, neuronId, texto, pagina, documento, 'COMPONENTE', RE_COMPONENTE, 'mencion_componente', 0.45);
  agregarMatches(out, neuronId, texto, pagina, documento, 'NORMA', RE_NORMA, 'norma', 0.8);
  agregarMatches(out, neuronId, texto, pagina, documento, 'RELACION', RE_RELACION, 'relacion_explicita', 0.62);
  agregarMatches(out, neuronId, texto, pagina, documento, 'CONDICION', RE_CONDICION, 'condicion', 0.6);
  agregarMatches(out, neuronId, texto, pagina, documento, 'METODO', RE_METODO, 'metodo', 0.6);
  agregarMatches(out, neuronId, texto, pagina, documento, 'INSTRUMENTO', RE_INSTRUMENTO, 'instrumento', 0.6);
  agregarMatches(out, neuronId, texto, pagina, documento, 'APLICACION', RE_APLICACION, 'aplicacion', 0.55);
  agregarMatches(out, neuronId, texto, pagina, documento, 'COMPORTAMIENTO', RE_COMPORTAMIENTO, 'comportamiento', 0.58);
  agregarMatches(out, neuronId, texto, pagina, documento, 'RELACION', RE_COMPOSICION, 'composicion', 0.6);
  agregarMatches(out, neuronId, texto, pagina, documento, 'EVIDENCIA', RE_PROCESO, 'proceso', 0.58);
  agregarMatches(out, neuronId, texto, pagina, documento, 'COMPORTAMIENTO', RE_DETERIORO, 'deterioro_falla', 0.65);
  agregarMatches(out, neuronId, texto, pagina, documento, 'APLICACION', RE_RECOMENDACION, 'recomendacion', 0.62);
  agregarMatches(out, neuronId, texto, pagina, documento, 'DEFINICION', RE_LIMITACION, 'limitacion', 0.62);
  agregarMatches(out, neuronId, texto, pagina, documento, 'RELACION', RE_COMPARACION, 'comparacion', 0.58);
  agregarMatches(out, neuronId, texto, pagina, documento, 'CONDICION', RE_SEGURIDAD, 'seguridad_riesgo', 0.65);

  // 4) Bloques completos para no perder información que ningún patrón
  //    específico haya capturado.
  out.push(...extraerBloquesExplicitos(texto, pagina, documento, neuronId));

  return deduplicar(out);
}

function deduplicar(out: HallazgoND[]): HallazgoND[] {
  const seen = new Set<string>();
  return out.filter(h => {
    const key = [h.neuronId, h.tipo, h.campo || '', h.evidencia.documento,
      h.evidencia.pagina, h.evidencia.posicionInicio ?? '', h.textoNormalizado.slice(0, 1200)].join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
