// ============================================================
// src/extraction-neurons/diccionarios/patronesDefinicion4.ts
// CUARTA TANDA — no agrega campos nuevos, agrega MAS FORMAS DE
// DECIR LO MISMO para los campos que ya existen (definicion,
// que_mide, para_que_sirve_saberlo, formula, tipo_propiedad,
// materiales_donde_aparece, componentes_donde_aparece,
// compatibilidad/incompatibilidad, propiedad_inversa_o_negativa).
// Motivo: un libro real define/explica una propiedad de docenas
// de formas distintas; con pocas frases reconocidas se pierde la
// mayoria del contenido real aunque este bien escrito.
// Se suma a las 3 tandas anteriores, no reemplaza ninguna.
// ============================================================

import { PatronDefinicion } from './patronesDefinicionPropiedad';

export const PATRONES_DEFINICION_4: PatronDefinicion[] = [

  // -- definicion (mas variantes) --
  { campo: 'definicion', regex: /\btambi[eé]n\s+conocid[oa]\s+como\s+[^.;\n]{5,250}/i },
  { campo: 'definicion', regex: /\brepresenta\s+[^.;\n]{5,250}/i },
  { campo: 'definicion', regex: /\bse\s+refiere\s+a\s+[^.;\n]{5,250}/i },
  { campo: 'definicion', regex: /\bdenota\s+[^.;\n]{5,250}/i },
  { campo: 'definicion', regex: /\bes\s+un\s+par[aá]metro\s+que\s+[^.;\n]{5,250}/i },
  { campo: 'definicion', regex: /\bpuede\s+describirse\s+como\s+[^.;\n]{5,250}/i },
  { campo: 'definicion', regex: /\bconsiste\s+en\s+[^.;\n]{5,250}/i },
  { campo: 'definicion', regex: /\balso\s+known\s+as\s+[^.;\n]{5,250}/i },
  { campo: 'definicion', regex: /\brepresents\s+[^.;\n]{5,250}/i },
  { campo: 'definicion', regex: /\bdenotes\s+[^.;\n]{5,250}/i },
  { campo: 'definicion', regex: /\bis\s+a\s+parameter\s+that\s+[^.;\n]{5,250}/i },
  { campo: 'definicion', regex: /\bcan\s+be\s+described\s+as\s+[^.;\n]{5,250}/i },
  { campo: 'definicion', regex: /\bconsists\s+of\s+[^.;\n]{5,250}/i },
  { campo: 'definicion', regex: /\bis\s+understood\s+as\s+[^.;\n]{5,250}/i },

  // -- que_mide (mas variantes) --
  { campo: 'que_mide', regex: /\bmide\s+(?:la|el|los|las)\s+[^.;\n]{5,200}/i },
  { campo: 'que_mide', regex: /\bevalua\s+[^.;\n]{5,200}/i },
  { campo: 'que_mide', regex: /\bexpresa\s+el\s+grado\s+de\s+[^.;\n]{5,200}/i },
  { campo: 'que_mide', regex: /\bmeasures\s+(?:the\s+)?[^.;\n]{5,200}/i },
  { campo: 'que_mide', regex: /\bassesses\s+[^.;\n]{5,200}/i },
  { campo: 'que_mide', regex: /\bexpresses\s+the\s+degree\s+of\s+[^.;\n]{5,200}/i },

  // -- para_que_sirve_saberlo (mas variantes) --
  { campo: 'para_que_sirve_saberlo', regex: /\bsirve\s+para\s+[^.;\n]{5,200}/i },
  { campo: 'para_que_sirve_saberlo', regex: /\bse\s+utiliza\s+para\s+[^.;\n]{5,200}/i },
  { campo: 'para_que_sirve_saberlo', regex: /\btiene\s+aplicaci[oó]n\s+en\s+[^.;\n]{5,200}/i },
  { campo: 'para_que_sirve_saberlo', regex: /\bis\s+used\s+to\s+[^.;\n]{5,200}/i },
  { campo: 'para_que_sirve_saberlo', regex: /\bhelps\s+(?:to\s+)?(?:determine|predict|assess|evaluate)\s+[^.;\n]{5,200}/i },
  { campo: 'para_que_sirve_saberlo', regex: /\bfinds\s+application\s+in\s+[^.;\n]{5,200}/i },

  // -- formula (mas variantes) --
  { campo: 'formula', regex: /\bla\s+f[oó]rmula\s+(?:es|para\s+calcularla\s+es)\s*:?\s*[^.;\n]{2,150}/i },
  { campo: 'formula', regex: /\bmediante\s+la\s+ecuaci[oó]n\s+[^.;\n]{2,150}/i },
  { campo: 'formula', regex: /\bse\s+obtiene\s+(?:de|a\s+partir\s+de)\s+la\s+relaci[oó]n\s+[^.;\n]{2,150}/i },
  { campo: 'formula', regex: /\bthe\s+formula\s+is\s*:?\s*[^.;\n]{2,150}/i },
  { campo: 'formula', regex: /\baccording\s+to\s+(?:the\s+)?equation\s+[^.;\n]{2,150}/i },
  { campo: 'formula', regex: /\bcan\s+be\s+computed\s+(?:as|from|using)\s+[^.;\n]{2,150}/i },

  // -- tipo_propiedad (enum ampliado, no reemplaza el original) --
  { campo: 'tipo_propiedad', regex: /\bes\s+una\s+propiedad\s+(reol[oó]gica|electromagn[eé]tica|estructural|superficial|ambiental|geom[eé]trica)/i },
  { campo: 'tipo_propiedad', regex: /\bis\s+an?\s+(rheological|electromagnetic|structural|surface|environmental|geometric)\s+propert(?:y|ies)/i },

  // -- materiales_donde_aparece (mas variantes) --
  { campo: 'materiales_donde_aparece', regex: /\bse\s+encuentra\s+(?:t[ií]picamente\s+)?en\s+[^.;\n]{5,150}/i },
  { campo: 'materiales_donde_aparece', regex: /\bpresente\s+en\s+(?:la\s+mayor[ií]a\s+de\s+)?los?\s+[^.;\n]{5,150}/i },
  { campo: 'materiales_donde_aparece', regex: /\btypically\s+found\s+in\s+[^.;\n]{5,150}/i },
  { campo: 'materiales_donde_aparece', regex: /\bcommonly\s+present\s+in\s+[^.;\n]{5,150}/i },

  // -- componentes_donde_aparece (mas variantes) --
  { campo: 'componentes_donde_aparece', regex: /\ben\s+la\s+fase\s+[^.;\n]{5,150}/i },
  { campo: 'componentes_donde_aparece', regex: /\bin\s+the\s+phase\s+[^.;\n]{5,150}/i },

  // -- compatibilidad_con_otras_propiedades (mas variantes) --
  { campo: 'compatibilidad_con_otras_propiedades', regex: /\bcompatible\s+con\s+[^.;\n]{5,200}/i },
  { campo: 'compatibilidad_con_otras_propiedades', regex: /\bis\s+compatible\s+with\s+[^.;\n]{5,200}/i },
  { campo: 'compatibilidad_con_otras_propiedades', regex: /\bcorrelaciona\s+(?:positivamente\s+)?con\s+[^.;\n]{5,200}/i },
  { campo: 'compatibilidad_con_otras_propiedades', regex: /\bcorrelates\s+(?:positively\s+)?with\s+[^.;\n]{5,200}/i },

  // -- incompatibilidad_con_otras_propiedades (mas variantes) --
  { campo: 'incompatibilidad_con_otras_propiedades', regex: /\bincompatible\s+con\s+[^.;\n]{5,200}/i },
  { campo: 'incompatibilidad_con_otras_propiedades', regex: /\bis\s+incompatible\s+with\s+[^.;\n]{5,200}/i },
  { campo: 'incompatibilidad_con_otras_propiedades', regex: /\ba\s+expensas\s+de\s+[^.;\n]{5,200}/i },
  { campo: 'incompatibilidad_con_otras_propiedades', regex: /\bat\s+the\s+expense\s+of\s+[^.;\n]{5,200}/i },

  // -- propiedad_inversa_o_negativa (mas variantes) --
  { campo: 'propiedad_inversa_o_negativa', regex: /\bcontraparte\s+(?:opuesta|negativa)\s+(?:es|de)\s+[^.;\n]{5,150}/i },
  { campo: 'propiedad_inversa_o_negativa', regex: /\bcounterpart\s+(?:is|of)\s+[^.;\n]{5,150}/i },

];
