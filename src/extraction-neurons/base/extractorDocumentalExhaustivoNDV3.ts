import { PROPIEDADES } from '../diccionarios/propiedades';
import { ATRIBUTOS } from '../diccionarios/atributos';
import { HallazgoND } from '../memoria-nd/tipos';

type Tipo = HallazgoND['tipo'];
type Block = { text: string; start: number; end: number };
type Entity = { type: Tipo; name: string; pos: number; meta?: Record<string, unknown> };

const norm = (s: string) => s.replace(/\s+/g, ' ').trim();
const canon = (s: string) => norm(s).replace(/^["'“”‘’]+|["'“”‘’]+$/g, '');
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const INVALIDA = /^entidad\s+no\s+determinada$/i;
const UNITS = String.raw`(?:%|ppm|ppb|°C|ºC|K|MPa|GPa|kPa|Pa|N|kN|kg|g|mg|µg|um|μm|mm|cm|m|m²|m2|m3|m³|kg/m3|kg/m³|g/cm3|g/cm³|W/mK|W/m·K|W/(m·K)|J/g|J/kg|kJ/kg|MJ/kg|Hz|s|min|h|d|mol|mol/L|M|V|A|Ω|Ohm|mS/cm|S/m)`;
const NUM = String.raw`[-+]?\d+(?:[.,]\d+)?(?:\s*[×x*]\s*10\s*[-+]?\d+)?`;

const MATERIAL_TERMS = [
  'cemento Portland','pasta de cemento','cemento','yeso','gypsum','hormigón','hormigon','concreto','concrete',
  'mortero','mortar','arena','sand','arcilla','clay','vidrio','glass','fibra de vidrio','glass fiber',
  'acero','steel','aluminio','aluminum','cobre','copper','hierro','iron','madera','wood','plástico','plastico','plastic',
  'resina','resin','polímero','polimero','polymer','epoxi','epoxy','cerámica','ceramica','ceramic','ladrillo','brick',
  'árido','arido','agregado','aggregate','composite','compuesto','óxido de aluminio','oxido de aluminio',
  'óxido de calcio','oxido de calcio','óxido de hierro','oxido de hierro','óxido de silicio','oxido de silicio',
  'óxido de sodio','oxido de sodio','óxido de magnesio','oxido de magnesio','alúmina','alumina','sílice','silica'
];
const MATERIAL_SET = new Set(MATERIAL_TERMS.map(x => x.toLowerCase()));
const MAGNITUDE_TERMS = [
  'temperatura','temperature','presión','presion','pressure','humedad','humidity','concentración','concentracion','concentration',
  'tiempo','time','edad','age','masa','mass','volumen','volume','longitud','length','altura','height','espesor','thickness',
  'diámetro','diametro','diameter','área','area','area superficial','superficie específica','superficie especifica',
  'densidad','density','porcentaje','percentage','proporción','proporcion','proportion','velocidad','velocity','speed',
  'frecuencia','frequency','energía','energia','energy','potencia','power','caudal','flow rate','tensión','tension',
  'stress','deformación','deformacion','strain','fuerza','force','resistencia','strength','módulo','modulo','modulus'
];

const NORMA = /\b(?:ASTM|ISO|IRAM|EN|UNE|AASHTO|DIN|BS|JIS|IEC|NF|CSA|GB|ABNT)\s*[- ]?\s*[A-Z]?\s*\d{2,6}(?:[-:]\d{2,4})?(?:\s*[-:]?\s*[A-Z]\d{0,3})?\b/giu;
const COMPONENTE = /\b(?:componente|component|constituyente|constituent|fase|phase|aditivo|additive|matriz|matrix|ligante|binder|relleno|filler)\s*(?::|=|denominado\s+|llamado\s+|called\s+|named\s+)?\s*([^,.;:\n]{2,90})/giu;
const METODO = /\b(?:método|metodo|method|procedimiento|procedure|ensayo|test|técnica|tecnica|technique|protocolo|protocol)\s+(?:de\s+|del\s+|para\s+|the\s+|of\s+|for\s+)?([^,.;:\n]{2,100})/giu;
const INSTRUMENTO = /\b(?:instrumento|instrument|equipo|equipment|aparato|apparatus|dispositivo|device|sensor|sonda|probe|microscopio|microscope|espectrómetro|espectrometro|spectrometer|balanza|balance|termómetro|termometro|thermometer|prensa|press|extensómetro|extensometro|extensometer)\s+(?:de\s+|para\s+|the\s+|for\s+)?([^,.;:\n]{2,100})/giu;

const ASPECTS: Array<[string, Tipo, RegExp]> = [
  ['definicion','DEFINICION',/\b(?:se define como|se define|definid[oa] como|definition|defined as|is defined as|refers to|se refiere a|means|significa)\b/iu],
  ['que_es','DEFINICION',/\b(?:es un|es una|es el|es la|is a|is an|is the|consiste en|consists of|denota|denotes)\b/iu],
  ['identidad','DEFINICION',/\b(?:también conocido como|tambien conocido como|also known as|known as|denominado|llamado|abbreviated|abreviado|símbolo|simbolo|symbol|synonym|sinónimo)\b/iu],
  ['significado','DEFINICION',/\b(?:significa|significado|meaning|means|representa|represents?|interpreta|interpreted)\b/iu],
  ['fundamento','DEFINICION',/\b(?:fundamento|principio|principle|basis|mechanism|mecanismo|theory|teoría|teoria|based on|basado en)\b/iu],
  ['que_mide','PROPIEDAD',/\b(?:mide|medir|medición|medicion|measurement|measures?|quantifies?|cuantifica|determina|determines?|indica|indicates)\b/iu],
  ['que_no_mide','PROPIEDAD',/\b(?:no mide|no cuantifica|no representa|does not measure|does not quantify|not a measure of|no debe confundirse|should not be confused)\b/iu],
  ['composicion','EVIDENCIA',/\b(?:composición|composicion|composition|composed of|consists of|contains|contiene|constituido por|formed by|formado por|made of|porcentaje|percentage|proporción|proporcion|proportion|ratio)\b/iu],
  ['estructura','EVIDENCIA',/\b(?:estructura|structure|microestructura|microstructure|crystal|cristal|grain|grano|pore structure|estructura de poros)\b/iu],
  ['preparacion','METODO',/\b(?:preparación|preparacion|preparation|prepared|preparado|prepare|preparar|mezcla|mixing|mixed|mezclado)\b/iu],
  ['fabricacion_procesamiento','METODO',/\b(?:fabricación|fabricacion|manufacture|manufacturing|production|producción|produccion|processing|procesamiento|curado|curing|sintering|sinterización|sinterizacion|molienda|grinding)\b/iu],
  ['reaccion_interaccion','RELACION',/\b(?:reaction|reacción|reaccion|reacts with|reacciona con|interaction|interacción|interaccion|compatible|compatibility|compatibilidad|incompatible|incompatibilidad)\b/iu],
  ['estabilidad_durabilidad','COMPORTAMIENTO',/\b(?:stability|estabilidad|durability|durabilidad|degradation|degradación|degradacion|aging|envejecimiento|corrosion|corrosión)\b/iu],
  ['subpropiedad','PROPIEDAD',/\b(?:subpropiedad|sub-property|subproperties|parámetros|parametros|parameters?|variables internas|internal variables|tipos de|types of|classified as|clasificada como)\b/iu],
  ['valor_y_unidad','MAGNITUD',new RegExp(`(?:\\b(?:valor|value|measured at|medido a|measured value|reported value|rango|range|between|entre|maximum|minimum|typical|típico|tipico|average|promedio)\\b|${NUM}\\s*${UNITS})`,'iu')],
  ['incertidumbre_error_precision','MAGNITUD',/\b(?:uncertainty|incertidumbre|error|errors?|precision|precisión|accuracy|exactitud|repeatability|repetibilidad|reproducibility|reproducibilidad)\b/iu],
  ['formula','FORMULA',/\b(?:formula|fórmula|equation|ecuación|ecuacion|calculated from|calculado a partir de)\b/iu],
  ['determinacion','METODO',/\b(?:se determina|determinación|determinacion|determination|determined by|determined using|se mide|measured by|measured using|method|método|metodo|procedure|procedimiento|test|ensayo|technique|técnica|tecnica)\b/iu],
  ['procedimiento','METODO',/\b(?:procedure|procedimiento|steps?|pasos|first|then|finally|primero|después|despues|finalmente)\b/iu],
  ['instrumento','INSTRUMENTO',/\b(?:instrument|instrumento|equipment|equipo|apparatus|aparato|device|dispositivo|sensor|sonda|probe|microscope|microscopio|spectrometer|espectrómetro|espectrometro|balanza|balance|termómetro|termometro|thermometer|prensa|press|extensometer|extensómetro|extensometro)\b/iu],
  ['calibracion','INSTRUMENTO',/\b(?:calibrat|calibración|calibracion|calibrated|calibrado|reference material|material de referencia|standardization|estandarización|estandarizacion)\b/iu],
  ['condicion','CONDICION',/\b(?:temperature|temperatura|pressure|presión|presion|humidity|humedad|time|tiempo|age|edad|concentration|concentración|concentracion|pH|atmosphere|atmósfera|atmosfera|vacuum|vacío|vacio|dry|seco|wet|húmedo|humedo|saturated|saturado|curing|curado|setting|fraguado|initial conditions|condiciones iniciales|operating conditions|condiciones operativas)\b/iu],
  ['dependencia','RELACION',/\b(?:depends on|depende de|dependent on|dependiente de|influenced by|influido por|affected by|afectado por|as a function of|en función de|en funcion de)\b/iu],
  ['relacion','RELACION',/\b(?:related to|relacionado con|correlates with|correlaciona con|associated with|asociado con|proportional to|proporcional a|inversely|inversamente|directly|directamente|linked to|vinculado con)\b/iu],
  ['comparacion','RELACION',/\b(?:compared with|compared to|comparado con|comparada con|in comparison|en comparación|en comparacion|similar to|similar a|different from|diferente de|differs from|se diferencia de|whereas|mientras que|equivalent to|equivalente a)\b/iu],
  ['efecto','COMPORTAMIENTO',/\b(?:effect|efecto|consequence|consecuencia|results in|resulta en|leads to|conduce a|causes?|causa|produce|produces|affects?|afecta)\b/iu],
  ['comportamiento','COMPORTAMIENTO',/\b(?:behavior|behaviour|comportamiento|increases?|increased|decreases?|decreased|aumenta|aumentado|disminuye|disminuido|evolves?|evoluciona|response|respuesta|transition|transición|transicion|reversible|irreversible|stable|unstable|estable|inestable)\b/iu],
  ['aplicacion','APLICACION',/\b(?:application|aplicación|aplicacion|used for|used in|se utiliza|se usa|utilizado para|utilizada para|suitable for|adecuado para|recommended use|uso recomendado)\b/iu],
  ['ventaja','APLICACION',/\b(?:advantage|advantages|ventaja|ventajas|benefit|benefits|beneficio|beneficios|particularly useful|especially useful)\b/iu],
  ['limitacion','DEFINICION',/\b(?:limitation|limitations|limitación|limitaciones|drawback|desventaja|disadvantage|not suitable|no es adecuado|not applicable|no aplica)\b/iu],
  ['excepcion','DEFINICION',/\b(?:exception|exceptions|excepción|excepciones|except when|excepto cuando|unless|salvo que)\b/iu],
  ['riesgo','CONDICION',/\b(?:risk|risks|riesgo|riesgos|hazard|hazards|peligro|peligros|safety|seguridad|toxic|tóxico|toxico|corrosive|corrosivo)\b/iu],
  ['ejemplo','EVIDENCIA',/\b(?:example|examples|ejemplo|ejemplos|for instance|por ejemplo|such as|como por ejemplo)\b/iu],
  ['norma','NORMA',/\b(?:ASTM|ISO|IRAM|EN|UNE|AASHTO|DIN|BS|JIS|IEC|NF|CSA|GB|ABNT|standard|norma|specification|especificación|especificacion)\b/iu],
  ['evidencia_experimental','EVIDENCIA',/\b(?:experimental|experimentally|experimentalmente|measured experimentally|observed|observado|test results|resultados de ensayo|empirical|empírico|empirico)\b/iu],
  ['evidencia_teorica','EVIDENCIA',/\b(?:theoretical|theoretically|teórico|teoricamente|teóricamente|theory predicts|la teoría predice|la teoria predice|simulation|simulación|simulacion|simulated|simulado)\b/iu],
];

function idioma(t:string):'es'|'en'|'mixto'{const s=t.toLowerCase();const es=(s.match(/\b(?:el|la|los|las|de|del|que|una|un|para|con|se|como|mide|propiedad|material|muestra|ensayo|resultado|cuando|entre|es|por)\b/g)||[]).length;const en=(s.match(/\b(?:the|of|and|is|are|a|an|for|with|by|as|measure|measurement|property|material|sample|test|result|when|between)\b/g)||[]).length;return es&&en?'mixto':en>es?'en':'es';}
function blocks(texto:string):Block[]{const out:Block[]=[];let cursor=0;for(const raw of texto.split(/\n{2,}/)){const start=texto.indexOf(raw,cursor);cursor=(start<0?cursor:start)+raw.length;const text=norm(raw);if(text.length>=30)out.push({text,start:start<0?0:start,end:(start<0?0:start)+raw.length});}if(!out.length&&texto.trim())out.push({text:norm(texto),start:0,end:texto.length});return out;}
function sentenceData(block:Block,pos:number){const local=Math.max(0,Math.min(block.text.length,pos-block.start));const sentences=block.text.split(/(?<=[.!?])\s+/);let cursor=0,index=0;for(let i=0;i<sentences.length;i++){const end=cursor+sentences[i].length;if(local>=cursor&&local<=end){index=i;break;}cursor=end+1;}const a=Math.max(0,index-8),b=Math.min(sentences.length,index+9);const exact=norm(sentences[index]||block.text);const broad=norm(sentences.slice(a,b).join(' '));const exactStart=Math.max(0,block.start+block.text.indexOf(sentences[index]||''));const broadStart=Math.max(0,block.start+block.text.indexOf(sentences[a]||''));return {exact,broad,exactStart,broadStart};}
function bad(name:string){const s=canon(name);return INVALIDA.test(s)||s.length<3||s.length>100||/\b(?:que|porque|cuando|donde|which|that|because|when|where|and|y|en los|en las|in the|of the)\s*$/i.test(s)||/^(?:componente|component|fase|phase|método|metodo|method|procedimiento|procedure|instrumento|instrument|equipo|equipment|aparato|apparatus)$/i.test(s);}
function addEntity(out:Entity[],type:Tipo,name:string,pos:number,meta?:Record<string,unknown>){const n=canon(name);if(!bad(n))out.push({type,name:n,pos,meta});}
function entities(texto:string):Entity[]{
 const out:Entity[]=[];const materialRanges:Array<{start:number;end:number}>[] = [];
 for(const term of MATERIAL_TERMS){const r=new RegExp(`(?<![\\p{L}\\p{N}])${esc(term)}(?![\\p{L}\\p{N}])`,'giu');let m:RegExpExecArray|null;while((m=r.exec(texto))){materialRanges.push({start:m.index,end:m.index+m[0].length} as any);addEntity(out,'MATERIAL',m[0],m.index);}}
 const overlapsMaterial=(start:number,end:number)=>materialRanges.some(x=>start<x.end&&end>x.start);
 const propertyNames=new Map<string,string>();for(const p of PROPIEDADES)for(const term of [p.nombre_es,p.nombre_en,...(p.sinonimos||[])])if(term&&term.trim().length>=3)propertyNames.set(norm(term).toLowerCase(),norm(term));
 for(const [key,term] of propertyNames){if(MATERIAL_SET.has(key))continue;const symbolic=/^(?:pH|E|G|K|R|T|P|V|I|A|C|d50|MOR|SSA|WA|Vp|dp|ρ|ρs|ρb|φ|τ)$/i.test(term);const flags=symbolic?'gu':'giu';const r=new RegExp(`(?<![\\p{L}\\p{N}])${esc(term)}(?![\\p{L}\\p{N}])`,flags);let m:RegExpExecArray|null;while((m=r.exec(texto))){if(overlapsMaterial(m.index,m.index+m[0].length))continue;if(symbolic&&/\bPh\.?\s*(?:D|d)?\.?/i.test(texto.slice(Math.max(0,m.index-2),Math.min(texto.length,m.index+8))))continue;addEntity(out,'PROPIEDAD',term,m.index,{diccionario:'propiedades',termino:m[0],simbolo:symbolic});}}
 for(const a of ATRIBUTOS)for(const term of [a.nombre_es,a.nombre_en].filter(Boolean) as string[]){const r=new RegExp(`(?<![\\p{L}\\p{N}])${esc(term)}(?![\\p{L}\\p{N}])`,'giu');let m:RegExpExecArray|null;while((m=r.exec(texto)))if(!overlapsMaterial(m.index,m.index+m[0].length))addEntity(out,'ATRIBUTO',m[0],m.index,{diccionario:a.id});}
 for(const term of MAGNITUDE_TERMS){const r=new RegExp(`(?<![\\p{L}\\p{N}])${esc(term)}(?![\\p{L}\\p{N}])`,'giu');let m:RegExpExecArray|null;while((m=r.exec(texto)))if(!overlapsMaterial(m.index,m.index+m[0].length))addEntity(out,'MAGNITUD',m[0],m.index,{diccionario:'magnitudes_basicas'});}
 NORMA.lastIndex=0;let m:RegExpExecArray|null;while((m=NORMA.exec(texto)))addEntity(out,'NORMA',m[0],m.index);
 for(const [r,type] of [[COMPONENTE,'COMPONENTE'],[METODO,'METODO'],[INSTRUMENTO,'INSTRUMENTO']] as const){r.lastIndex=0;while((m=r.exec(texto))){let c=canon(m[1]||'').replace(/\s+(?:que|which|that|porque|because)\s+.*$/i,'').replace(/\s+(?:y|and)\s+.*$/i,'');if(!bad(c))addEntity(out,type,c,m.index,{disparador:m[0]});}}
 const unique=new Map<string,Entity>();for(const e of out){const k=`${e.type}|${e.name.toLowerCase()}|${e.pos}`;if(!unique.has(k))unique.set(k,e);}return [...unique.values()].sort((a,b)=>a.pos-b.pos);
}
function relationCue(text:string):{name:string;index:number}|undefined{const rs:Array<[string,RegExp]>=[['depende_de',/depende de|depends on|dependent on/gi],['afecta',/afecta|affects|influye|influences/gi],['afectada_por',/afectado por|afectada por|affected by/gi],['relacionada_con',/relacionado con|related to|associated with|asociado con|linked to|vinculado con/gi],['comparada_con',/comparado con|compared with|similar to|similar a|different from|diferente de|equivalent to|equivalente a/gi],['utilizada_en',/utilizado en|utilizada en|used in|used for|se utiliza|se usa/gi],['determinada_por',/determinada por|determined by|measured by|measured using/gi]];let best:{name:string;index:number}|undefined;for(const [name,re] of rs){re.lastIndex=0;const m=re.exec(text);if(m&&(!best||m.index<best.index))best={name,index:m.index};}return best;}
function make(a:{neuronId:string;type:Tipo;entity:string;aspect:string;data:string;context?:string;fragment?:string;pagina:number;documento:string;start:number;end:number;confidence:number;rel?:string;meta?:Record<string,unknown>;valor?:number;valorTexto?:string;unidad?:string;simbolo?:string}):HallazgoND{const data=norm(a.data),ctx=norm(a.context||a.data),frag=norm(a.fragment||a.data),lang=idioma(ctx);return {neuronId:a.neuronId,tipo:a.type,campo:`${a.type.toLowerCase()}_${a.aspect}`,textoOriginal:data,textoNormalizado:data.toLowerCase(),entidadCandidata:a.entity,entidadPrincipal:a.entity,aspecto:a.aspect,datoDocumental:data,relacionEntidad:a.rel,valor:a.valor,valorTexto:a.valorTexto,unidad:a.unidad,simbolo:a.simbolo,contexto:ctx,idioma:lang,confianza:a.confidence,evidencia:{documento:a.documento,pagina:a.pagina,fragmento:frag,idioma:lang,tipoDocumento:'desconocido',posicionInicio:a.start,posicionFin:a.end},metadatos:{extractor:'extractorDocumentalExhaustivoNDV4',entidadPrincipal:a.entity,aspecto:a.aspect,completo:true,noResumido:a.aspect.startsWith('definicion'),contextoAmplio:ctx,...(a.meta||{})}};}
function values(text:string,base:number){const out:Array<{raw:string;start:number;value?:number;unit?:string}>=[];const r=new RegExp(`(${NUM})\\s*(${UNITS})`,'giu');let m:RegExpExecArray|null;while((m=r.exec(text))){const vt=m[1],v=Number(vt.replace(',','.'));out.push({raw:m[0],start:base+m.index,value:Number.isFinite(v)?v:undefined,unit:m[2]});}return out;}
function formulaRanges(text:string,base:number){const out:Array<{raw:string;start:number;end:number}>=[];const r=/(?:[A-Za-zα-ωΑ-Ω][A-Za-z0-9α-ωΑ-Ω_()\[\].·*+\-/^ ]{0,80}\s*(?:=|≈|≤|≥)\s*[^.;\n]{1,220})/g;let m:RegExpExecArray|null;while((m=r.exec(text))){const raw=norm(m[0]);if(raw.length>=5&&raw.length<=320)out.push({raw,start:base+m.index,end:base+m.index+m[0].length});}return out;}

export function extraerDocumentalExhaustivoNDV3(texto:string,pagina:number,documento:string,neuronId:string):HallazgoND[]{
 const out:HallazgoND[]=[];const seen=new Set<string>();const bs=blocks(texto);const es=entities(texto);
 const add=(h:HallazgoND)=>{const k=[h.tipo,h.entidadPrincipal||'',h.aspecto||'',h.evidencia.pagina,h.evidencia.posicionInicio??'',h.evidencia.posicionFin??'',h.datoDocumental||'',h.valorTexto||'',h.unidad||''].join('|');if(!seen.has(k)){seen.add(k);out.push(h);}};
 for(const e of es){
  const b0=bs.find(b=>b.start<=e.pos&&e.pos<=b.end)||bs[0];if(!b0)continue;const sd=sentenceData(b0,e.pos);const rel=relationCue(sd.broad)?.name;
  add(make({neuronId,type:'EVIDENCIA',entity:e.name,aspect:'bloque_documental_completo',data:sd.broad,fragment:sd.exact,context:sd.broad,pagina,documento,start:sd.broadStart,end:sd.broadStart+sd.broad.length,confidence:.72,rel,meta:{entidadTipo:e.type,entidadMeta:e.meta}}));
  for(const [aspect,type,rx] of ASPECTS){rx.lastIndex=0;if(!rx.test(sd.broad))continue;const confidence=(aspect==='definicion'||aspect==='que_es')?0.92:0.80;add(make({neuronId,type,entity:e.name,aspect,data:sd.broad,fragment:sd.exact,context:sd.broad,pagina,documento,start:sd.broadStart,end:sd.broadStart+sd.broad.length,confidence,rel,meta:{entidadTipo:e.type,entidadMeta:e.meta,disparador:rx.source}}));}
  for(const v of values(b0.text,b0.start)){const dist=Math.abs(v.start-e.pos);if(dist>1800)continue;add(make({neuronId,type:'MAGNITUD',entity:e.name,aspect:'valor_documental_asociado',data:v.raw,fragment:v.raw,context:sd.broad,pagina,documento,start:v.start,end:v.start+v.raw.length,confidence:.88,rel,valor:v.value,valorTexto:v.raw.split(/\s+/)[0],unidad:v.unit,meta:{entidadTipo:e.type,asociacion:'proximidad_en_bloque'}}));}
  for(const f of formulaRanges(sd.broad,sd.broadStart)){const dist=Math.abs(f.start-e.pos);if(dist>1800)continue;add(make({neuronId,type:'FORMULA',entity:e.name,aspect:'formula_documental_asociada',data:f.raw,fragment:f.raw,context:sd.broad,pagina,documento,start:f.start,end:f.end,confidence:.72,rel,meta:{entidadTipo:e.type,asociacion:'proximidad_en_contexto'}}));}
 }
 for(const b of bs){const inside=es.filter(e=>e.pos>=b.start&&e.pos<=b.end);if(inside.length<2)continue;const cue=relationCue(b.text);if(!cue)continue;const absoluteCue=b.start+cue.index;const before=inside.filter(e=>e.pos<absoluteCue).sort((a,z)=>absoluteCue-z.pos)[0];const after=inside.filter(e=>e.pos>absoluteCue).sort((a,z)=>z.pos-absoluteCue)[0];if(!before||!after||before.pos===after.pos)continue;const relationEntity=`${before.name} -> ${after.name}`;add(make({neuronId,type:'RELACION',entity:relationEntity,aspect:cue.name,data:b.text,fragment:b.text,context:b.text,pagina,documento,start:b.start,end:b.end,confidence:.78,rel:cue.name,meta:{entidadTipoOrigen:before.type,entidadOrigen:before.name,entidadTipoDestino:after.type,entidadDestino:after.name,relacionDireccionada:true}}));}
 for(const b of bs){if(b.text.length<120)continue;if(!/(?:defin|property|propiedad|material|component|componente|method|m[eé]todo|measurement|medici[oó]n|application|aplicaci[oó]n|composition|composici[oó]n|behavior|comportamiento|condition|condici[oó]n|instrument|instrumento|standard|norma|formula|fórmula|relationship|relaci[oó]n|effect|efecto)/i.test(b.text))continue;const k=`UNANCHORED|${b.start}|${b.end}`;if(seen.has(k))continue;seen.add(k);const lang=idioma(b.text);out.push({neuronId,tipo:'EVIDENCIA',campo:'bloque_tecnico_no_anclado',textoOriginal:b.text,textoNormalizado:b.text.toLowerCase(),contexto:b.text,idioma:lang,confianza:.42,evidencia:{documento,pagina,fragmento:b.text,idioma:lang,tipoDocumento:'desconocido',posicionInicio:b.start,posicionFin:b.end},metadatos:{extractor:'extractorDocumentalExhaustivoNDV4',requiereAnclajePosterior:true}});}
 return out;
}
