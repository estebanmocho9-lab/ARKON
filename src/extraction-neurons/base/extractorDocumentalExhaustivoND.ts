import { PROPIEDADES } from '../diccionarios/propiedades';
import { ATRIBUTOS } from '../diccionarios/atributos';
import { HallazgoND } from '../memoria-nd/tipos';

/**
 * ND DOCUMENTAL EXHAUSTIVO
 *
 * Regla central:
 *   entidad concreta -> aspecto documental -> dato completo -> evidencia
 *
 * Este extractor NO intenta resumir. Conserva el bloque documental completo
 * donde el documento explica una entidad. Una definicion nunca se reduce a la
 * frase que disparo el hallazgo: se guarda el parrafo completo y, cuando la
 * definicion continua, los parrafos consecutivos que pertenecen al mismo bloque.
 *
 * ND puede sobreextraer. La curacion posterior decide que conocimiento pasa a
 * memoria cientifica. Aqui la prioridad es NO PERDER INFORMACION DOCUMENTAL.
 */

const normalizar=(s:string)=>s.replace(/\s+/g,' ').trim();
const escapar=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

const RE_MATERIAL=/\b(?:cemento(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9-]+){0,6}|pasta de cemento|cement paste|cal(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9-]+){0,5}|yeso|gypsum|hormig[oó]n|concreto|concrete|mortero|mortar|arena|sand|arcilla|clay|vidrio|glass|fibra de vidrio|glass fiber|acero(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9-]+){0,5}|steel(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9-]+){0,5}|aluminio|aluminum|cobre|copper|hierro|iron|madera|wood|pl[aá]stico|plastic|resina|resin|pol[ií]mero|polymer|epoxi|epoxy|cer[aá]mica|ceramic|ladrillo|brick|[aá]rido(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9-]+){0,3}|agregado(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9-]+){0,3}|aggregate(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9-]+){0,3}|composite|compuesto(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9-]+){0,5}|[A-Z][a-z]{1,15}\s+(?:oxide|óxido|sulfate|sulfato|carbonate|carbonato|chloride|cloruro|hydroxide|hidróxido))\b/giu;
const RE_NORMA=/\b(?:ASTM|ISO|IRAM|EN|UNE|AASHTO|DIN|BS|JIS|IEC|NF|CSA|GB|ABNT)\s*[- ]?\s*[A-Z]?\s*\d{2,6}(?:[-:]\d{2,4})?(?:\s*[-:]?\s*[A-Z]\d{0,3})?\b/giu;
const RE_COMPONENTE=/\b(?:componente|component|constituyente|constituent|fase|phase|aditivo|additive|agregado|aggregate|matriz|matrix|ligante|binder|relleno|filler)\s+(?:denominado\s+|llamado\s+|called\s+|named\s+)?([A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9][^,.;:\n]{1,100})/giu;
const RE_METODO=/\b(?:método|metodo|method|procedimiento|procedure|ensayo|test|técnica|technique|protocolo|protocol)\s+(?:de\s+|del\s+|para\s+|the\s+|of\s+|for\s+)?([A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9][^,.;:\n]{1,100})/giu;
const RE_INSTRUMENTO=/\b(?:instrumento|instrument|equipo|equipment|aparato|apparatus|dispositivo|device|sensor|sonda|probe|microscopio|microscope|espectrómetro|spectrometer|balanza|balance|termómetro|thermometer|prensa|press|extensómetro|extensometer)\s+(?:de\s+|para\s+|the\s+|for\s+)?([A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9][^,.;:\n]{1,100})/giu;

const ASPECTOS:Array<{aspecto:string;tipo:HallazgoND['tipo'];regex:RegExp}>= [
 {aspecto:'definicion',tipo:'DEFINICION',regex:/\b(?:se define como|se define|definida como|definido como|definition|defined as|is defined as|refers to|se refiere a|means|significa|is a|es una|es un)\b/iu},
 {aspecto:'que_es',tipo:'DEFINICION',regex:/\b(?:es|is|consiste en|consists of|refers to|se refiere a|denotes|denota)\b/iu},
 {aspecto:'que_mide',tipo:'PROPIEDAD',regex:/\b(?:mide|medir|medición|measurement|measures?|quantifies?|cuantifica|indica|indicates|determines?|determina)\b/iu},
 {aspecto:'que_no_mide',tipo:'PROPIEDAD',regex:/\b(?:no mide|no cuantifica|no representa|does not measure|does not quantify|not a measure of|no debe confundirse|should not be confused)\b/iu},
 {aspecto:'significado',tipo:'DEFINICION',regex:/\b(?:significa|significado|meaning|means|represents?|representa|interpreted|interpretarse|indica|indicates)\b/iu},
 {aspecto:'fundamento',tipo:'DEFINICION',regex:/\b(?:fundamento|principio|principle|basis|underlying|mechanism|mecanismo|theory|teoría|teoria|based on|basado en)\b/iu},
 {aspecto:'composicion',tipo:'EVIDENCIA',regex:/\b(?:composición|composicion|composition|composed of|consists of|contains|contiene|constituido por|constituida por|formed by|formado por|made of|porcentaje|percentage|proporción|proportion|ratio)\b/iu},
 {aspecto:'estructura',tipo:'EVIDENCIA',regex:/\b(?:estructura|structure|microestructura|microstructure|phase|fase|crystal|cristal|grain|grano|pore structure|estructura de poros)\b/iu},
 {aspecto:'subpropiedad',tipo:'PROPIEDAD',regex:/\b(?:subpropiedad|sub-property|componentes de la propiedad|parameters?|parámetros|variables internas|internal variables|tipos de|types of|classified as|clasificada como)\b/iu},
 {aspecto:'valor',tipo:'MAGNITUD',regex:/\b(?:valor|value|measured at|medido a|measured value|reported value|rango|range|between|entre|maximum|maximum value|minimum|minimum value|typical|típico|average|promedio)\b/iu},
 {aspecto:'unidad',tipo:'MAGNITUD',regex:/\b(?:unidad|unit|units|expressed in|expresado en|SI units|unidades SI)\b/iu},
 {aspecto:'formula',tipo:'FORMULA',regex:/[=≈≤≥]|\b(?:formula|fórmula|equation|ecuación|calculated from|calculado a partir de)\b/iu},
 {aspecto:'como_se_determina',tipo:'METODO',regex:/\b(?:se determina|determinación|determination|determined by|determined using|se mide|measured by|measured using|method|método|procedure|procedimiento|test|ensayo|technique|técnica)\b/iu},
 {aspecto:'procedimiento',tipo:'METODO',regex:/\b(?:procedure|procedimiento|steps?|pasos|first|then|finally|primero|después|finalmente|prepare|preparar|preparation|preparación)\b/iu},
 {aspecto:'instrumento',tipo:'INSTRUMENTO',regex:/\b(?:instrument|instrumento|equipment|equipo|apparatus|aparato|device|dispositivo|sensor|sonda|microscope|microscopio|spectrometer|espectrómetro)\b/iu},
 {aspecto:'calibracion',tipo:'INSTRUMENTO',regex:/\b(?:calibrat|calibración|calibracion|calibrated|calibrado|reference material|material de referencia|standardization|estandarización)\b/iu},
 {aspecto:'condicion',tipo:'CONDICION',regex:/\b(?:temperature|temperatura|pressure|presión|presion|humidity|humedad|time|tiempo|age|edad|concentration|concentración|pH|atmosphere|atmósfera|atmosfera|vacuum|vacío|vacío|dry|seco|wet|húmedo|humedo|saturated|saturado|curing|curado|setting|fraguado)\b/iu},
 {aspecto:'dependencia',tipo:'RELACION',regex:/\b(?:depends on|depende de|dependent on|dependiente de|influenced by|influido por|affected by|afectado por|as a function of|en función de)\b/iu},
 {aspecto:'relacion',tipo:'RELACION',regex:/\b(?:related to|relacionado con|correlates with|correlaciona con|associated with|asociado con|proportional to|proporcional a|inversely|inversamente|directly|directamente)\b/iu},
 {aspecto:'comparacion',tipo:'RELACION',regex:/\b(?:compared with|compared to|comparado con|comparada con|in comparison|en comparación|similar to|similar a|different from|diferente de|differs from|se diferencia de|whereas|mientras que)\b/iu},
 {aspecto:'efecto',tipo:'COMPORTAMIENTO',regex:/\b(?:effect|efecto|consequence|consecuencia|results in|resulta en|leads to|conduce a|causes?|causa|produce|produces)\b/iu},
 {aspecto:'comportamiento',tipo:'COMPORTAMIENTO',regex:/\b(?:behavior|behaviour|comportamiento|increases?|increased|decreases?|decreased|aumenta|aumentado|disminuye|disminuido|evolves?|evoluciona|response|respuesta|transition|transición|reversible|irreversible)\b/iu},
 {aspecto:'aplicacion',tipo:'APLICACION',regex:/\b(?:application|aplicación|aplicacion|used for|used in|se utiliza|se usa|utilizado para|utilizada para|suitable for|adecuado para|recommended use|uso recomendado)\b/iu},
 {aspecto:'ventaja',tipo:'APLICACION',regex:/\b(?:advantage|advantages|ventaja|ventajas|benefit|benefits|beneficio|beneficios|particularly useful|especially useful)\b/iu},
 {aspecto:'limitacion',tipo:'DEFINICION',regex:/\b(?:limitation|limitations|limitación|limitaciones|drawback|desventaja|disadvantage|not suitable|no es adecuado|not applicable|no aplica)\b/iu},
 {aspecto:'excepcion',tipo:'DEFINICION',regex:/\b(?:exception|exceptions|excepción|excepciones|except when|excepto cuando|unless|salvo que)\b/iu},
 {aspecto:'riesgo_seguridad',tipo:'CONDICION',regex:/\b(?:risk|risks|riesgo|riesgos|hazard|hazards|peligro|peligros|safety|seguridad|toxic|tóxico|corrosive|corrosivo)\b/iu},
 {aspecto:'ejemplo',tipo:'EVIDENCIA',regex:/\b(?:example|examples|ejemplo|ejemplos|for instance|por ejemplo|such as|como por ejemplo)\b/iu},
 {aspecto:'norma',tipo:'NORMA',regex:/\b(?:ASTM|ISO|IRAM|EN|UNE|AASHTO|DIN|BS|JIS|IEC|NF|CSA|GB|ABNT|standard|norma|specification|especificación)\b/iu},
 {aspecto:'evidencia_experimental',tipo:'EVIDENCIA',regex:/\b(?:experimental|experimentally|experimentalmente|measured|measured experimentally|observed|observado|test results|resultados de ensayo|empirical|empírico)\b/iu},
 {aspecto:'evidencia_teorica',tipo:'EVIDENCIA',regex:/\b(?:theoretical|theoretically|teórico|teóricamente|theory predicts|la teoría predice|simulation|simulación|simulated|simulado)\b/iu},
];

function idioma(texto:string):'es'|'en'|'mixto'{
 const t=text.toLowerCase();
 const es=(t.match(/\b(?:el|la|los|las|de|del|que|una|un|para|con|se|como|mide|propiedad|material|muestra|ensayo|resultado|cuando|entre|es|por)\b/g)||[]).length;
 const en=(t.match(/\b(?:the|of|and|is|are|a|an|for|with|by|as|measure|measurement|property|material|sample|test|result|when|between|is)\b/g)||[]).length;
 return es&&en?'mixto':en>es?'en':'es';
}

function bloques(texto:string){
 const out:Array<{texto:string;inicio:number;fin:number}>=[];
 const re=/[^\n]*(?:\n(?!\n)[^\n]*)*/g; let m:RegExpExecArray|null;
 while((m=re.exec(texto))){const t=normalizar(m[0]);if(t.length>=30)out.push({texto:t,inicio:m.index,fin:m.index+m[0].length});}
 if(!out.length&&texto.trim())out.push({texto:normalizar(texto),inicio:0,fin:texto.length});
 return out;
}

function contextoBloque(texto:string,pos:number):{texto:string;inicio:number;fin:number}{
 const bs=bloques(texto); let idx=0;
 for(let i=0;i<bs.length;i++){if(bs[i].inicio<=pos&&pos<=bs[i].fin)idx=i;}
 // Un bloque antes/despues se conserva cuando la frase claramente continua
 // una definicion, procedimiento, lista o explicacion del mismo concepto.
 let ini=idx,fin=idx;
 const actual=bs[idx]?.texto||'';
 const esContinuacion=/(?:^|\s)(?:where|which|that|this|these|it|they|donde|que|el cual|la cual|por lo tanto|therefore|thus|además|ademas|also|in addition|however|sin embargo)\b/i;
 if(idx>0&&esContinuacion.test(actual))ini=idx-1;
 if(idx+1<bs.length&&/(?:defin|means|refers|consists|is |are |es |son |mide|measure|determina|determined|method|método|procedure|procedimiento)/i.test(actual))fin=idx+1;
 const parts=bs.slice(ini,fin+1);
 return {texto:parts.map(x=>x.texto).join(' '),inicio:parts[0].inicio,fin:parts[parts.length-1].fin};
}

function entidadesEn(texto:string){
 const out:Array<{tipo:HallazgoND['tipo'];entidad:string;pos:number;meta:Record<string,unknown>}>=[];
 const seen=new Set<string>();
 const add=(tipo:HallazgoND['tipo'],entidad:string,pos:number,meta:Record<string,unknown>={})=>{
  const e=normalizar(entidad).replace(/^["'“”]+|["'“”]+$/g,'');
  if(e.length<3||e.length>120)return;
  const k=`${tipo}|${e.toLowerCase()}|${pos}`;if(seen.has(k))return;seen.add(k);out.push({tipo,entidad:e,pos,meta});
 };
 for(const p of PROPIEDADES){
  const terminos=[p.nombre_es,p.nombre_en,...(p.sinonimos||[])].filter((x):x is string=>!!x&&x.trim().length>=4);
  for(const termino of new Set(terminos)){
   const re=new RegExp(`(?<![\\p{L}\\p{N}])${escapar(termino)}(?![\\p{L}\\p{N}])`,'giu');let m:RegExpExecArray|null;
   while((m=re.exec(texto)))add('PROPIEDAD',p.nombre_es||m[0],m.index,{diccionario:p.id,termino:m[0]});
  }
 }
 for(const a of ATRIBUTOS){
  for(const termino of new Set([a.nombre_es,a.nombre_en].filter(Boolean) as string[])){
   const re=new RegExp(`(?<![\\p{L}\\p{N}])${escapar(termino)}(?![\\p{L}\\p{N}])`,'giu');let m:RegExpExecArray|null;
   while((m=re.exec(texto)))add('ATRIBUTO',m[0],m.index,{diccionario:a.id});
  }
 }
 RE_MATERIAL.lastIndex=0;let m:RegExpExecArray|null;
 while((m=RE_MATERIAL.exec(texto)))add('MATERIAL',m[0],m.index);
 RE_NORMA.lastIndex=0;while((m=RE_NORMA.exec(texto)))add('NORMA',m[0],m.index);
 const capturar=(re:RegExp,tipo:HallazgoND['tipo])=>{re.lastIndex=0;let z:RegExpExecArray|null;while((z=re.exec(texto)))add(tipo,z[1]||z[0],z.index,{disparador:z[0]});};
 capturar(RE_COMPONENTE,'COMPONENTE');capturar(RE_METODO,'METODO');capturar(RE_INSTRUMENTO,'INSTRUMENTO');
 return out;
}

function crear(h:{neuronId:string;tipo:HallazgoND['tipo'];entidad:string;aspecto:string;dato:string;pagina:number;documento:string;inicio:number;fin:number;confianza:number;relacion?:string;meta?:Record<string,unknown>}):HallazgoND{
 const lang=idioma(h.dato);
 return {neuronId:h.neuronId,tipo:h.tipo,campo:`${h.tipo.toLowerCase()}_${h.aspecto}`,textoOriginal:h.dato,textoNormalizado:h.dato.toLowerCase(),entidadCandidata:h.entidad,entidadPrincipal:h.entidad,aspecto:h.aspecto,datoDocumental:h.dato,relacionEntidad:h.relacion,contexto:h.dato,idioma:lang,confianza:h.confianza,evidencia:{documento:h.documento,pagina:h.pagina,fragmento:h.dato,idioma:lang,tipoDocumento:'desconocido',posicionInicio:h.inicio,posicionFin:h.fin},metadatos:{extractor:'extractorDocumentalExhaustivoND',entidadPrincipal:h.entidad,aspecto:h.aspecto,completo:true,...(h.meta||{})}};
}

function relacionConEntidad(entidad:string,bloque:string):string|undefined{
 const i=bloque.toLowerCase().indexOf(entidad.toLowerCase());
 if(i<0)return undefined;
 const antes=bloque.slice(Math.max(0,i-180),i).toLowerCase();
 const despues=bloque.slice(i+entidad.length,i+entidad.length+240).toLowerCase();
 const patrones=[
  ['depende_de',/depende de|depends on|dependent on/],['afecta',/afecta|affects|influye|influences/],['afectada_por',/afectado por|affected by/],
  ['relacionada_con',/relacionado con|related to|associated with|asociado con/],['comparada_con',/comparado con|compared with|similar to|similar a|different from|diferente de/],
  ['utilizada_en',/utilizado en|utilizada en|used in|used for|se utiliza|se usa/],['determinada_por',/determinada por|determined by|measured by/]
 ];
 for(const [nombre,re] of patrones)if(re.test(antes)||re.test(despues))return nombre;
 return undefined;
}

export function extraerDocumentalExhaustivoND(texto:string,pagina:number,documento:string,neuronId:string):HallazgoND[]{
 const out:HallazgoND[]=[];
 const entidades=entidadesEn(texto);
 const seen=new Set<string>();
 for(const e of entidades){
  const bloque=contextoBloque(texto,e.pos);
  if(bloque.texto.length<30)continue;

  // Cada entidad conserva su bloque documental completo como evidencia base.
  const baseKey=`${e.tipo}|${e.entidad.toLowerCase()}|${e.pos}|bloque`;
  if(!seen.has(baseKey)){
   seen.add(baseKey);
   out.push(crear({neuronId,tipo:'EVIDENCIA',entidad:e.entidad,aspecto:'bloque_documental_completo',dato:bloque.texto,pagina,documento,inicio:bloque.inicio,fin:bloque.fin,confianza:.68,meta:{entidadTipo:e.tipo,entidadMeta:e.meta}}));
  }

  // Una misma explicacion se proyecta a multiples aspectos. Esto permite que
  // la memoria posterior consulte, por ejemplo, pH -> que_mide sin perder el
  // texto original que tambien contiene metodo, condiciones o relaciones.
  for(const a of ASPECTOS){
   if(!a.regex.test(bloque.texto))continue;
   const key=`${e.tipo}|${e.entidad.toLowerCase()}|${a.aspecto}|${bloque.inicio}`;
   if(seen.has(key))continue;seen.add(key);
   out.push(crear({neuronId,tipo:a.tipo,entidad:e.entidad,aspecto:a.aspecto,dato:bloque.texto,pagina,documento,inicio:bloque.inicio,fin:bloque.fin,confianza:a.aspecto==='definicion'||a.aspecto==='que_es'?.9:.78,relacion:relacionConEntidad(e.entidad,bloque.texto),meta:{entidadTipo:e.tipo,entidadMeta:e.meta,fuenteAspectoRegex:a.regex.source}}));
  }

  // Si es una definicion, conservar tambien cualquier bloque consecutivo que
  // comience como continuacion. Nunca cortar el texto a una sola oracion.
  if(e.tipo==='PROPIEDAD'||e.tipo==='MATERIAL'||e.tipo==='COMPONENTE'){
   const def=/\b(?:se define|definid[oa] como|defined as|is defined as|refers to|se refiere a|means|significa|consists of|consiste en|es un|es una|is a|is an)\b/i;
   if(def.test(bloque.texto)){
    const key=`${e.tipo}|${e.entidad.toLowerCase()}|definicion_completa|${bloque.inicio}`;
    if(!seen.has(key)){seen.add(key);out.push(crear({neuronId,tipo:'DEFINICION',entidad:e.entidad,aspecto:'definicion_completa',dato:bloque.texto,pagina,documento,inicio:bloque.inicio,fin:bloque.fin,confianza:.95,relacion:relacionConEntidad(e.entidad,bloque.texto),meta:{entidadTipo:e.tipo,definicionCompleta:true,noResumida:true}}));}
   }
  }
 }

 // Los bloques tecnicos que no quedaron anclados a una entidad conocida siguen
 // siendo evidencia ND: la curacion posterior puede descubrir la entidad.
 for(const b of bloques(texto)){
  if(b.texto.length<120)continue;
  if(!/(?:defin|property|propiedad|material|component|componente|method|m[eé]todo|measurement|medici[oó]n|application|aplicaci[oó]n|composition|composici[oó]n|behavior|comportamiento|condition|condici[oó]n|instrument|instrumento|standard|norma|formula|fórmula|relationship|relaci[oó]n|effect|efecto)/i.test(b.texto))continue;
  const key=`BLOQUE|${b.inicio}|${b.fin}`;if(seen.has(key))continue;seen.add(key);
  const lang=idioma(b.texto);
  out.push({neuronId,tipo:'EVIDENCIA',campo:'bloque_tecnico_no_anclado',textoOriginal:b.texto,textoNormalizado:b.texto.toLowerCase(),contexto:b.texto,idioma:lang,confianza:.45,evidencia:{documento,pagina,fragmento:b.texto,idioma:lang,tipoDocumento:'desconocido',posicionInicio:b.inicio,posicionFin:b.fin},metadatos:{extractor:'extractorDocumentalExhaustivoND',requiereAnclajePosterior:true}});
 }
 return out;
}
