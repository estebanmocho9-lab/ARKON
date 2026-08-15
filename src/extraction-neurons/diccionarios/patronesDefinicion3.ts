// ============================================================
// src/extraction-neurons/diccionarios/patronesDefinicion3.ts
// TERCERA TANDA — 2 campos nuevos para fichas_propiedades.
// Se suma a patronesDefinicionPropiedad.ts y patronesDefinicion2.ts,
// no los reemplaza. Mismo criterio: cada campo tiene su patron
// real en ES e EN, nada de columnas sin busqueda detras.
// ============================================================

import { PatronDefinicion } from './patronesDefinicionPropiedad';

export const PATRONES_DEFINICION_3: PatronDefinicion[] = [

  // -- componentes_donde_aparece --
  // (distinto de materiales_donde_aparece: un componente es una
  // parte/pieza/fase dentro de un material, no el material entero)
  { campo: 'componentes_donde_aparece', regex: /\bes\s+(?:relevante|com[uú]n|caracter[ií]stica)\s+en\s+(?:el\s+)?componente\s+[^.;\n]{5,150}/i },
  { campo: 'componentes_donde_aparece', regex: /\bforma\s+parte\s+del\s+componente\s+[^.;\n]{5,150}/i },
  { campo: 'componentes_donde_aparece', regex: /\bpresente\s+en\s+(?:el\s+)?componente\s+[^.;\n]{5,150}/i },
  { campo: 'componentes_donde_aparece', regex: /\bis\s+(?:relevant|common|characteristic)\s+(?:for|in)\s+(?:the\s+)?component\s+[^.;\n]{5,150}/i },
  { campo: 'componentes_donde_aparece', regex: /\bis\s+(?:a\s+)?component\s+of\s+[^.;\n]{5,150}/i },
  { campo: 'componentes_donde_aparece', regex: /\bpresent\s+in\s+(?:the\s+)?component\s+[^.;\n]{5,150}/i },

  // -- propiedad_inversa_o_negativa --
  // (contraparte opuesta/negativa explicita, ej: densidad <-> porosidad,
  // humedad <-> sequedad — distinto de tipo_de_relacion_con_otras_propiedades,
  // que solo capta "proporcional a" sin identificar cual es la opuesta)
  { campo: 'propiedad_inversa_o_negativa', regex: /\bes\s+lo\s+opuesto\s+(?:de|a)\s+[^.;\n]{5,150}/i },
  { campo: 'propiedad_inversa_o_negativa', regex: /\bes\s+la\s+inversa\s+de\s+[^.;\n]{5,150}/i },
  { campo: 'propiedad_inversa_o_negativa', regex: /\bsu\s+negativ[ao]\s+es\s+[^.;\n]{5,150}/i },
  { campo: 'propiedad_inversa_o_negativa', regex: /\bpropiedad\s+inversa\s*(?:es|:)\s*[^.;\n]{5,150}/i },
  { campo: 'propiedad_inversa_o_negativa', regex: /\bis\s+the\s+(?:inverse|opposite)\s+of\s+[^.;\n]{5,150}/i },
  { campo: 'propiedad_inversa_o_negativa', regex: /\binverse\s+property\s+(?:is|of)\s*[^.;\n]{5,150}/i },
  { campo: 'propiedad_inversa_o_negativa', regex: /\bnegative\s+counterpart\s+(?:is|of)\s*[^.;\n]{5,150}/i },

];
