// ============================================================
// Metadatos documentales científicos de ND.
// ND conserva cómo está presentado un dato en el documento
// (experimental, teórico, aproximado, rango de validez, estado,
// muestra, microestructura, limitación, ventaja, etc.), pero no
// convierte números/unidades en magnitudes científicas. Esa
// extracción cuantitativa fina corresponde a NE.
// ============================================================

import { HallazgoND } from '../memoria-nd/tipos';

const PATRONES: Array<{ campo: string; tipo: HallazgoND['tipo']; regex: RegExp; confianza: number }> = [
  { campo: 'origen_del_dato', tipo: 'EVIDENCIA', confianza: 0.65, regex: /\b(?:measured|measured experimentally|experimental(?:ly)?|measured value|reported value|calculated|calculated value|estimated|estimate|theoretical|theoretically|simulated|simulation|predicted|literature value|valor medido|medido experimentalmente|valor experimental|valor reportado|calculado|estimado|te[oó]rico|simulado|predicho|valor de literatura)\b[^.;\n]{0,320}/giu },
  { campo: 'incertidumbre_reportada', tipo: 'EVIDENCIA', confianza: 0.8, regex: /(?:±|\+\/-|uncertainty|uncertainty of|standard uncertainty|expanded uncertainty|incertidumbre|incertidumbre de|desviaci[oó]n est[aá]ndar|standard deviation|coefficient of variation|CV)\s*[^.;\n]{0,260}/giu },
  { campo: 'precision_reportada', tipo: 'EVIDENCIA', confianza: 0.65, regex: /\b(?:significant figures|significant digits|decimal places|cifras significativas|d[ií]gitos significativos|decimales)\b[^.;\n]{0,180}/giu },
  { campo: 'rango_validez', tipo: 'CONDICION', confianza: 0.65, regex: /\b(?:valid range|applicable range|range of validity|valid for|within the range|rango v[aá]lido|rango de validez|aplicable en el rango|v[aá]lido para)\b[^.;\n]{0,360}/giu },
  { campo: 'estado_de_muestra', tipo: 'CONDICION', confianza: 0.6, regex: /\b(?:dry|wet|moist|saturated|unsaturated|fresh|hardened|cured|uncured|green|powder|paste|slurry|solid|liquid|gas|seco|h[uú]medo|saturado|no saturado|fresco|endurecido|curado|sin curar|verde|polvo|pasta|lechada|s[oó]lido|l[ií]quido|gas)\b[^.;\n]{0,260}/giu },
  { campo: 'muestra_especimen', tipo: 'EVIDENCIA', confianza: 0.6, regex: /\b(?:sample|specimen|test specimen|test piece|muestra|esp[eé]cimen|probeta|cuerpo de prueba|pieza de ensayo)\b[^.;\n]{0,320}/giu },
  { campo: 'geometria_de_ensayo', tipo: 'CONDICION', confianza: 0.65, regex: /\b(?:geometry|geometr[ií]a|cylindrical|cylinder|cubical|cube|prismatic|prism|disc|disk|plate|beam|cyl[ií]ndric[oa]|cubo|prism[aá]tic[oa]|disco|placa|viga)\b[^.;\n]{0,260}/giu },
  { campo: 'preacondicionamiento', tipo: 'CONDICION', confianza: 0.65, regex: /\b(?:preconditioning|pre-conditioned|conditioning period|acondicionamiento previo|preacondicionamiento|periodo de acondicionamiento)\b[^.;\n]{0,320}/giu },
  { campo: 'microestructura', tipo: 'COMPORTAMIENTO', confianza: 0.6, regex: /\b(?:microstructure|microstructural|microestructura|microestructural|grain size|tamaño de grano|pore structure|estructura de poros|interfacial transition zone|zona de transici[oó]n interfacial)\b[^.;\n]{0,360}/giu },
  { campo: 'efecto_aumento', tipo: 'RELACION', confianza: 0.65, regex: /\b(?:increases?|increased|increase in|aumenta|aumentado|incremento de|mayor|higher|greater)\b[^.;\n]{0,360}/giu },
  { campo: 'efecto_disminucion', tipo: 'RELACION', confianza: 0.65, regex: /\b(?:decreases?|decreased|decrease in|reduces?|reduced|disminuye|disminuci[oó]n de|menor|lower|smaller)\b[^.;\n]{0,360}/giu },
  { campo: 'resultado_empirico', tipo: 'EVIDENCIA', confianza: 0.6, regex: /\b(?:empirical|empirically|experimental results?|observed|observed experimentally|emp[ií]rico|emp[ií]ricamente|resultados experimentales|observado|observado experimentalmente)\b[^.;\n]{0,360}/giu },
  { campo: 'resultado_teorico', tipo: 'EVIDENCIA', confianza: 0.6, regex: /\b(?:theoretical|theoretically|theory predicts?|theoretical value|te[oó]rico|te[oó]ricamente|la teor[ií]a predice|valor te[oó]rico)\b[^.;\n]{0,360}/giu },
  { campo: 'estimacion_aproximacion', tipo: 'EVIDENCIA', confianza: 0.55, regex: /\b(?:approximately|approx\.?|approximation|estimated|roughly|about|aproximadamente|aprox\.?|aproximaci[oó]n|estimado|alrededor de)\b[^.;\n]{0,260}/giu },
  { campo: 'propiedad_inversa_negativa', tipo: 'RELACION', confianza: 0.6, regex: /\b(?:inverse property|inverse relationship|negative relationship|inversely related|propiedad inversa|relaci[oó]n inversa|relaci[oó]n negativa|inversamente relacionada)\b[^.;\n]{0,320}/giu },
  { campo: 'historia_origen_concepto', tipo: 'DEFINICION', confianza: 0.45, regex: /\b(?:first introduced|introduced by|first described|historically|history of|origin of the term|introducido por primera vez|descrito por primera vez|hist[oó]ricamente|historia del concepto|origen del t[eé]rmino)\b[^.;\n]{0,360}/giu },
  { campo: 'limitacion', tipo: 'DEFINICION', confianza: 0.55, regex: /\b(?:limitation|limitations|drawback|drawbacks|disadvantage|disadvantages|limitaci[oó]n|limitaciones|desventaja|desventajas|no es adecuado|not suitable|not applicable)\b[^.;\n]{0,360}/giu },
  { campo: 'ventaja', tipo: 'DEFINICION', confianza: 0.55, regex: /\b(?:advantage|advantages|benefit|benefits|ventaja|ventajas|beneficio|beneficios|particularly useful|especially useful)\b[^.;\n]{0,360}/giu },
  { campo: 'recomendacion_uso', tipo: 'APLICACION', confianza: 0.55, regex: /\b(?:recommended|recommendation|recommended use|should be used|recommended practice|recomendado|recomendaci[oó]n|se recomienda|debe utilizarse|uso recomendado|buena pr[aá]ctica)\b[^.;\n]{0,360}/giu },
];

function normalizar(s: string): string { return s.replace(/\s+/g, ' ').trim(); }
function idioma(texto: string): 'es' | 'en' | 'mixto' {
  const t = texto.toLowerCase();
  const es = (t.match(/\b(?:el|la|los|las|de|del|que|una|un|para|con|se|como|muestra|ensayo|medición|medicion|resultado|cuando|entre)\b/g) || []).length;
  const en = (t.match(/\b(?:the|of|and|is|are|a|an|for|with|by|as|sample|test|measurement|result|when|between)\b/g) || []).length;
  if (es && en) return 'mixto';
  return en > es ? 'en' : 'es';
}

export function extraerMetadatosCientificosND(texto: string, pagina: number, documento: string, neuronId: string): HallazgoND[] {
  const out: HallazgoND[] = [];
  for (const p of PATRONES) {
    p.regex.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = p.regex.exec(texto))) {
      const original = normalizar(m[0]);
      const inicio = Math.max(0, m.index - 260);
      const fin = Math.min(texto.length, m.index + m[0].length + 760);
      const ctx = normalizar(texto.slice(inicio, fin));
      const lang = idioma(ctx);
      out.push({
        neuronId, tipo: p.tipo, campo: p.campo,
        textoOriginal: original, textoNormalizado: original.toLowerCase(),
        contexto: ctx, idioma: lang, confianza: p.confianza,
        evidencia: { documento, pagina, fragmento: ctx, idioma: lang, tipoDocumento: 'desconocido', posicionInicio: m.index, posicionFin: m.index + m[0].length },
        metadatos: { extractor: 'metadatosCientificosND', alcance: 'documental', clasificacionPosterior: true },
      });
    }
  }
  return out;
}
