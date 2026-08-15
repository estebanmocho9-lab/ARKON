// ============================================================
// src/extraction-neurons/diccionarios/patronesAmpliados.ts
// Patrones para las 4 categorias nuevas de la taxonomia ampliada.
// Mismo enfoque de siempre: regex, nada de IA.
// ============================================================

export interface PatronAmpliado {
  categoria: string;
  regex: RegExp;
}

// -- Ingeniero / Arquitecto: especificaciones de diseno --
export const PATRONES_DISENO: PatronAmpliado[] = [
  { categoria: 'factor_seguridad', regex: /\bfactor\s+de\s+seguridad\s+de\s+[^.;\n]{2,60}/i },
  { categoria: 'tolerancia', regex: /\btolerancia\s+de\s+[^.;\n]{2,60}/i },
  { categoria: 'norma_diseno', regex: /\bseg[uú]n\s+la\s+norma\s+[^.;\n]{2,80}/i },
  { categoria: 'aplicacion_estructural', regex: /\bpara\s+uso\s+estructural\s+se\s+recomienda\s+[^.;\n]{2,100}/i },
  { categoria: 'aplicacion_estructural', regex: /\baplicable\s+en\s+(?:estructuras?|edificaci[oó]n|construcci[oó]n)[^.;\n]{2,100}/i },
];

// -- Quimico: reacciones y comportamiento quimico --
export const PATRONES_QUIMICA: PatronAmpliado[] = [
  { categoria: 'reaccion_con', regex: /\breacciona\s+con\s+[^.;\n]{2,100}/i },
  { categoria: 'condicion_ph', regex: /\ba\s+pH\s+(?:de\s+)?[\d.,]{1,5}[^.;\n]{0,80}/i },
  { categoria: 'catalisis', regex: /\bcataliza\s+[^.;\n]{2,100}/i },
  { categoria: 'subproducto', regex: /\bproduce\s+como\s+subproducto\s+[^.;\n]{2,100}/i },
  { categoria: 'toxicidad', regex: /\bes\s+t[oó]xic[oa]\s+si\s+[^.;\n]{2,100}/i },
  { categoria: 'toxicidad', regex: /\bpeligros[oa]\s+(?:si|cuando)\s+[^.;\n]{2,100}/i },
  { categoria: 'descomposicion', regex: /\bse\s+descompone\s+a\s+partir\s+de\s+[\d.,]{1,6}\s*°?\s?C[^.;\n]{0,60}/i },
];

// -- Cientifico: metodologia y hallazgos de estudios --
export const PATRONES_EXPERIMENTALES: PatronAmpliado[] = [
  { categoria: 'hallazgo_estudio', regex: /\bel\s+estudio\s+(?:realizado\s+por\s+[^.;\n]{2,60}\s+)?encontr[oó]\s+que\s+[^.;\n]{2,150}/i },
  { categoria: 'resultado', regex: /\blos\s+resultados\s+mostraron\s+[^.;\n]{2,150}/i },
  { categoria: 'condicion_experimental', regex: /\bbajo\s+condiciones\s+controladas\s+de\s+[^.;\n]{2,100}/i },
  { categoria: 'correlacion', regex: /\bse\s+observ[oó]\s+una\s+correlaci[oó]n\s+entre\s+[^.;\n]{2,150}/i },
  { categoria: 'confirmacion_ensayo', regex: /\blos\s+ensayos\s+confirmaron\s+[^.;\n]{2,150}/i },
];

// -- Analista de mercado: costo y disponibilidad --
export const PATRONES_MERCADO: PatronAmpliado[] = [
  { categoria: 'costo', regex: /\bel\s+costo\s+de\s+[^.;\n]{2,40}?\s+es\s+[^.;\n]{2,60}/i },
  { categoria: 'disponibilidad', regex: /\bdisponible\s+comercialmente\s+en\s+[^.;\n]{2,100}/i },
  { categoria: 'presentacion_comercial', regex: /\bse\s+comercializa\s+como\s+[^.;\n]{2,100}/i },
  { categoria: 'precio', regex: /\bel\s+precio\s+promedio\s+de\s+[^.;\n]{2,80}/i },
  { categoria: 'uso_industrial', regex: /\bampliamente\s+utilizad[oa]\s+en\s+la\s+industria\s+de\s+[^.;\n]{2,80}/i },
];
