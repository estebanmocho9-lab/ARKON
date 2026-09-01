// ============================================================
// Captura estructurada exhaustiva para ND.
//
// ND NO interpreta ni convierte unidades: conserva lo que el PDF
// afirma, pero separa candidatos de material, propiedad, valor,
// unidad, método, instrumento, condiciones y relación con su
// evidencia textual. La interpretación científica posterior queda
// fuera de esta capa.
// ============================================================

import { HallazgoND } from '../memoria-nd/tipos';

type Tipo = HallazgoND['tipo'];

const UNIDADES = String.raw`(?:%|ppm|ppb|°C|ºC|K|MPa|GPa|kPa|Pa|N|kN|kg|g|mg|µg|um|μm|mm|cm|m|m²|m3|m³|kg/m3|kg/m³|g/cm3|g/cm³|W/mK|W/m·K|W/(m·K)|W/mK|J/g|J/kg|kJ/kg|MJ/kg|Hz|s|min|h|d|mol|mol/L|M|V|A|Ω|Ohm|mS/cm|S/m)`;
const NUM = String.raw`[-+]?\d+(?:[.,]\d+)?(?:\s*[×x*]\s*10\s*[-+]?\d+)?`;

// Léxico intencionalmente amplio. No decide que sea una propiedad:
// solamente genera candidatos y conserva el contexto.
const PROPIEDADES = /\b(?:densidad|density|porosidad|porosity|absorción|absorption|adsorción|adsorption|resistencia|strength|resistencia a compresión|compressive strength|resistencia a tracción|tensile strength|módulo de elasticidad|elastic modulus|young'?s modulus|módulo|modulus|conductividad térmica|thermal conductivity|conductividad|conductivity|permeabilidad|permeability|viscosidad|viscosity|dureza|hardness|tenacidad|toughness|fragilidad|brittleness|plasticidad|plasticity|elasticidad|elasticity|humedad|moisture|contenido de agua|water content|absorción de agua|water absorption|temperatura|temperature|presión|pressure|pH|superficie específica|specific surface|área superficial|surface area|granulometría|particle size|tamaño de partícula|particle size|tamaño de grano|grain size|porcentaje|percentage|concentración|concentration|composición|composition|masa|mass|volumen|volume|calor específico|specific heat|capacidad calorífica|heat capacity|expansión térmica|thermal expansion|coeficiente de expansión|coefficient of expansion|difusividad|diffusivity|resistividad|resistivity|permitividad|permittivity|porcentaje de absorción|absorción de humedad|humedad relativa|relative humidity|tiempo de fraguado|setting time|tiempo de curado|curing time|edad|age|retracción|shrinkage|fluencia|creep|deformación|strain|esfuerzo|stress|tensión|tension|elongación|elongation|módulo de ruptura|modulus of rupture|resistencia al fuego|fire resistance|aislamiento térmico|thermal insulation|aislamiento acústico|acoustic insulation)\b/giu;

const MATERIALES = /\b(?:cemento(?:\s+portland)?|cement|cal|lime|hormigón|concreto|concrete|mortero|mortar|arcilla|clay|vermiculita|vermiculite|perlita|perlite|pumita|pumice|yeso|gypsum|arena|sand|agregado|aggregate|árido|fibra|fiber|fibre|polímero|polymer|epoxi|epoxy|resina|resin|cerámica|ceramic|vidrio|glass|acero|steel|aluminio|aluminium|aluminum|hierro|iron|cobre|copper|zinc|magnesio|magnesium|titanio|titanium|carbono|carbon|grafito|graphite|celulosa|cellulose|madera|wood|suelo|soil|roca|rock|mineral|minerals?|material|materiales|composite|compuesto|composites|compuestos)\b/giu;

const METODOS = /\b(?:ASTM\s*[A-Z]?\s*[-]?\s*\d+[A-Z-]*|ISO\s*\d+[A-Z-]*|EN\s*\d+[A-Z-]*|DIN\s*\d+[A-Z-]*|método(?:\s+de)?|method(?:\s+of)?|ensayo(?:\s+de)?|test(?:\s+of)?|prueba(?:\s+de)?|procedimiento|procedure|técnica|technique|gravimetría|gravimetric|espectroscopía|spectroscopy|microscopía|microscopy|difracción de rayos X|X-ray diffraction|DRX|XRD|SEM|MEB|TGA|DSC|calorimetría|calorimetry|BET|porosimetría|porosimetry|compresión|compression test|tracción|tensile test|flexión|flexural test)\b/giu;

const INSTRUMENTOS = /\b(?:microscopio|microscope|balanza|balance|termopar|thermocouple|termómetro|thermometer|manómetro|manometer|calorímetro|calorimeter|espectrómetro|spectrometer|difractómetro|diffractometer|reómetro|rheometer|viscosímetro|viscometer|prensa|press|máquina universal|universal testing machine|horno|oven|estufa|furnace|cámara climática|climatic chamber|cámara de humedad|humidity chamber|porosímetro|porosimeter|analizador|analyzer|equipo|instrumento|instrument)\b/giu;

const CONDICIONES = /\b(?:a\s+\d+(?:[.,]\d+)?\s*°?C|at\s+\d+(?:[.,]\d+)?\s*°?C|temperatura(?:\s+de)?|temperature(?:\s+of)?|presión(?:\s+de)?|pressure(?:\s+of)?|humedad(?:\s+relativa)?|relative humidity|seco|dry|húmedo|wet|saturado|saturated|curado|cured|sin curar|uncured|ambiente|ambient|edad(?:\s+de)?|age(?:\s+of)?|durante\s+\d+|for\s+\d+|después de|after|antes de|before|tiempo de|time of|tasa de|rate of|velocidad de|speed of|frecuencia|frequency|tamaño de muestra|sample size|probeta|specimen|muestra|sample)\b/giu;

function normalizar(s: string): string { return s.replace(/\s+/g, ' ').trim(); }
function idioma(texto: string): 'es' | 'en' | 'mixto' {
  const t = texto.toLowerCase();
  const es = (t.match(/\b(?:el|la|los|las|de|del|que|una|un|para|con|se|como|muestra|ensayo|resultado|cuando|entre)\b/g) || []).length;
  const en = (t.match(/\b(?:the|of|and|is|are|a|an|for|with|by|as|sample|test|measurement|result|when|between)\b/g) || []).length;
  return es && en ? 'mixto' : en > es ? 'en' : 'es';
}

function contexto(texto: string, inicio: number, fin: number): string {
  return normalizar(texto.slice(Math.max(0, inicio - 320), Math.min(texto.length, fin + 700)));
}

function agregar(out: HallazgoND[], args: {
  texto: string; tipo: Tipo; campo: string; pagina: number; documento: string;
  neuronId: string; inicio: number; fin: number; contexto: string; confianza?: number;
  entidad?: string; valor?: number; valorTexto?: string; unidad?: string;
}) {
  const ctx = args.contexto;
  const lang = idioma(ctx);
  out.push({
    neuronId: args.neuronId,
    tipo: args.tipo,
    campo: args.campo,
    textoOriginal: normalizar(args.texto),
    textoNormalizado: normalizar(args.texto).toLowerCase(),
    entidadCandidata: args.entidad,
    valor: args.valor,
    valorTexto: args.valorTexto,
    unidad: args.unidad,
    contexto: ctx,
    idioma: lang,
    confianza: args.confianza ?? 0.7,
    evidencia: {
      documento: args.documento, pagina: args.pagina, fragmento: ctx,
      idioma: lang, tipoDocumento: 'desconocido', posicionInicio: args.inicio, posicionFin: args.fin,
    },
    metadatos: { extractor: 'extractorDatosCientificosND', alcance: 'exhaustivo_documental' },
  });
}

function extraerRegex(out: HallazgoND[], texto: string, re: RegExp, tipo: Tipo, campo: string,
  pagina: number, documento: string, neuronId: string, confianza = 0.7) {
  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto))) {
    const c = contexto(texto, m.index, m.index + m[0].length);
    agregar(out, { texto: m[0], tipo, campo, pagina, documento, neuronId,
      inicio: m.index, fin: m.index + m[0].length, contexto: c, confianza });
  }
}

export function extraerDatosCientificosND(texto: string, pagina: number, documento: string, neuronId: string): HallazgoND[] {
  const out: HallazgoND[] = [];

  // Materiales y propiedades: candidatos, no afirmaciones semánticas finales.
  extraerRegex(out, texto, MATERIALES, 'MATERIAL', 'material_candidato', pagina, documento, neuronId, 0.72);
  extraerRegex(out, texto, PROPIEDADES, 'PROPIEDAD', 'propiedad_candidata', pagina, documento, neuronId, 0.72);
  extraerRegex(out, texto, METODOS, 'METODO', 'metodo_candidato', pagina, documento, neuronId, 0.68);
  extraerRegex(out, texto, INSTRUMENTOS, 'INSTRUMENTO', 'instrumento_candidato', pagina, documento, neuronId, 0.65);
  extraerRegex(out, texto, CONDICIONES, 'CONDICION', 'condicion_ensayo_o_contexto', pagina, documento, neuronId, 0.64);

  // Todo número acompañado por unidad queda registrado como magnitud cruda.
  const medicion = new RegExp(`(${NUM})\\s*(${UNIDADES})(?![A-Za-z])`, 'giu');
  let m: RegExpExecArray | null;
  while ((m = medicion.exec(texto))) {
    const numeroTexto = m[1].replace(',', '.');
    const valor = Number(numeroTexto);
    const unidad = normalizar(m[2]);
    const c = contexto(texto, m.index, m.index + m[0].length);
    agregar(out, {
      texto: m[0], tipo: 'MAGNITUD', campo: 'medicion_cuantitativa_cruda', pagina, documento, neuronId,
      inicio: m.index, fin: m.index + m[0].length, contexto: c, confianza: 0.82,
      valor: Number.isFinite(valor) ? valor : undefined, valorTexto: m[1], unidad,
    });
  }

  // Porcentajes sin símbolo y fracciones/composiciones frecuentes.
  const porcentaje = new RegExp(`(${NUM})\\s*(?:por\\s*ciento|percent|percentage)`, 'giu');
  while ((m = porcentaje.exec(texto))) {
    const c = contexto(texto, m.index, m.index + m[0].length);
    agregar(out, { texto: m[0], tipo: 'MAGNITUD', campo: 'porcentaje_crudo', pagina, documento, neuronId,
      inicio: m.index, fin: m.index + m[0].length, contexto: c, confianza: 0.8,
      valor: Number(m[1].replace(',', '.')), valorTexto: m[1], unidad: '%' });
  }

  // Relaciones explícitas: conservamos la oración que conecta variables/materiales.
  const relacion = /[^.!?\n]{0,180}\b(?:aumenta|aumentó|incrementa|incrementó|disminuye|disminuyó|reduce|redujo|increase[sd]?|increased|decrease[sd]?|decreased|depends on|depende de|correlaciona|correlated|proporcional|proportional|inversamente|inversely|directamente|directly)\b[^.!?\n]{0,420}/giu;
  extraerRegex(out, texto, relacion, 'RELACION', 'relacion_causal_o_dependencia', pagina, documento, neuronId, 0.66);

  return out;
}
