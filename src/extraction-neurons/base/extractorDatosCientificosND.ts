// ============================================================
// Datos cuantitativos y fórmulas ND.
//
// IMPORTANTE: este módulo NO vuelve a extraer MATERIAL,
// PROPIEDAD, MÉTODO, INSTRUMENTO ni CONDICIÓN: esas categorías
// ya las cubren extractorNDUniversal + extractorSemanticoND +
// extractorMetadatosCientificosND. Acá solo se agregan datos que
// no estaban cubiertos por esos extractores: magnitudes crudas,
// rangos, porcentajes textuales y fórmulas.
// ============================================================

import { HallazgoND } from '../memoria-nd/tipos';

type Tipo = HallazgoND['tipo'];

const UNIDADES = String.raw`(?:%|ppm|ppb|°C|ºC|K|MPa|GPa|kPa|Pa|N|kN|kg|g|mg|µg|um|μm|mm|cm|m|m²|m2|m3|m³|kg/m3|kg/m³|g/cm3|g/cm³|W/mK|W/m·K|W/(m·K)|J/g|J/kg|kJ/kg|MJ/kg|Hz|s|min|h|d|mol|mol/L|M|V|A|Ω|Ohm|mS/cm|S/m)`;
const NUM = String.raw`[-+]?\d+(?:[.,]\d+)?(?:\s*[×x*]\s*10\s*[-+]?\d+)?`;
const FORMULA = /(?:\b(?:[A-Z][a-z]?\d*(?:[\s·*()+\-/^]|\d|[A-Z][a-z]?)*)(?:=|≈|~|≤|≥)[^.;\n]{1,260})/g;

function normalizar(s: string): string { return s.replace(/\s+/g, ' ').trim(); }
function idioma(texto: string): 'es' | 'en' | 'mixto' {
  const t = texto.toLowerCase();
  const es = (t.match(/\b(?:el|la|los|las|de|del|que|una|un|para|con|se|muestra|ensayo|resultado|cuando|entre)\b/g) || []).length;
  const en = (t.match(/\b(?:the|of|and|is|are|a|an|for|with|by|sample|test|result|when|between)\b/g) || []).length;
  return es && en ? 'mixto' : en > es ? 'en' : 'es';
}
function contexto(texto: string, inicio: number, fin: number): string {
  return normalizar(texto.slice(Math.max(0, inicio - 320), Math.min(texto.length, fin + 700)));
}

function agregar(out: HallazgoND[], args: {
  texto: string; tipo: Tipo; campo: string; pagina: number; documento: string;
  neuronId: string; inicio: number; fin: number; contexto: string; confianza?: number;
  valor?: number; valorTexto?: string; unidad?: string; simbolo?: string;
}) {
  const ctx = args.contexto;
  const lang = idioma(ctx);
  out.push({
    neuronId: args.neuronId,
    tipo: args.tipo,
    campo: args.campo,
    textoOriginal: normalizar(args.texto),
    textoNormalizado: normalizar(args.texto).toLowerCase(),
    valor: args.valor,
    valorTexto: args.valorTexto,
    unidad: args.unidad,
    simbolo: args.simbolo,
    contexto: ctx,
    idioma: lang,
    confianza: args.confianza ?? 0.8,
    evidencia: {
      documento: args.documento,
      pagina: args.pagina,
      fragmento: ctx,
      idioma: lang,
      tipoDocumento: 'desconocido',
      posicionInicio: args.inicio,
      posicionFin: args.fin,
    },
    metadatos: { extractor: 'extractorDatosCientificosND', alcance: 'cuantitativo_crudo' },
  });
}

export function extraerDatosCientificosND(
  texto: string,
  pagina: number,
  documento: string,
  neuronId: string,
): HallazgoND[] {
  const out: HallazgoND[] = [];

  // 1) Magnitud simple: conserva número + unidad exactamente como aparecen.
  const medicion = new RegExp(`(${NUM})\\s*(${UNIDADES})(?![A-Za-z])`, 'giu');
  let m: RegExpExecArray | null;
  while ((m = medicion.exec(texto))) {
    const valorTexto = m[1];
    const valor = Number(valorTexto.replace(',', '.'));
    const unidad = normalizar(m[2]);
    agregar(out, {
      texto: m[0], tipo: 'MAGNITUD', campo: 'medicion_cuantitativa_cruda', pagina, documento, neuronId,
      inicio: m.index, fin: m.index + m[0].length, contexto: contexto(texto, m.index, m.index + m[0].length),
      confianza: 0.86, valor: Number.isFinite(valor) ? valor : undefined, valorTexto, unidad,
    });
  }

  // 2) Rango cuantitativo: 10–20 MPa, 10 a 20 %, etc.
  const rango = new RegExp(`(${NUM})\\s*(?:-|–|—|a|to)\\s*(${NUM})\\s*(${UNIDADES})`, 'giu');
  while ((m = rango.exec(texto))) {
    const ctx = contexto(texto, m.index, m.index + m[0].length);
    agregar(out, {
      texto: m[0], tipo: 'MAGNITUD', campo: 'rango_cuantitativo_crudo', pagina, documento, neuronId,
      inicio: m.index, fin: m.index + m[0].length, contexto: ctx, confianza: 0.88,
      valorTexto: `${m[1]}-${m[2]}`, unidad: normalizar(m[3]),
    });
  }

  // 3) Porcentaje escrito: "12 percent" / "12 por ciento".
  const porcentaje = new RegExp(`(${NUM})\\s*(?:por\\s*ciento|percent|percentage)`, 'giu');
  while ((m = porcentaje.exec(texto))) {
    const ctx = contexto(texto, m.index, m.index + m[0].length);
    agregar(out, {
      texto: m[0], tipo: 'MAGNITUD', campo: 'porcentaje_crudo', pagina, documento, neuronId,
      inicio: m.index, fin: m.index + m[0].length, contexto: ctx, confianza: 0.84,
      valor: Number(m[1].replace(',', '.')), valorTexto: m[1], unidad: '%',
    });
  }

  // 4) Fórmulas/ecuaciones: no se evalúan ni se convierten.
  FORMULA.lastIndex = 0;
  while ((m = FORMULA.exec(texto))) {
    const original = normalizar(m[0]);
    if (original.length < 4) continue;
    const ctx = contexto(texto, m.index, m.index + m[0].length);
    agregar(out, {
      texto: original, tipo: 'FORMULA', campo: 'formula_cruda', pagina, documento, neuronId,
      inicio: m.index, fin: m.index + m[0].length, contexto: ctx, confianza: 0.65,
    });
  }

  return out;
}
