import { PROPIEDADES } from '../diccionarios/propiedades';
import { HallazgoND } from '../memoria-nd/tipos';

// Entidades materiales concretas. No se consideran entidades palabras como
// "material", "mezcla" o "componente": son categorías/aspectos.
const M=/\b(?:cemento(?:\s+\w+){0,3}|cal|yeso|hormig[oó]n|concreto|arena|arcilla|vidrio|fibra de vidrio|acero|aluminio|cobre|hierro|madera|pl[aá]stico|resina|pol[ií]mero|epoxi|cer[aá]mica|gypsum|concrete|mortar|sand|clay|glass|steel|aluminum|copper|iron|wood|plastic)\b/giu;
const V=/[-+]?\d+(?:[.,]\d+)?\s*(?:%|ppm|ppb|°C|K|MPa|GPa|kPa|Pa|N|kg|g|mm|cm|m|m²|m3|kg\/m3|g\/cm3|W\/mK|J\/kg|Hz|s|min|h)\b/giu;
const P:Array<[HallazgoND['tipo'],string,string,RegExp]>= [
 ['COMPONENTE','componente_contextual','componente',/\b(?:componente|component|fase|phase|constituyente|constituent|aditivo|additive|agregado|aggregate|matriz|matrix|ligante|binder)\b/giu],
 ['METODO','metodo_contextual','metodo',/\b(?:m[eé]todo|method|procedimiento|procedure|ensayo|test|medici[oó]n|measurement|determinaci[oó]n|determination|t[eé]cnica|technique|protocolo|protocol)\b/giu],
 ['INSTRUMENTO','instrumento_contextual','instrumento',/\b(?:instrumento|instrument|equipo|equipment|aparato|apparatus|m[aá]quina|machine|microscopio|microscope|balanza|balance|prensa|press|term[oó]metro|thermometer|sensor|sonda|probe)\b/giu],
 ['APLICACION','aplicacion_contextual','aplicacion',/\b(?:aplicaci[oó]n|application|se utiliza|se usa|utilizado|used for|used in)\b/giu],
 ['COMPORTAMIENTO','comportamiento_contextual','comportamiento',/\b(?:comportamiento|behavior|behaviour|efecto|effect|consecuencia|resistencia|rigidez|deformaci[oó]n|deformation|fractura|fracture|porosidad|porosity|durabilidad|durability|degradaci[oó]n|degradation|corrosi[oó]n|corrosion)\b/giu],
 ['CONDICION','condicion_contextual','condicion',/\b(?:temperatura|temperature|humedad|humidity|presi[oó]n|pressure|tiempo|time|edad|age|pH|atm[oó]sfera|atmosphere|curado|curing|fraguado|setting|concentraci[oó]n|concentration)\b/giu],
 ['RELACION','relacion_contextual','relacion',/\b(?:aumenta|incrementa|reduce|disminuye|depende de|influye en|afecta|relacionado con|correlaciona|proporcional|increase|decrease|depends on|influences|affects|associated with|proportional to)\b/giu],
 ['EVIDENCIA','composicion_contextual','composicion',/\b(?:composici[oó]n|composition|formado por|composed of|consists of|contains|contiene|constituido por|made of|porcentaje|percentage|proporci[oó]n|proportion)\b/giu]
];

const n=(s:string)=>s.replace(/\s+/g,' ').trim();
const ss=(t:string)=>t.split(/(?<=[.!?])\s+|\n+/).map(n).filter(x=>x.length>=20);

function idioma(texto:string): 'es'|'en'|'mixto' {
 const t=texto.toLowerCase();
 const es=(t.match(/\b(?:el|la|los|las|de|del|que|una|un|para|con|se|como|muestra|ensayo|medición|medicion|resultado|cuando|entre)\b/g)||[]).length;
 const en=(t.match(/\b(?:the|of|and|is|are|a|an|for|with|by|as|sample|test|measurement|result|when|between)\b/g)||[]).length;
 if(es&&en)return 'mixto'; return en>es?'en':'es';
}

function entidadesCercanas(texto:string, inicio:number, radio=900): string[] {
 const ini=Math.max(0,inicio-radio), fin=Math.min(texto.length,inicio+radio);
 const zona=texto.slice(ini,fin);
 M.lastIndex=0;
 const out:string[]=[]; let m:RegExpExecArray|null;
 while((m=M.exec(zona))){const e=n(m[0]);if(!out.some(x=>x.toLowerCase()===e.toLowerCase()))out.push(e);}
 return out;
}

function entidadPrincipal(texto:string, inicio:number): string|null {
 const zonaIni=Math.max(0,inicio-450), zonaFin=Math.min(texto.length,inicio+450);
 const zona=texto.slice(zonaIni,zonaFin);
 M.lastIndex=0; let mejor:string|null=null, distancia=Infinity, m:RegExpExecArray|null;
 while((m=M.exec(zona))){
   const d=Math.abs((zonaIni+m.index)-inicio);
   if(d<distancia){distancia=d;mejor=n(m[0]);}
 }
 return mejor;
}

function add(a:HallazgoND[],x:any){
 const ent=x.ent ? n(x.ent) : null;
 if(!ent || /^entidad no determinada$/i.test(ent)) return;
 a.push({neuronId:x.id,tipo:x.tipo,campo:x.campo,entidadCandidata:ent,entidadPrincipal:ent,aspecto:x.aspecto,datoDocumental:x.dato,textoOriginal:x.texto,textoNormalizado:x.texto.toLowerCase(),valor:x.valor,valorTexto:x.valorTexto,unidad:x.unidad,contexto:x.dato,idioma:idioma(x.dato),confianza:x.conf,evidencia:{documento:x.doc,pagina:x.p,fragmento:x.dato,idioma:idioma(x.dato),tipoDocumento:'desconocido',posicionInicio:x.i,posicionFin:x.j},metadatos:{extractor:'extractorContextualND',entidadPrincipal:ent,aspecto:x.aspecto,datoDocumental:x.dato}});
}

export function extraerContextualND(texto:string,pagina:number,documento:string,neuronId:string):HallazgoND[]{
 const a:HallazgoND[]=[],sents=ss(texto); let m:RegExpExecArray|null;

 // 1) Entidades materiales concretas: identidad + oración donde se describen.
 M.lastIndex=0;
 while((m=M.exec(texto))){
   const e=n(m[0]);
   const s=sents.find(x=>x.toLowerCase().includes(e.toLowerCase()))||texto.slice(Math.max(0,m.index-300),m.index+900);
   add(a,{id:neuronId,tipo:'MATERIAL',campo:'entidad_material',aspecto:'identidad_y_datos_asociados',ent:e,dato:n(s),texto:e,p:pagina,doc:documento,i:m.index,j:m.index+m[0].length,conf:.88});
 }

 // 2) Propiedades concretas del diccionario, pero solo si la mención tiene
 // evidencia contextual suficiente. Se evita convertir sustancias/químicos
 // en "propiedades" por nombre y se ignoran términos ambiguos muy cortos.
 const EXCLUIR_PROPIEDAD=/^(óxido de silicio|óxido de magnesio|silicon dioxide|magnesium oxide|al2o3|cao|sio2)$/i;
 for(const p of PROPIEDADES){
  for(const q of new Set([p.nombre_es,p.nombre_en,...(p.sinonimos||[])].filter(Boolean) as string[])){
   if(q.trim().length<4 || EXCLUIR_PROPIEDAD.test(q.trim())) continue;
   const r=new RegExp('(?<![\\p{L}\\p{N}])'+q.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')+'(?![\\p{L}\\p{N}])','giu');
   while((m=r.exec(texto))){
    const s=sents.find(x=>x.toLowerCase().includes(m![0].toLowerCase()));
    // Una mención aislada de un término no constituye un dossier. Exigimos
    // una frase que aporte definición/medición/valor/uso/relación o condición.
    const frase=s||texto.slice(Math.max(0,m.index-300),m.index+700);
    const informativa=/(?:mide|medir|measurement|measures?|defined as|se define|definida como|corresponde a|representa|indica|depends|depende|influye|afecta|increases?|decreases?|aumenta|disminuye|valor|value|unit|unidad|method|m[eé]todo|test|ensayo|determina|determination|application|aplicaci[oó]n|used|utiliza|propiedad|property|resistencia|resistance|densidad|density|porosity|porosidad|conductividad|conductivity|temperatura|temperature|pH)/iu.test(frase);
    if(!informativa) continue;
    add(a,{id:neuronId,tipo:'PROPIEDAD',campo:'propiedad_con_datos',aspecto:'propiedad',ent:p.nombre_es||m[0],dato:n(frase),texto:m[0],p:pagina,doc:documento,i:m.index,j:m.index+m[0].length,conf:.84});
   }
  }
 }

 // 3) Magnitudes: se asocian al material más cercano solo si existe uno.
 V.lastIndex=0;
 while((m=V.exec(texto))){
  const raw=n(m[0]),z=raw.match(/^([-+]?\d+(?:[.,]\d+)?)\s*(.*)$/),s=sents.find(x=>x.includes(m![0]))||texto.slice(Math.max(0,m.index-300),m.index+900),ent=entidadPrincipal(texto,m.index);
  if(!ent) continue;
  add(a,{id:neuronId,tipo:'MAGNITUD',campo:'dato_cuantitativo_contextual',aspecto:'valor_y_unidad',ent,dato:n(s),texto:raw,p:pagina,doc:documento,i:m.index,j:m.index+m[0].length,conf:.9,valor:Number((z?.[1]||'').replace(',','.')),valorTexto:z?.[1]||raw,unidad:z?.[2]});
 }

 // 4) Aspectos documentales (método, instrumento, aplicación, etc.) se
 // convierten en datos del dossier únicamente cuando hay una entidad concreta
 // en la misma zona. Nunca se crea "entidad no determinada".
 for(const [tipo,campo,aspecto,r] of P) for(const s of sents){
  r.lastIndex=0;
  if(!r.test(s)) continue;
  const idx=texto.indexOf(s); if(idx<0) continue;
  const ent=entidadPrincipal(texto,idx+s.length/2);
  if(!ent) continue;
  add(a,{id:neuronId,tipo,campo,aspecto,ent,dato:s,texto:s,p:pagina,doc:documento,i:idx,j:idx+s.length,conf:.74});
 }
 return a;
}
