import { HallazgoND } from '../memoria-nd/tipos';

const norm = (s: string) => s.replace(/\s+/g, ' ').trim();
const lower = (s: string) => norm(s).toLowerCase();

// Magnitudes: nunca deben terminar clasificadas como PROPIEDAD solo porque
// aparecen junto a verbos como "mide", "determina" o "indica".
const MAGNITUDES = new Set([
  'temperatura','temperature','presión','presion','pressure','humedad','humidity',
  'concentración','concentracion','concentration','tiempo','time','edad','age',
  'masa','mass','volumen','volume','longitud','length','altura','height',
  'espesor','thickness','diámetro','diametro','diameter','área','area',
  'superficie','area superficial','superficie específica','superficie especifica',
  'densidad','density','porcentaje','percentage','proporción','proporcion','proportion',
  'velocidad','velocity','speed','frecuencia','frequency','energía','energia','energy',
  'potencia','power','caudal','flow rate','tensión','tension','stress',
  'deformación','deformacion','strain','fuerza','force','resistencia','strength',
  'módulo','modulo','modulus','ph','pH'.toLowerCase()
]);

// Términos de materiales, incluyendo materiales/minerales frecuentes en
// documentación geológica, de ingeniería y de materiales. No se crean filas
// genéricas: solo se aceptan ocurrencias concretas del texto.
const MATERIAL_RE = /(?<![\p{L}\p{N}])(?:cemento(?:\s+Portland)?|pasta de cemento|yeso|gypsum|hormig[oó]n|concreto|concrete|mortero|mortar|arena|sand|arcilla|clay|vidrio|glass|fibra de vidrio|glass fiber|acero|steel|aluminio|aluminum|cobre|copper|hierro|iron|madera|wood|pl[aá]stico|plastic|resina|resin|pol[ií]mero|polymer|epoxi|epoxy|cer[aá]mica|ceramic|ladrillo|brick|[aá]rido|agregado|aggregate|composite|compuesto|[oó]xido de aluminio|[oó]xido de calcio|[oó]xido de hierro|[oó]xido de silicio|[oó]xido de sodio|[oó]xido de magnesio|al[uú]mina|s[ií]lice|lava|ceniza|p[oó]mez|pumice|obsidiana|basalto|basalt|andesita|andesite|dacita|dacite|riolita|rhyolite|roca|rock|mineral|mineral|suelo|soil|sedimento|sediment|material carbonizado|carb[oó]n|carbon|carbonized material)(?![\p{L}\p{N}])/giu;

const COMPONENT_RE = /(?<![\p{L}\p{N}])(?:bloques?|blocks?|fragmentos?|fragments?|clastos?|clasts?|cristales?|crystals?|fenocristales?|phenocrysts?|matriz|matrix|relleno|filler|aditivo|additive|ligante|binder|fase|phase)(?![\p{L}\p{N}])/giu;

const ATTRIBUTE_RE = /(?<![\p{L}\p{N}])(?:andes[ií]tica?|andesitic|bas[aá]ltica?|basaltic|dac[ií]tica?|dacitic|riol[ií]tica?|rhyolitic|cristalina?|crystalline|porosa?|porous|compacta?|compact|homog[eé]nea?|homogeneous|heterog[eé]nea?|heterogeneous|[uú]nica?|[uú]nico|[aá]cida?|[aá]cido|b[aá]sica?|b[aá]sico|volc[aá]nica?|volcanic|sedimentaria?|sedimentary|metam[oó]rfica?|metamorphic|carbonizada?|carbonizado|carbonized)(?![\p{L}\p{N}])/giu;

function hallazgoBase(h: HallazgoND): HallazgoND {
  return {
    ...h,
    textoOriginal: norm(h.textoOriginal || h.datoDocumental || h.textoNormalizado || ''),
    textoNormalizado: lower(h.textoNormalizado || h.textoOriginal || h.datoDocumental || ''),
    contexto: norm(h.contexto || ''),
  };
}

function esMagnitudNombre(nombre: string): boolean {
  const n = lower(nombre);
  if (MAGNITUDES.has(n)) return true;
  return [...MAGNITUDES].some(x => n === x || n.includes(x) || x.includes(n));
}

function fragmentoCerca(texto: string, termino: string, max = 120): string {
  const i = lower(texto).indexOf(lower(termino));
  if (i < 0) return termino;
  return norm(texto.slice(Math.max(0, i - 45), Math.min(texto.length, i + termino.length + max)));
}

function crearEntidad(
  original: HallazgoND,
  tipo: HallazgoND['tipo'],
  entidad: string,
  aspecto: string,
  dato: string,
  confidence: number,
): HallazgoND {
  const h = hallazgoBase(original);
  const texto = norm(dato);
  return {
    ...h,
    tipo,
    campo: `${tipo.toLowerCase()}_${aspecto}`,
    entidadCandidata: entidad,
    entidadPrincipal: entidad,
    aspecto,
    datoDocumental: texto,
    textoOriginal: texto,
    textoNormalizado: lower(texto),
    confianza: Math.max(h.confianza || 0, confidence),
    metadatos: {
      ...(h.metadatos || {}),
      normalizadorND: 'v1',
      derivadoDe: h.tipo,
      entidadDerivada: true,
    },
  };
}

export function normalizarHallazgosND(
  hallazgos: HallazgoND[],
  texto: string,
  pagina: number,
  documento: string,
  neuronId: string,
): HallazgoND[] {
  const out = hallazgos.map(hallazgoBase);
  const seen = new Set<string>();
  for (const h of out) seen.add(`${h.tipo}|${lower(h.entidadPrincipal || h.entidadCandidata || '')}|${lower(h.aspecto || '')}|${h.evidencia?.posicionInicio ?? ''}`);

  // 1. Corregir falsas PROPIEDADES que en realidad son magnitudes.
  for (const h of out) {
    const entidad = h.entidadPrincipal || h.entidadCandidata || '';
    if (h.tipo === 'PROPIEDAD' && esMagnitudNombre(entidad)) {
      h.tipo = 'MAGNITUD';
      h.campo = `magnitud_${h.aspecto || 'documental'}`;
      h.metadatos = { ...(h.metadatos || {}), normalizadorND: 'v1', reclasificado: 'PROPIEDAD→MAGNITUD', motivo: 'entidad_es_magnitud' };
    }
  }

  // 2. Crear materiales concretos presentes en el texto cuando el extractor
  // documental no los haya generado. La evidencia siempre apunta al fragmento.
  MATERIAL_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = MATERIAL_RE.exec(texto))) {
    const entidad = norm(m[0]);
    const start = m.index;
    const key = `MATERIAL|${lower(entidad)}|denominacion|${start}`;
    if (seen.has(key)) continue;
    const fragmento = fragmentoCerca(texto, entidad);
    const h: HallazgoND = {
      neuronId, tipo: 'MATERIAL', campo: 'material_denominacion',
      textoOriginal: entidad, textoNormalizado: lower(entidad),
      entidadCandidata: entidad, entidadPrincipal: entidad,
      aspecto: 'denominacion', datoDocumental: entidad,
      contexto: fragmento, idioma: 'es', confianza: 0.78,
      evidencia: { documento, pagina, fragmento, idioma: 'es', tipoDocumento: 'desconocido', posicionInicio: start, posicionFin: start + m[0].length },
      metadatos: { extractor: 'normalizadorHallazgosND', normalizadorND: 'v1', derivadoDeTexto: true }
    };
    out.push(h); seen.add(key);
  }

  // 3. Componentes concretos. Se evitan palabras estructurales genéricas.
  COMPONENT_RE.lastIndex = 0;
  while ((m = COMPONENT_RE.exec(texto))) {
    const entidad = norm(m[0]);
    const start = m.index;
    const key = `COMPONENTE|${lower(entidad)}|denominacion|${start}`;
    if (seen.has(key)) continue;
    const fragmento = fragmentoCerca(texto, entidad);
    const h: HallazgoND = {
      neuronId, tipo: 'COMPONENTE', campo: 'componente_denominacion',
      textoOriginal: entidad, textoNormalizado: lower(entidad),
      entidadCandidata: entidad, entidadPrincipal: entidad,
      aspecto: 'denominacion', datoDocumental: entidad,
      contexto: fragmento, idioma: 'es', confianza: 0.70,
      evidencia: { documento, pagina, fragmento, idioma: 'es', tipoDocumento: 'desconocido', posicionInicio: start, posicionFin: start + m[0].length },
      metadatos: { extractor: 'normalizadorHallazgosND', normalizadorND: 'v1', derivadoDeTexto: true }
    };
    out.push(h); seen.add(key);
  }

  // 4. Atributos descriptivos concretos. Se asocian a la entidad más cercana
  // que ya exista en los hallazgos de la página; nunca se inventa "material".
  ATTRIBUTE_RE.lastIndex = 0;
  while ((m = ATTRIBUTE_RE.exec(texto))) {
    const atributo = norm(m[0]);
    const start = m.index;
    const candidatos = out.filter(h => {
      const p = h.evidencia?.posicionInicio;
      return h.tipo === 'MATERIAL' && typeof p === 'number';
    });
    const nearest = candidatos.reduce<HallazgoND | undefined>((best, h) => {
      const p = h.evidencia?.posicionInicio as number;
      return !best || Math.abs(p - start) < Math.abs((best.evidencia?.posicionInicio as number) - start) ? h : best;
    }, undefined);
    if (!nearest) continue;
    const entidad = nearest.entidadPrincipal || nearest.entidadCandidata;
    if (!entidad) continue;
    const key = `ATRIBUTO|${lower(entidad)}|${lower(atributo)}|${start}`;
    if (seen.has(key)) continue;
    const fragmento = fragmentoCerca(texto, atributo);
    const h = crearEntidad(nearest, 'ATRIBUTO', entidad, 'caracteristica_descriptiva', atributo, 0.68);
    h.evidencia = { documento, pagina, fragmento, idioma: 'es', tipoDocumento: 'desconocido', posicionInicio: start, posicionFin: start + atributo.length };
    h.metadatos = { ...(h.metadatos || {}), extractor: 'normalizadorHallazgosND' };
    out.push(h); seen.add(key);
  }

  return out;
}
