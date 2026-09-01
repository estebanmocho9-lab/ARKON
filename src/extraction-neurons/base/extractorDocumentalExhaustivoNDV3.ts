import { PROPIEDADES } from '../diccionarios/propiedades';
import { ATRIBUTOS } from '../diccionarios/atributos';
import { HallazgoND } from '../memoria-nd/tipos';

type Tipo = HallazgoND['tipo'];
type Block = { text: string; start: number; end: number };
type Entity = { type: Tipo; name: string; pos: number; meta?: Record<string, unknown> };

const norm=(s:string)=>s.replace(/\s+/g,' ').trim();
const canon=(s:string)=>norm(s).replace(/^["'“”‘’]+|["'“”‘’]+$/g,'');
const esc=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const UNITS=String.raw`(?:%|ppm|ppb|°C|ºC|K|MPa|GPa|kPa|Pa|N|kN|kg|g|mg|µg|um|μm|mm|cm|m|m²|m2|m3|m³|kg/m3|kg/m³|g/cm3|g/cm³|W/mK|W/m·K|W/(m·K)|J/g|J/kg|kJ/kg|MJ/kg|Hz|s|min|h|d|mol|mol/L|M|V|A|Ω|Ohm|mS/cm|S/m)`;
const NUM=String.raw`[-+]?\d+(?:[.,]\d+)?(?:\s*[×x*]\s*10\s*[-+]?\d+)?`;

const MATERIAL_TERMS=[
 'cemento Portland','pasta de cemento','cemento','yeso','gypsum','hormigón','hormigon','concreto','concrete','mortero','mortar',
 'arena','sand','arcilla','clay','vidrio','glass','fibra de vidrio','glass fiber','acero','steel','aluminio','aluminum',
 'cobre','copper','hierro','iron','madera','wood','plástico','plastico','plastic','resina','resin','polímero','polimero','polymer',
 'epoxi','epoxy','cerámica','ceramica','ceramic','ladrillo','brick','árido','arido','agregado','aggregate','composite','compuesto',
 'óxido de aluminio','oxido de aluminio','óxido de calcio','oxido de calcio','óxido de hierro','oxido de hierro',
 'óxido de silicio','oxido de silicio','óxido de sodio','oxido de sodio','alúmina','alumina','sílice','silica'
];
const NORMA=/\b(?:ASTM|ISO|IRAM|EN|UNE|AASHTO|DIN|BS|JIS|IEC|NF|CSA|GB|ABNT)\s*[- ]?\s*[A-Z]?\s*\d{2,6}(?:[-:]\d{2,4})?(?:\s*[-:]?\s*[A-Z]\d{0,3})?\b/giu;
const COMPONENTE=/\b(?:componente|component|constituyente|constituent|fase|phase|aditivo|additive|matriz|matrix|ligante|binder|relleno|filler)\s*(?::|=|denominado\s+|llamado\s+|called\s+|named\s+)?\s*([^,.;:\n]{2,90})/giu;
const METODO=/\b(?:método|metodo|method|procedimiento|procedure|ensayo|test|técnica|tecnica|technique|protocolo|protocol)\s+(?:de\s+|del\s+|para\s+|the\s+|of\s+|for\s+)?([^,.;:\n]{2,100})/giu;
const INSTRUMENTO=/\b(?:instrumento|instrument|equipo|equipment|aparato|apparatus|dispositivo|device|sensor|sonda|probe|microscopio|microscope|espectrómetro|espectrometro|spectrometer|balanza|balance|termómetro|termometro|thermometer|prensa|press|extensómetro|extensometro|extensometer)\s+(?:de\s+|para\s+|the\s+|for\s+)?([^,.;:\n]{2,100})/giu;

const ASPECTS:Array<[string,Tipo,RegExp]>=[
 ['definicion','DEFINICION',/\b(?:se define como|se define|definid[oa] como|definition|defined as|is defined as|refers to|se refiere a|means|significa)\b/iu],
 ['que_es','DEFINICION',/\b(?:es un|es una|es el|es la|is a|is an|is the|consiste en|consists of|denota|denotes)\b/iu],
 ['identidad','DEFINICION',/\b(?:también conocido como|tambien conocido como|also known as|known as|denominado|llamado|abbreviated|abreviado|símbolo|simbolo|symbol|synonym|sinónimo)\b/iu],
 ['significado','DEFINICION',/\b(?:significa|significado|meaning|means|representa|represents?|interpreta|interpreted)\b/iu],
 ['fundamento','DEFINICION',/\b(?:fundamento|principio|principle|basis|mechanism|mecanismo|theory|teoría|teoria|based on|basado en)\b/iu],
 ['que_mide','PROPIEDAD',/\b(?:mide|medir|medición|medicion|measurement|measures?|quantifies?|cuantifica|determina|determines?|indica|indicates)\b/iu],
 ['que_no_mide','PROPIEDAD',/\b(?:no mide|no cuantifica|no representa|does not measure|does not quantify|not a measure of|no debe confundirse|should not be confused)\b/iu],
 ['composicion','EVIDENCIA',/\b(?:composición|composicion|composition|composed of|consists of|contains|contiene|constituido por|formed by|formado por|made of|porcentaje|percentage|proporción|proporcion|proportion|ratio)\b/iu],
 ['estructura','EVIDENCIA',/\b(?:estructura|structure|microestructura|microstructure|crystal|cristal|grain|grano|pore structure|estructura de poros)\b/iu],
 ['subpropiedad','PROPIEDAD',/\b(?:subpropiedad|sub-property|subproperties|parámetros|parametros|parameters?|variables internas|internal variables|tipos de|types of|classified as|clasificada como)\b/iu],
 ['valor_y_unidad','MAGNITUD',new RegExp(`(?:\\b(?:valor|value|measured at|medido a|measured value|reported value|rango|range|between|entre|maximum|minimum|typical|típico|tipico|average|promedio)\\b|${NUM}\\s*${UNITS})`,'iu')],
 ['formula','FORMULA',/\b(?:formula|fórmula|equation|ecuación|ecuacion|calculated from|calculado a partir de)\b/iu],
 ['determinacion','METODO',/\b(?:se determina|determinación|determinacion|determination|determined by|determined using|se mide|measured by|measured using|method|método|metodo|procedure|procedimiento|test|ensayo|technique|técnica|tecnica)\b/iu],
 ['procedimiento','METODO',/\b(?:procedure|procedimiento|steps?|pasos|first|then|finally|primero|después|despues|finalmente|prepare|preparar|preparation|preparación|preparacion)\b/iu],
 ['instrumento','INSTRUMENTO',/\b(?:instrument|instrumento|equipment|equipo|apparatus|aparato|device|dispositivo|sensor|sonda|probe|microscope|microscopio|spectrometer|espectrómetro|espectrometro)\b/iu],
 ['calibracion','INSTRUMENTO',/\b(?:calibrat|calibración|calibracion|calibrated|calibrado|reference material|material de referencia|standardization|estandarización|estandarizacion)\b/iu],
 ['condicion','CONDICION',/\b(?:temperature|temperatura|pressure|presión|presion|humidity|humedad|time|tiempo|age|edad|concentration|concentración|concentracion|pH|atmosphere|atmósfera|atmosfera|vacuum|vacío|vacio|dry|seco|wet|húmedo|humedo|saturated|saturado|curing|curado|setting|fraguado)\b/iu],
 ['dependencia','RELACION',/\b(?:depends on|depende de|dependent on|dependiente de|influenced by|influido por|affected by|afectado por|as a function of|en función de|en funcion de)\b/iu],
 ['relacion','RELACION',/\b(?:related to|relacionado con|correlates with|correlaciona con|associated with|asociado con|proportional to|proporcional a|inversely|inversamente|directly|directamente)\b/iu],
 ['comparacion','RELACION',/\b(?:compared with|compared to|comparado con|comparada con|in comparison|en comparación|en comparacion|similar to|similar a|different from|diferente de|differs from|se diferencia de|whereas|mientras que)\b/iu],
 ['efecto','COMPORTAMIENTO',/\b(?:effect|efecto|consequence|consecuencia|results in|resulta en|leads to|conduce a|causes?|causa|produce|produces)\b/iu],
 ['comportamiento','COMPORTAMIENTO',/\b(?:behavior|behaviour|comportamiento|increases?|increased|decreases?|decreased|aumenta|aumentado|disminuye|disminuido|evolves?|evoluciona|response|respuesta|transition|transición|transicion|reversible|irreversible)\b/iu],
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
function sentenceWindow(block:Block,pos:number):Block{const local=Math.max(0,Math.min(block.text.length,pos-block.start));const sentences=block.text.split(/(?<=[.!?])\s+/);let cursor=0,index=0;for(let i=0;i<sentences.length;i++){const end=cursor+sentences[i].length;if(local>=cursor&&local<=end){index=i;break;}cursor=end+1;}const definition=/(?:define|defined|definition|se define|definid|refers to|se refiere|means|significa|is a|is an|es un|es una|consists of|consiste en)/i.test(block.text);const radius=definition?8:3;const a=Math.max(0,index-radius),b=Math.min(sentences.length,index+radius+1);const text=norm(sentences.slice(a,b).join(' '));const start=Math.max(0,block.start+block.text.indexOf(sentences[a]));return {text,start,end:start+text.length};}
function bad(name:string){const s=canon(name);return s.length<3||s.length>100||/^entidad\s+no\s+determinada$/i.test(s)||/\b(?:que|porque|cuando|donde|which|that|because|when|where|and|y|en los|en las|in the|of the)\s*$/i.test(s)||/^(?:componente|component|fase|phase|método|metodo|method|instrumento|instrument|equipo|equipment)$/i.test(s);}
function addEntity(out:Entity[],type:Tipo,name:string,pos:number,meta?:Record<string,unknown>){const n=canon(name);if(!bad(n))out.push({type,name:n,pos,meta});}
function entities(texto:string):Entity[]{
 const out:Entity[]=[];const propertyNames=new Set<string>();
 for(const p of PROPIEDADES)for(const term of [p.nombre_es,p.nombre_en,...(p.sinonimos||[])])if(term&&term.trim().length>=4)propertyNames.add(norm(term));
 for(const term of propertyNames){const r=new RegExp(`(?<![\\p{L}\\p{N}])${esc(term)}(?![\\p{L}\\p{N}])`,'giu');let m:RegExpExecArray|null;while((m=r.exec(texto)))addEntity(out,'PROPIEDAD',term,m.index,{diccionario:'propiedades',termino:m[0]});}
 for(const a of ATRIBUTOS)for(const term of [a.nombre_es,a.nombre_en].filter(Boolean) as string[]){const r=new RegExp(`(?<![\\p{L}\\p{N}])${esc(term)}(?![\\p{L}\\p{N}])`,'giu');let m:RegExpExecArray|null;while((m=r.exec(texto)))addEntity(out,'ATRIBUTO',m[0],m.index,{diccionario:a.id});}
 for(const term of MATERIAL_TERMS){const r=new RegExp(`(?<![\\p{L}\\p{N}])${esc(term)}(?![\\p{L}\\p{N}])`,'giu');let m:RegExpExecArray|null;while((m=r.exec(texto)))addEntity(out,'MATERIAL',m[0],m.index);}
 NORMA.lastIndex=0;let m:RegExpExecArray|null;while((m=NORMA.exec(texto)))addEntity(out,'NORMA',m[0],m.index);
 for(const [r,type] of [[COMPONENTE,'COMPONENTE'],[METODO,'METODO'],[INSTRUMENTO,'INSTRUMENTO']] as const){r.lastIndex=0;while((m=r.exec(texto))){const c=canon(m[1]||'');if(!bad(c))addEntity(out,type,c,m.index,{disparador:m[0]});}}
 const unique=new Map<string,Entity>();for(const e of out){const k=`${e.type}|${e.name.toLowerCase()}|${e.pos}`;if(!unique.has(k))unique.set(k,e);}return [...unique.values()].sort((a,b)=>a.pos-b.pos);
}
function relation(name:string,text:string){const i=text.toLowerCase().indexOf(name.toLowerCase());if(i<0)return;const z=text.slice(Math.max(0,i-350),Math.min(text.length,i+name.length+500)).toLowerCase();const rs:Array<[string,RegExp]>=[['depende_de',/depende de|depends on|dependent on/],['afecta',/afecta|affects|influye|influences/],['afectada_por',/afectado por|afectada por|affected by/],['relacionada_con',/relacionado con|related to|associated with|asociado con/],['comparada_con',/comparado con|compared with|similar to|similar a|different from|diferente de/],['utilizada_en',/utilizado en|utilizada en|used in|used for|se utiliza|se usa/],['determinada_por',/determinada por|determined by|measured by|measured using/]];return rs.find(([,re])=>re.test(z))?.[0];}
function make(a:{neuronId:string;type:Tipo;entity:string;aspect:string;data:string;pagina:number;documento:string;start:number;end:number;confidence:number;rel?:string;meta?:Record<string,unknown>}):HallazgoND{const data=norm(a.data),lang=idioma(data);return {neuronId:a.neuronId,tipo:a.type,campo:`${a.type.toLowerCase()}_${a.aspect}`,textoOriginal:data,textoNormalizado:data.toLowerCase(),entidadCandidata:a.entity,entidadPrincipal:a.entity,aspecto:a.aspect,datoDocumental:data,relacionEntidad:a.rel,contexto:data,idioma:lang,confianza:a.confidence,evidencia:{documento:a.documento,pagina:a.pagina,fragmento:data,idioma:lang,tipoDocumento:'desconocido',posicionInicio:a.start,posicionFin:a.end},metadatos:{extractor:'extractorDocumentalExhaustivoNDV4',entidadPrincipal:a.entity,aspecto:a.aspect,completo:true,noResumido:a.aspect.startsWith('definicion'),...(a.meta||{})}};}

export function extraerDocumentalExhaustivoNDV3(texto:string,pagina:number,documento:string,neuronId:string):HallazgoND[]{
 const out:HallazgoND[]=[];const seen=new Set<string>();const bs=blocks(texto);const es=entities(texto);
 const add=(h:HallazgoND)=>{const k=[h.tipo,h.entidadPrincipal||'',h.aspecto||'',h.evidencia.pagina,h.evidencia.posicionInicio||'',h.evidencia.posicionFin||'',h.datoDocumental||''].join('|');if(!seen.has(k)){seen.add(k);out.push(h);}};
 for(const e of es){
  const b0=bs.find(b=>b.start<=e.pos&&e.pos<=b.end)||bs[0];if(!b0)continue;const b=sentenceWindow(b0,e.pos);
  add(make({neuronId,type:'EVIDENCIA',entity:e.name,aspect:'bloque_documental_completo',data:b.text,pagina,documento,start:b.start,end:b.end,confidence:.72,rel:relation(e.name,b.text),meta:{entidadTipo:e.type,entidadMeta:e.meta}}));
  for(const [aspect,type,rx] of ASPECTS){rx.lastIndex=0;if(!rx.test(b.text))continue;const confidence=aspect==='definicion'||aspect==='que_es'?.92:.80;add(make({neuronId,type,entity:e.name,aspect,data:b.text,pagina,documento,start:b.start,end:b.end,confidence,rel:relation(e.name,b.text),meta:{entidadTipo:e.type,entidadMeta:e.meta,disparador:rx.source}}));}
 }
 for(const b of bs){if(b.text.length<120)continue;if(!/(?:defin|property|propiedad|material|component|componente|method|m[eé]todo|measurement|medici[oó]n|application|aplicaci[oó]n|composition|composici[oó]n|behavior|comportamiento|condition|condici[oó]n|instrument|instrumento|standard|norma|formula|fórmula|relationship|relaci[oó]n|effect|efecto)/i.test(b.text))continue;const k=`UNANCHORED|${b.start}|${b.end}`;if(seen.has(k))continue;seen.add(k);const lang=idioma(b.text);out.push({neuronId,tipo:'EVIDENCIA',campo:'bloque_tecnico_no_anclado',textoOriginal:b.text,textoNormalizado:b.text.toLowerCase(),contexto:b.text,idioma:lang,confianza:.42,evidencia:{documento,pagina,fragmento:b.text,idioma:lang,tipoDocumento:'desconocido',posicionInicio:b.start,posicionFin:b.end},metadatos:{extractor:'extractorDocumentalExhaustivoNDV4',requiereAnclajePosterior:true}});}
 return out;
}
