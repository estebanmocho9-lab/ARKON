// ============================================================
// src/extraction-neurons/diccionarios/patronesDefinicion2.ts
// SEGUNDA TANDA — 20 campos nuevos para fichas_propiedades.
// Se suma a patronesDefinicionPropiedad.ts, no lo reemplaza.
// Mismo criterio: cada campo tiene su patron real en ES e EN,
// nada de columnas sin busqueda detras.
// ============================================================

import { PatronDefinicion } from './patronesDefinicionPropiedad';

export const PATRONES_DEFINICION_2: PatronDefinicion[] = [

  // -- historia_origen_descubrimiento --
  { campo: 'historia_origen_descubrimiento', regex: /\bfue\s+(?:definid[oa]|introducid[oa]|propuest[oa])\s+por\s+[^.;\n]{5,200}/i },
  { campo: 'historia_origen_descubrimiento', regex: /\bwas\s+(?:defined|introduced|proposed|first\s+described)\s+by\s+[^.;\n]{5,200}/i },
  { campo: 'historia_origen_descubrimiento', regex: /\bhistoricamente\s*,?\s+[^.;\n]{5,200}/i },
  { campo: 'historia_origen_descubrimiento', regex: /\bhistorically\s*,?\s+[^.;\n]{5,200}/i },

  // -- que_no_mide --
  { campo: 'que_no_mide', regex: /\bno\s+(?:debe|se)\s+confundirse\s+con\s+la\s+medici[oó]n\s+de\s+[^.;\n]{5,150}/i },
  { campo: 'que_no_mide', regex: /\bdoes\s+not\s+measure\s+[^.;\n]{5,150}/i },
  { campo: 'que_no_mide', regex: /\bshould\s+not\s+be\s+interpreted\s+as\s+[^.;\n]{5,150}/i },

  // -- materiales_donde_aparece --
  { campo: 'materiales_donde_aparece', regex: /\bes\s+(?:relevante|com[uú]n|caracter[ií]stica)\s+en\s+(?:metales|cer[aá]micos|pol[ií]meros|materiales)\s+[^.;\n]{5,150}/i },
  { campo: 'materiales_donde_aparece', regex: /\bis\s+(?:relevant|common|characteristic)\s+(?:for|in)\s+(?:metals|ceramics|polymers|materials)\s+[^.;\n]{5,150}/i },

  // -- materiales_donde_no_aplica --
  { campo: 'materiales_donde_no_aplica', regex: /\bno\s+(?:aplica|es\s+relevante)\s+(?:para|en)\s+[^.;\n]{5,150}/i },
  { campo: 'materiales_donde_no_aplica', regex: /\bdoes\s+not\s+apply\s+to\s+[^.;\n]{5,150}/i },
  { campo: 'materiales_donde_no_aplica', regex: /\bis\s+not\s+(?:applicable|relevant)\s+(?:to|for)\s+[^.;\n]{5,150}/i },

  // -- variables_de_la_formula --
  { campo: 'variables_de_la_formula', regex: /\bdonde\s+[A-Za-z]\s*=\s*[^.;\n]{5,150}/i },
  { campo: 'variables_de_la_formula', regex: /\bwhere\s+[A-Za-z]\s*(?:is|=|represents)\s*[^.;\n]{5,150}/i },
  { campo: 'variables_de_la_formula', regex: /\bwhere\s*:\s*[^.;\n]{5,200}/i },

  // -- tipo_de_relacion_con_otras_propiedades --
  { campo: 'tipo_de_relacion_con_otras_propiedades', regex: /\bes\s+(?:directa|inversa|proporcional)mente\s+proporcional\s+a\s+[^.;\n]{5,150}/i },
  { campo: 'tipo_de_relacion_con_otras_propiedades', regex: /\bis\s+(?:directly|inversely)\s+proportional\s+to\s+[^.;\n]{5,150}/i },
  { campo: 'tipo_de_relacion_con_otras_propiedades', regex: /\bvar[ií]a\s+(?:linealmente|de\s+forma\s+inversa)\s+con\s+[^.;\n]{5,150}/i },

  // -- consecuencias_si_aumenta --
  { campo: 'consecuencias_si_aumenta', regex: /\bsi\s+aumenta\s*,?\s+[^.;\n]{5,150}/i },
  { campo: 'consecuencias_si_aumenta', regex: /\bwhen\s+(?:this\s+)?(?:value\s+)?increases\s*,?\s+[^.;\n]{5,150}/i },
  { campo: 'consecuencias_si_aumenta', regex: /\ban\s+increase\s+in\s+[^.;\n]{2,40}?\s+(?:leads?\s+to|results?\s+in|causes?)\s+[^.;\n]{5,150}/i },

  // -- consecuencias_si_disminuye --
  { campo: 'consecuencias_si_disminuye', regex: /\bsi\s+disminuye\s*,?\s+[^.;\n]{5,150}/i },
  { campo: 'consecuencias_si_disminuye', regex: /\bwhen\s+(?:this\s+)?(?:value\s+)?decreases\s*,?\s+[^.;\n]{5,150}/i },
  { campo: 'consecuencias_si_disminuye', regex: /\ba\s+decrease\s+in\s+[^.;\n]{2,40}?\s+(?:leads?\s+to|results?\s+in|causes?)\s+[^.;\n]{5,150}/i },

  // -- ventajas_de_esta_propiedad --
  { campo: 'ventajas_de_esta_propiedad', regex: /\buna\s+ventaja\s+(?:de|es)\s+[^.;\n]{5,150}/i },
  { campo: 'ventajas_de_esta_propiedad', regex: /\ban?\s+advantage\s+(?:of|is)\s+[^.;\n]{5,150}/i },
  { campo: 'ventajas_de_esta_propiedad', regex: /\bbenefits?\s+(?:of|include)\s+[^.;\n]{5,150}/i },

  // -- limitaciones_o_problemas_conocidos --
  { campo: 'limitaciones_o_problemas_conocidos', regex: /\buna\s+limitaci[oó]n\s+(?:de|es)\s+[^.;\n]{5,150}/i },
  { campo: 'limitaciones_o_problemas_conocidos', regex: /\ban?\s+(?:limitation|drawback)\s+(?:of|is)\s+[^.;\n]{5,150}/i },
  { campo: 'limitaciones_o_problemas_conocidos', regex: /\bthe\s+main\s+problem\s+(?:with|is)\s+[^.;\n]{5,150}/i },

  // -- controversias_cientificas --
  { campo: 'controversias_cientificas', regex: /\bexiste\s+(?:cierta\s+)?controversia\s+(?:sobre|respecto\s+a)\s+[^.;\n]{5,200}/i },
  { campo: 'controversias_cientificas', regex: /\bis\s+(?:still\s+)?(?:debated|controversial|disputed)\s+[^.;\n]{5,200}/i },
  { campo: 'controversias_cientificas', regex: /\bno\s+(?:hay|existe)\s+consenso\s+(?:sobre|acerca\s+de)\s+[^.;\n]{5,200}/i },
  { campo: 'controversias_cientificas', regex: /\bthere\s+is\s+no\s+consensus\s+(?:on|about)\s+[^.;\n]{5,200}/i },

  // -- recomendaciones_de_uso --
  { campo: 'recomendaciones_de_uso', regex: /\bse\s+recomienda\s+[^.;\n]{5,200}/i },
  { campo: 'recomendaciones_de_uso', regex: /\bit\s+is\s+recommended\s+(?:to|that)\s+[^.;\n]{5,200}/i },

  // -- metodos_alternativos_de_medicion --
  { campo: 'metodos_alternativos_de_medicion', regex: /\bun\s+m[eé]todo\s+alternativo\s+[^.;\n]{5,150}/i },
  { campo: 'metodos_alternativos_de_medicion', regex: /\ban?\s+alternative\s+method\s+[^.;\n]{5,150}/i },
  { campo: 'metodos_alternativos_de_medicion', regex: /\bcan\s+also\s+be\s+measured\s+(?:by|using)\s+[^.;\n]{5,150}/i },

  // -- tecnologias_emergentes_relacionadas --
  { campo: 'tecnologias_emergentes_relacionadas', regex: /\bnuevas?\s+tecnolog[ií]as?\s+[^.;\n]{5,150}/i },
  { campo: 'tecnologias_emergentes_relacionadas', regex: /\bemerging\s+technolog(?:y|ies)\s+[^.;\n]{5,150}/i },
  { campo: 'tecnologias_emergentes_relacionadas', regex: /\brecent(?:ly)?\s+developed\s+[^.;\n]{5,150}/i },

  // -- por_que_es_importante --
  { campo: 'por_que_es_importante', regex: /\bes\s+cr[ií]tico\s+porque\s+[^.;\n]{5,150}/i },
  { campo: 'por_que_es_importante', regex: /\bis\s+critical\s+because\s+[^.;\n]{5,150}/i },
  { campo: 'por_que_es_importante', regex: /\bplays?\s+a\s+(?:key|critical|important)\s+role\s+in\s+[^.;\n]{5,150}/i },

  // -- significado_fisico --
  { campo: 'significado_fisico', regex: /\bf[ií]sicamente\s*,?\s+(?:representa|significa)\s+[^.;\n]{5,150}/i },
  { campo: 'significado_fisico', regex: /\bphysically\s*,?\s+(?:represents|means)\s+[^.;\n]{5,150}/i },
  { campo: 'significado_fisico', regex: /\bcan\s+be\s+(?:physically\s+)?interpreted\s+as\s+[^.;\n]{5,150}/i },

  // -- relacion_con_microestructura --
  { campo: 'relacion_con_microestructura', regex: /\ba\s+microestructura\s+(?:afecta|influye\s+en)\s+[^.;\n]{0,150}/i },
  { campo: 'relacion_con_microestructura', regex: /\bmicrostructure\s+(?:affects|influences)\s+[^.;\n]{0,150}/i },
  { campo: 'relacion_con_microestructura', regex: /\bgrain\s+size\s+(?:affects|influences|determines)\s+[^.;\n]{0,150}/i },

  // -- estado_del_material_que_afecta --
  { campo: 'estado_del_material_que_afecta', regex: /\ben\s+estado\s+(?:s[oó]lido|l[ií]quido|en\s+polvo)\s*,?\s+[^.;\n]{5,150}/i },
  { campo: 'estado_del_material_que_afecta', regex: /\bin\s+the\s+(?:solid|liquid|powder)\s+state\s*,?\s+[^.;\n]{5,150}/i },

  // -- casos_reales_documentados --
  { campo: 'casos_reales_documentados', regex: /\ben\s+un\s+caso\s+(?:real|documentado)\s+[^.;\n]{5,200}/i },
  { campo: 'casos_reales_documentados', regex: /\ba\s+documented\s+case\s+[^.;\n]{5,200}/i },
  { campo: 'casos_reales_documentados', regex: /\bin\s+a\s+field\s+(?:study|application)\s*,?\s+[^.;\n]{5,200}/i },

  // -- valores_teoricos_vs_experimentales --
  { campo: 'valores_teoricos_vs_experimentales', regex: /\bel\s+valor\s+te[oó]rico\s+[^.;\n]{5,150}/i },
  { campo: 'valores_teoricos_vs_experimentales', regex: /\bthe\s+theoretical\s+value\s+[^.;\n]{5,150}/i },
  { campo: 'valores_teoricos_vs_experimentales', regex: /\bcompared\s+to\s+(?:the\s+)?experimental\s+(?:value|data)\s+[^.;\n]{5,150}/i },
];
