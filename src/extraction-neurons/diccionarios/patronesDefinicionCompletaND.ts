// ============================================================
// Cobertura complementaria de la ficha cientifica de propiedad.
// Se agrega a los 38 campos existentes para cubrir explicitamente
// el modelo de conocimiento de los Niveles 2-3 definidos para ARKON.
// ES/EN. Solo extrae evidencia; no razona ni consolida.
// ============================================================

import { PatronDefinicion } from './patronesDefinicionPropiedad';

export const PATRONES_DEFINICION_COMPLETA_ND: PatronDefinicion[] = [
  // Identidad / semantica
  { campo: 'que_mide', regex: /\b(?:mide|mide la|representa|indica|cuantifica)\s+[^.;\n]{5,260}/i },
  { campo: 'que_mide', regex: /\b(?:measures?|represents?|indicates?|quantifies?)\s+[^.;\n]{5,260}/i },
  { campo: 'que_no_mide', regex: /\b(?:no mide|no representa|no debe interpretarse como|no indica)\s+[^.;\n]{5,240}/i },
  { campo: 'que_no_mide', regex: /\b(?:does not measure|does not represent|should not be interpreted as|does not indicate)\s+[^.;\n]{5,240}/i },
  { campo: 'familia_subfamilia', regex: /\b(?:pertenece a|clasificada como|se clasifica como|familia|subfamilia)\s+[^.;\n]{3,180}/i },
  { campo: 'familia_subfamilia', regex: /\b(?:belongs to|classified as|family|subfamily|class)\s+[^.;\n]{3,180}/i },

  // Unidades / rango / estados
  { campo: 'unidad_referencia_y_conversiones', regex: /\b(?:unidad(?:es)? de referencia|unidad SI|se expresa en|convertir|conversi[oó]n)\b[^.;\n]{3,220}/i },
  { campo: 'unidad_referencia_y_conversiones', regex: /\b(?:reference unit|SI unit|expressed in|conversion|convert(?:ed|ing))\b[^.;\n]{3,220}/i },
  { campo: 'rango_fisico_valido', regex: /\b(?:rango f[ií]sico|rango v[aá]lido|valores f[ií]sicamente posibles|l[ií]mites f[ií]sicos)\b[^.;\n]{3,240}/i },
  { campo: 'rango_fisico_valido', regex: /\b(?:physical range|valid range|physically possible values|physical limits)\b[^.;\n]{3,240}/i },
  { campo: 'estados_validos_de_medicion', regex: /\b(?:en estado|estado seco|estado h[uú]medo|fraguado|curado|saturado|condici[oó]n de medici[oó]n)\b[^.;\n]{3,240}/i },
  { campo: 'estados_validos_de_medicion', regex: /\b(?:in the|under)\s+(?:dry|wet|cured|hardened|saturated|measurement)\s+(?:state|condition)\b[^.;\n]{3,240}/i },

  // Dependencias / comportamiento
  { campo: 'de_que_depende', regex: /\b(?:depende de|depende principalmente de|est[aá] influida por|est[aá] afectada por)\s+[^.;\n]{5,280}/i },
  { campo: 'de_que_depende', regex: /\b(?:depends on|depends primarily on|is influenced by|is affected by)\s+[^.;\n]{5,280}/i },
  { campo: 'consecuencia_si_aumenta', regex: /\b(?:si aumenta|cuando aumenta|al aumentar|un aumento de)\s+[^.;\n]{5,300}/i },
  { campo: 'consecuencia_si_aumenta', regex: /\b(?:if .* increases?|when .* increases?|an increase in)\s+[^.;\n]{5,300}/i },
  { campo: 'consecuencia_si_disminuye', regex: /\b(?:si disminuye|cuando disminuye|al disminuir|una disminuci[oó]n de)\s+[^.;\n]{5,300}/i },
  { campo: 'consecuencia_si_disminuye', regex: /\b(?:if .* decreases?|when .* decreases?|a decrease in)\s+[^.;\n]{5,300}/i },
  { campo: 'compatibilidad_incompatibilidad', regex: /\b(?:compatible|incompatible|compatibilidad|incompatibilidad|compatible con|incompatible con)\b[^.;\n]{3,260}/i },
  { campo: 'compatibilidad_incompatibilidad', regex: /\b(?:compatible|incompatible|compatibility|incompatibility)\s+with\b[^.;\n]{3,260}/i },
  { campo: 'tipo_de_relacion', regex: /\b(?:relaci[oó]n directa|relaci[oó]n inversa|correlaci[oó]n|dependencia|proporcionalidad)\b[^.;\n]{3,240}/i },
  { campo: 'tipo_de_relacion', regex: /\b(?:direct relationship|inverse relationship|correlation|dependence|proportionality)\b[^.;\n]{3,240}/i },

  // Alcance: materiales y componentes
  { campo: 'materiales_donde_aplica', regex: /\b(?:aplica a|se aplica a|presente en|se encuentra en|com[uú]n en)\s+[^.;\n]{3,260}/i },
  { campo: 'materiales_donde_aplica', regex: /\b(?:applies to|applicable to|present in|found in|common in)\s+[^.;\n]{3,260}/i },
  { campo: 'materiales_donde_no_aplica', regex: /\b(?:no aplica a|no es aplicable a|ausente en|no se encuentra en)\s+[^.;\n]{3,260}/i },
  { campo: 'materiales_donde_no_aplica', regex: /\b(?:does not apply to|not applicable to|absent from|not found in)\s+[^.;\n]{3,260}/i },
  { campo: 'componentes_relacionados', regex: /\b(?:componente(?:s)? relacionado(?:s)?|presente en el componente|componente que aporta)\b[^.;\n]{3,260}/i },
  { campo: 'componentes_relacionados', regex: /\b(?:related component|component associated|component contributing to)\b[^.;\n]{3,260}/i },

  // Ensayo / incertidumbre / trazabilidad del dato
  { campo: 'incertidumbre_y_propagacion', regex: /\b(?:incertidumbre|incertidumbre combinada|propagaci[oó]n de incertidumbre|error relativo|error absoluto)\b[^.;\n]{3,280}/i },
  { campo: 'incertidumbre_y_propagacion', regex: /\b(?:uncertainty|combined uncertainty|uncertainty propagation|relative error|absolute error)\b[^.;\n]{3,280}/i },
  { campo: 'origen_medido_calculado_documental', regex: /\b(?:medido|medida|calculado|c[aá]lculo|reportado|documental|estimado|experimental|te[oó]rico)\b[^.;\n]{3,220}/i },
  { campo: 'origen_medido_calculado_documental', regex: /\b(?:measured|measurement|calculated|calculation|reported|documentary|estimated|experimental|theoretical)\b[^.;\n]{3,220}/i },
  { campo: 'condiciones_ambientales', regex: /\b(?:temperatura|humedad|presi[oó]n|atm[oó]sfera|ambiente|exposici[oó]n|radiaci[oó]n|salinidad)\b[^.;\n]{3,240}/i },
  { campo: 'condiciones_ambientales', regex: /\b(?:temperature|humidity|pressure|atmosphere|ambient|exposure|radiation|salinity)\b[^.;\n]{3,240}/i },

  // Uso / limitaciones / microestructura / evidencia
  { campo: 'para_que_sirve', regex: /\b(?:sirve para|permite|se utiliza para|es importante para|utilidad)\s+[^.;\n]{3,280}/i },
  { campo: 'para_que_sirve', regex: /\b(?:is used to|allows|is useful for|important for|utility)\s+[^.;\n]{3,280}/i },
  { campo: 'significado_fisico', regex: /\b(?:significado f[ií]sico|interpretaci[oó]n f[ií]sica|f[ií]sicamente significa)\b[^.;\n]{3,280}/i },
  { campo: 'significado_fisico', regex: /\b(?:physical meaning|physical interpretation|physically means)\b[^.;\n]{3,280}/i },
  { campo: 'relacion_microestructura', regex: /\b(?:microestructura|tama[nñ]o de grano|fase|poros|estructura interna|defectos)\b[^.;\n]{3,300}/i },
  { campo: 'relacion_microestructura', regex: /\b(?:microstructure|grain size|phase|pores|internal structure|defects)\b[^.;\n]{3,300}/i },
  { campo: 'casos_reales_documentados', regex: /\b(?:caso real|casos reales|estudio de caso|aplicaci[oó]n industrial|caso documentado)\b[^.;\n]{3,300}/i },
  { campo: 'casos_reales_documentados', regex: /\b(?:real case|case study|industrial application|documented case)\b[^.;\n]{3,300}/i },
  { campo: 'valores_teoricos_vs_experimentales', regex: /\b(?:valor te[oó]rico|valor experimental|resultados te[oó]ricos|resultados experimentales|diferencia entre teor[ií]a y experimento)\b[^.;\n]{3,300}/i },
  { campo: 'valores_teoricos_vs_experimentales', regex: /\b(?:theoretical value|experimental value|theoretical results|experimental results|difference between theory and experiment)\b[^.;\n]{3,300}/i },
  { campo: 'tecnologias_emergentes', regex: /\b(?:tecnolog[ií]a emergente|nueva tecnolog[ií]a|advanced technique|emerging technology|state[- ]of[- ]the[- ]art)\b[^.;\n]{3,300}/i },
  { campo: 'tecnologias_emergentes', regex: /\b(?:emerging technology|new technology|advanced technique|state[- ]of[- ]the[- ]art)\b[^.;\n]{3,300}/i },
  { campo: 'historia_origen', regex: /\b(?:historia|origen|desarrollo hist[oó]rico|acu[nñ]ado|introducido)\b[^.;\n]{3,260}/i },
  { campo: 'historia_origen', regex: /\b(?:history|origin|historical development|coined|introduced)\b[^.;\n]{3,260}/i },
];
