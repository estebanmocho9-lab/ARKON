// ============================================================
// src/extraction-neurons/diccionarios/patronesDefinicionPropiedad.ts
// VERSION COMPLETA — cubre los 38 campos de fichas_propiedades,
// en español e ingles. Reemplaza la version anterior que solo
// cubria 16 campos.
// ============================================================

export interface PatronDefinicion {
  campo: string;
  regex: RegExp;
}

export const PATRONES_DEFINICION: PatronDefinicion[] = [

  // ============================================================
  // IDENTIDAD Y DEFINICION
  // ============================================================

  { campo: 'definicion', regex: /\bse\s+define\s+como\s+[^.;\n]{5,250}/i },
  { campo: 'definicion', regex: /\bes\s+una\s+propiedad\s+que\s+[^.;\n]{5,250}/i },
  { campo: 'definicion', regex: /\bes\s+una\s+medida\s+de\s+[^.;\n]{5,250}/i },
  { campo: 'definicion', regex: /\bis\s+defined\s+as\s+[^.;\n]{5,250}/i },
  { campo: 'definicion', regex: /\bis\s+a\s+(?:measure|property|characteristic)\s+of\s+[^.;\n]{5,250}/i },
  { campo: 'definicion', regex: /\brefers\s+to\s+[^.;\n]{5,250}/i },
  { campo: 'definicion', regex: /\banother\s+(?:elastic|mechanical|physical|thermal|chemical)\s+property\s+of\s+[^.;\n]{5,200}/i },

  { campo: 'formula', regex: /\bse\s+calcula\s+(?:como|mediante|con)\s+[^.;\n]{2,100}/i },
  { campo: 'formula', regex: /\bse\s+expresa\s+(?:como|mediante)\s+[^.;\n]{2,100}/i },
  { campo: 'formula', regex: /\bis\s+calculated\s+(?:as|by|using)\s+[^.;\n]{2,100}/i },
  { campo: 'formula', regex: /\bis\s+given\s+by\s*:?\s*[^.;\n]{2,100}/i },
  { campo: 'formula', regex: /\bis\s+expressed\s+as\s+[^.;\n]{2,100}/i },

  { campo: 'sinonimos_tecnicos', regex: /\btambi[eé]n\s+(?:llamad[oa]|conocid[oa])\s+como\s+[^.;\n]{3,120}/i },
  { campo: 'sinonimos_tecnicos', regex: /\balso\s+(?:called|known\s+as|termed|referred\s+to\s+as)\s+[^.;\n]{3,120}/i },

  { campo: 'sinonimos_informales_industria', regex: /\ben\s+la\s+industria\s+se\s+(?:le\s+dice|conoce\s+como|llama)\s+[^.;\n]{3,120}/i },
  { campo: 'sinonimos_informales_industria', regex: /\bin\s+(?:the\s+)?(?:field|industry|trade|practice)\s*,?\s*(?:it\s+is\s+)?(?:commonly|informally)\s+(?:called|known\s+as)\s+[^.;\n]{3,120}/i },

  // ============================================================
  // CLASIFICACION
  // ============================================================

  { campo: 'tipo_propiedad', regex: /\bes\s+una\s+propiedad\s+(mec[aá]nica|t[eé]rmica|el[eé]ctrica|qu[ií]mica|f[ií]sica|[oó]ptica|ac[uú]stica|magn[eé]tica)/i },
  { campo: 'tipo_propiedad', regex: /\bis\s+an?\s+(mechanical|thermal|electrical|chemical|physical|optical|acoustic|magnetic)\s+propert(?:y|ies)/i },

  { campo: 'es_primaria_o_derivada', regex: /\bse\s+(?:calcula|deriva)\s+a\s+partir\s+de\s+otras\s+propiedades[^.;\n]{0,150}/i },
  { campo: 'es_primaria_o_derivada', regex: /\bis\s+derived\s+from\s+(?:other\s+)?propert(?:y|ies)[^.;\n]{0,150}/i },
  { campo: 'es_primaria_o_derivada', regex: /\bis\s+(?:measured|obtained)\s+directly\s*[^.;\n]{0,100}/i },

  { campo: 'es_intensiva_o_extensiva', regex: /\bes\s+una\s+propiedad\s+intensiva[^.;\n]{0,100}/i },
  { campo: 'es_intensiva_o_extensiva', regex: /\bes\s+una\s+propiedad\s+extensiva[^.;\n]{0,100}/i },
  { campo: 'es_intensiva_o_extensiva', regex: /\bis\s+an?\s+intensive\s+property[^.;\n]{0,100}/i },
  { campo: 'es_intensiva_o_extensiva', regex: /\bis\s+an?\s+extensive\s+property[^.;\n]{0,100}/i },
  { campo: 'es_intensiva_o_extensiva', regex: /\bindependent\s+of\s+(?:the\s+)?(?:amount|quantity|mass)\s+of\s+material[^.;\n]{0,100}/i },

  { campo: 'es_sensorial_o_instrumental', regex: /\bse\s+puede\s+(?:ver|sentir|tocar|oler|percibir)\s+a\s+simple\s+vista[^.;\n]{0,100}/i },
  { campo: 'es_sensorial_o_instrumental', regex: /\bcan\s+be\s+(?:seen|felt|observed|perceived)\s+(?:by|with)\s+the\s+(?:naked\s+)?eye[^.;\n]{0,100}/i },
  { campo: 'es_sensorial_o_instrumental', regex: /\brequires\s+(?:specialized\s+)?(?:instrumentation|equipment)\s+to\s+detect[^.;\n]{0,100}/i },

  { campo: 'variantes_o_subtipos', regex: /\bexisten\s+(?:varios|distintos|diferentes)\s+tipos\s+de\s+[^.;\n]{5,200}/i },
  { campo: 'variantes_o_subtipos', regex: /\bseveral\s+types\s+of\s+[^.;\n]{5,200}/i },
  { campo: 'variantes_o_subtipos', regex: /\bincludes?\s+(?:the\s+following\s+)?(?:types|variants|categories)\s*:?\s*[^.;\n]{5,200}/i },

  { campo: 'diferenciacion_con_conceptos_similares', regex: /\ba\s+diferencia\s+de\s+[^.;\n]{5,200}/i },
  { campo: 'diferenciacion_con_conceptos_similares', regex: /\bno\s+debe\s+confundirse\s+con\s+[^.;\n]{5,200}/i },
  { campo: 'diferenciacion_con_conceptos_similares', regex: /\bse\s+diferencia\s+de\s+[^.;\n]{5,200}/i },
  { campo: 'diferenciacion_con_conceptos_similares', regex: /\bunlike\s+[^.;\n]{5,200}/i },
  { campo: 'diferenciacion_con_conceptos_similares', regex: /\bshould\s+not\s+be\s+confused\s+with\s+[^.;\n]{5,200}/i },
  { campo: 'diferenciacion_con_conceptos_similares', regex: /\bas\s+opposed\s+to\s+[^.;\n]{5,200}/i },

  // ============================================================
  // COMO SE MIDE
  // ============================================================

  { campo: 'metodos_de_medicion', regex: /\bse\s+mide\s+(?:mediante|con|utilizando|por medio de)\s+[^.;\n]{5,200}/i },
  { campo: 'metodos_de_medicion', regex: /\bse\s+determina\s+(?:mediante|con|utilizando)\s+[^.;\n]{5,200}/i },
  { campo: 'metodos_de_medicion', regex: /\bis\s+measured\s+(?:by|using|with|via)\s+[^.;\n]{5,200}/i },
  { campo: 'metodos_de_medicion', regex: /\bis\s+determined\s+(?:by|using|through)\s+[^.;\n]{5,200}/i },

  { campo: 'instrumentos_tipicos', regex: /\b(?:mediante|con)\s+un\s+(?:picn[oó]metro|dens[ií]metro|dur[oó]metro|visc[oó]simetro|espectr[oó]metro|microscopio|balanza)[^.;\n]{0,150}/i },
  { campo: 'instrumentos_tipicos', regex: /\b(?:using|with)\s+an?\s+(?:extensometer|dilatometer|viscometer|hardness tester|tensile testing machine|dynamometer|spectrometer|calorimeter)[^.;\n]{0,150}/i },

  { campo: 'normas_relacionadas', regex: /\bseg[uú]n\s+la\s+norma\s+(?:ASTM|ISO|EN|IRAM)\s*[\w-]+[^.;\n]{0,100}/i },
  { campo: 'normas_relacionadas', regex: /\b(?:ASTM|ISO|EN|IRAM)\s+[A-Z]?\d{2,5}(?:-\d+)?\b/g },
  { campo: 'normas_relacionadas', regex: /\baccording\s+to\s+(?:ASTM|ISO|EN)\s+[\w-]+/i },

  { campo: 'unidades_comunes', regex: /\bse\s+expresa\s+en\s+[^.;\n]{2,80}/i },
  { campo: 'unidades_comunes', regex: /\bsus\s+unidades\s+(?:son|habituales son)\s+[^.;\n]{2,80}/i },
  { campo: 'unidades_comunes', regex: /\bis\s+expressed\s+in\s+[^.;\n]{2,80}/i },
  { campo: 'unidades_comunes', regex: /\btypical\s+units\s+(?:are|include)\s+[^.;\n]{2,80}/i },

  { campo: 'errores_comunes_de_medicion', regex: /\berror(?:es)?\s+(?:comunes?|frecuentes?)\s+(?:al|en la)\s+medici[oó]n\s+[^.;\n]{5,200}/i },
  { campo: 'errores_comunes_de_medicion', regex: /\bcommon\s+(?:sources?\s+of\s+)?error[s]?\s+(?:in|when)\s+measur[^.;\n]{5,200}/i },
  { campo: 'errores_comunes_de_medicion', regex: /\bcare\s+must\s+be\s+taken\s+to\s+avoid\s+[^.;\n]{5,200}/i },

  { campo: 'dificultad_de_medicion', regex: /\b(?:es\s+)?dif[ií]cil\s+de\s+medir\s+[^.;\n]{0,150}/i },
  { campo: 'dificultad_de_medicion', regex: /\bis\s+difficult\s+to\s+measure\s+[^.;\n]{0,150}/i },
  { campo: 'dificultad_de_medicion', regex: /\bis\s+(?:easily|readily)\s+measured\s+[^.;\n]{0,150}/i },
  { campo: 'dificultad_de_medicion', regex: /\brequires?\s+specialized\s+(?:equipment|training|expertise)\s+[^.;\n]{0,150}/i },

  { campo: 'costo_relativo_del_ensayo_de_laboratorio', regex: /\bensayo\s+(?:costoso|caro|econ[oó]mico|barato)[^.;\n]{0,150}/i },
  { campo: 'costo_relativo_del_ensayo_de_laboratorio', regex: /\b(?:expensive|costly|inexpensive|low-cost)\s+(?:test|testing|method)\s+[^.;\n]{0,150}/i },

  { campo: 'precision_tipica', regex: /\bcon\s+una\s+precisi[oó]n\s+de\s+[^.;\n]{2,100}/i },
  { campo: 'precision_tipica', regex: /\bwith\s+an?\s+accuracy\s+of\s+[^.;\n]{2,100}/i },
  { campo: 'precision_tipica', regex: /\bprecision\s+of\s+(?:±|\+\/-)?\s*[^.;\n]{2,100}/i },
  { campo: 'precision_tipica', regex: /\breproducibility\s+(?:of|is)\s+[^.;\n]{2,100}/i },

  { campo: 'riesgos_de_seguridad_al_medir', regex: /\bprecauci[oó]n[^.;\n]{5,200}/i },
  { campo: 'riesgos_de_seguridad_al_medir', regex: /\bpeligro\s+de\s+[^.;\n]{5,200}/i },
  { campo: 'riesgos_de_seguridad_al_medir', regex: /\bcaution\s*:?\s*[^.;\n]{5,200}/i },
  { campo: 'riesgos_de_seguridad_al_medir', regex: /\bhazard\s+of\s+[^.;\n]{5,200}/i },

  { campo: 'factores_ambientales_que_afectan_la_medicion', regex: /\bla\s+(?:humedad|temperatura|altitud)\s+ambiente\s+(?:afecta|influye)[^.;\n]{0,150}/i },
  { campo: 'factores_ambientales_que_afectan_la_medicion', regex: /\bambient\s+(?:humidity|temperature|conditions)\s+(?:can\s+)?affect[s]?\s+[^.;\n]{0,150}/i },
  { campo: 'factores_ambientales_que_afectan_la_medicion', regex: /\btest\s+conditions\s+(?:such\s+as|including)\s+[^.;\n]{0,150}/i },

  // ============================================================
  // COMPORTAMIENTO Y FACTORES
  // ============================================================

  { campo: 'de_que_depende', regex: /\bdepende\s+(?:de|principalmente de)\s+[^.;\n]{5,250}/i },
  { campo: 'de_que_depende', regex: /\bse\s+ve\s+afectad[oa]\s+por\s+[^.;\n]{5,250}/i },
  { campo: 'de_que_depende', regex: /\bestá\s+influenciad[oa]\s+por\s+[^.;\n]{5,250}/i },
  { campo: 'de_que_depende', regex: /\bdepends\s+on\s+[^.;\n]{5,250}/i },
  { campo: 'de_que_depende', regex: /\bis\s+affected\s+by\s+[^.;\n]{5,250}/i },
  { campo: 'de_que_depende', regex: /\bis\s+influenced\s+by\s+[^.;\n]{5,250}/i },

  { campo: 'como_cambia_con_condiciones', regex: /\baumenta\s+(?:con|al)\s+[^.;\n]{5,200}/i },
  { campo: 'como_cambia_con_condiciones', regex: /\bdisminuye\s+(?:con|al)\s+[^.;\n]{5,200}/i },
  { campo: 'como_cambia_con_condiciones', regex: /\bincreases\s+with\s+[^.;\n]{5,200}/i },
  { campo: 'como_cambia_con_condiciones', regex: /\bdecreases\s+with\s+[^.;\n]{5,200}/i },

  // ============================================================
  // RELACION CON OTRAS PROPIEDADES
  // ============================================================

  { campo: 'compatibilidad_con_otras_propiedades', regex: /\bse\s+relaciona\s+(?:directamente\s+)?con\s+[^.;\n]{5,200}/i },
  { campo: 'compatibilidad_con_otras_propiedades', regex: /\bis\s+(?:directly\s+)?related\s+to\s+[^.;\n]{5,200}/i },

  { campo: 'incompatibilidad_con_otras_propiedades', regex: /\ben\s+conflicto\s+con\s+[^.;\n]{5,200}/i },
  { campo: 'incompatibilidad_con_otras_propiedades', regex: /\ben\s+detrimento\s+de\s+[^.;\n]{5,200}/i },
  { campo: 'incompatibilidad_con_otras_propiedades', regex: /\bin\s+conflict\s+with\s+[^.;\n]{5,200}/i },
  { campo: 'incompatibilidad_con_otras_propiedades', regex: /\btrade-?off\s+(?:between|with)\s+[^.;\n]{5,200}/i },

  // ============================================================
  // COMPORTAMIENTO EN MEZCLAS
  // ============================================================

  { campo: 'efecto_al_combinarse_con_otras', regex: /\bal\s+combinarse\s+con\s+[^.;\n]{5,200}/i },
  { campo: 'efecto_al_combinarse_con_otras', regex: /\ben\s+mezcla\s+con\s+[^.;\n]{5,200}/i },
  { campo: 'efecto_al_combinarse_con_otras', regex: /\bwhen\s+combined\s+with\s+[^.;\n]{5,200}/i },
  { campo: 'efecto_al_combinarse_con_otras', regex: /\bin\s+combination\s+with\s+[^.;\n]{5,200}/i },

  { campo: 'dominancia_en_mezcla', regex: /\bse\s+acerca\s+al\s+valor\s+d[e|le]\s+(?:componente\s+)?(?:m[aá]s\s+)?(?:fuerte|d[eé]bil)[^.;\n]{0,150}/i },
  { campo: 'dominancia_en_mezcla', regex: /\btends?\s+(?:to\s+)?(?:approach|follow)\s+the\s+(?:value\s+of\s+the\s+)?(?:weaker|stronger|dominant)\s+(?:component|constituent)[^.;\n]{0,150}/i },
  { campo: 'dominancia_en_mezcla', regex: /\bfollows?\s+(?:the\s+)?rule\s+of\s+mixtures[^.;\n]{0,150}/i },

  { campo: 'ejemplos_de_combinaciones_conocidas', regex: /\bpor\s+ejemplo,?\s+(?:al\s+)?combinar\s+[^.;\n]{5,200}/i },
  { campo: 'ejemplos_de_combinaciones_conocidas', regex: /\bfor\s+example,?\s+(?:when\s+)?combin(?:ing|ed)\s+[^.;\n]{5,200}/i },

  { campo: 'sinergias_conocidas', regex: /\befecto\s+sin[eé]rgico\s+[^.;\n]{5,200}/i },
  { campo: 'sinergias_conocidas', regex: /\bsynergistic\s+effect\s+[^.;\n]{5,200}/i },
  { campo: 'sinergias_conocidas', regex: /\back?\s+synergistically\s+[^.;\n]{5,200}/i },

  { campo: 'efectos_adversos_conocidos', regex: /\befecto\s+(?:adverso|negativo|perjudicial)\s+[^.;\n]{5,200}/i },
  { campo: 'efectos_adversos_conocidos', regex: /\b(?:adverse|detrimental|negative)\s+effect\s+(?:on|of)\s+[^.;\n]{5,200}/i },
  { campo: 'efectos_adversos_conocidos', regex: /\bnegatively\s+affects?\s+[^.;\n]{5,200}/i },

  // ============================================================
  // CONTEXTO DE VALORES
  // ============================================================

  { campo: 'rango_tipico_por_familia_material', regex: /\bt[ií]picamente\s+var[ií]a\s+(?:entre|desde)\s+[^.;\n]{5,200}/i },
  { campo: 'rango_tipico_por_familia_material', regex: /\btypically\s+ranges?\s+from\s+[^.;\n]{5,200}/i },
  { campo: 'rango_tipico_por_familia_material', regex: /\btypical\s+values?\s+for\s+[^.;\n]{5,200}/i },

  { campo: 'ejemplos_extremos_conocidos', regex: /\bel\s+(?:m[aá]s|menor)\s+(?:alto|bajo)\s+valor\s+conocido\s+[^.;\n]{5,200}/i },
  { campo: 'ejemplos_extremos_conocidos', regex: /\bthe\s+highest\s+known\s+[^.;\n]{5,200}/i },
  { campo: 'ejemplos_extremos_conocidos', regex: /\bthe\s+lowest\s+recorded\s+[^.;\n]{5,200}/i },

  // ============================================================
  // APLICACION PRACTICA
  // ============================================================

  { campo: 'que_mide', regex: /\bcuantifica\s+[^.;\n]{5,200}/i },
  { campo: 'que_mide', regex: /\bindica\s+[^.;\n]{5,200}/i },
  { campo: 'que_mide', regex: /\bquantifies\s+[^.;\n]{5,200}/i },
  { campo: 'que_mide', regex: /\bindicates\s+[^.;\n]{5,200}/i },

  { campo: 'para_que_sirve_saberlo', regex: /\bes\s+(?:importante|util|relevante)\s+para\s+[^.;\n]{5,200}/i },
  { campo: 'para_que_sirve_saberlo', regex: /\bpermite\s+(?:determinar|conocer|evaluar|predecir)\s+[^.;\n]{5,200}/i },
  { campo: 'para_que_sirve_saberlo', regex: /\bis\s+(?:important|useful|critical)\s+for\s+[^.;\n]{5,200}/i },
  { campo: 'para_que_sirve_saberlo', regex: /\ballows\s+(?:determination|prediction|evaluation)\s+of\s+[^.;\n]{5,200}/i },

  { campo: 'donde_se_usa_en_la_practica', regex: /\bse\s+utiliza\s+en\s+el\s+dise[nñ]o\s+de\s+[^.;\n]{5,200}/i },
  { campo: 'donde_se_usa_en_la_practica', regex: /\bused\s+in\s+the\s+design\s+of\s+[^.;\n]{5,200}/i },
  { campo: 'donde_se_usa_en_la_practica', regex: /\bpractical\s+applications?\s+(?:include|of)\s+[^.;\n]{5,200}/i },
  { campo: 'donde_se_usa_en_la_practica', regex: /\bis\s+applied\s+in\s+[^.;\n]{5,200}/i },

  { campo: 'aplicacion_por_industria', regex: /\ben\s+la\s+industria\s+de(?:l)?\s+[^.;\n]{5,200}/i },
  { campo: 'aplicacion_por_industria', regex: /\bin\s+the\s+(?:construction|automotive|aerospace|textile|food|agricultural)\s+industry\s+[^.;\n]{5,200}/i },
  { campo: 'aplicacion_por_industria', regex: /\bwidely\s+used\s+in\s+[^.;\n]{5,200}/i },
];
