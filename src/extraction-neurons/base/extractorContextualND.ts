import { PROPIEDADES } from '../diccionarios/propiedades';
import { HallazgoND } from '../memoria-nd/tipos';

// ND conserva contexto documental amplio. La consolidacion posterior decide que
// informacion sirve; aqui se prioriza no perder datos asociados a la entidad.
const M=/\b(?:cemento(?:\s+\w+){0,6}|pasta de cemento|cement paste|cal(?:\s+\w+){0,5}|yeso|hormig[oó]n|concreto|mortero|mortar|arena|sand|arcilla|clay|vidrio|glass|fibra de vidrio|glass fiber|acero(?:\s+\w+){0,5}|steel(?:\s+\w+){0,5}|aluminio|aluminum|cobre|copper|hierro|iron|madera|wood|pl[aá]stico|plastic|resina|resin|pol[ií]mero|polymer|epoxi|epoxy|cer[aá]mica|ceramic|ladrillo|brick|[aá]rido(?:\s+\w+){0,3}|agregado(?:\s+\w+){0,3}|aggregate(?:\s+\w+){0,3}|composite|compuesto(?:\s+\w+){0,5})\b/giu;
const V=/[-+]?\d+(?:[.,]\d+)?\s*(?:%|ppm|ppb|°C|K|MPa|GPa|kPa|Pa|N|kN|kg|g|mg|mm|cm|m|m²|m2|m³|m3|kg\/m3|kg\/m²|g\/cm3|W\/mK|W\/m·K|J\/kg|Hz|s|min|h)\b/giu;
const P:Array<[HallazgoND['tipo'],string,string,RegExp]>= [
 ['COMPONENTE','componente_contextual','componente',/\b(?:componente|component|fase|phase|constituyente|constituent|aditivo|additive|agregado|aggregate|matriz|matrix|ligante|binder)\b/giu],
 ['METODO','metodo_contextual','metodo',/\b(?:m[eé]todo|method|procedimiento|procedure|ensayo|test|medici[oó]n|measurement|determinaci[oó]n|determination|t[eé]cnica|technique|protocolo|protocol|caracterizaci[oó]n|characterization)\b/giu],
 ['INSTRUMENTO','instrumento_contextual','instrumento',/\b(?:instrumento|instrument|equipo|equipment|aparato|apparatus|m[aá]quina|machine|microscopio|microscope|balanza|balance|prensa|press|term[oó]metro|thermometer|sensor|sonda|probe|espectr[oó]metro|spectrometer|extens[oó]metro|extensometer|calibrador|caliper)\b/giu],
 ['APLICACION','aplicacion_contextual','aplicacion',/\b(?:aplicaci[oó]n|application|se utiliza|se usa|utilizado|utilizada|used for|used in|adecuado para|suitable for)\b/giu],
 ['COMPORTAMIENTO','comportamiento_contextual','comportamiento',/\b(?:comportamiento|behavior|behaviour|efecto|effect|consecuencia|resistencia|rigidez|deformaci[oó]n|deformation|fractura|fracture|porosidad|porosity|durabilidad|durability|degradaci[oó]n|degradation|corrosi[oó]n|corrosion|permeabilidad|permeability|fisuraci[oó]n|cracking|fatiga|fatigue)\b/giu],
 ['CONDICION','condicion_contextual','condicion',/\b(?:temperatura|temperature|humedad|humidity|presi[oó]n|pressure|tiempo|time|edad|age|pH|atm[oó]sfera|atmosphere|curado|curing|fraguado|setting|concentraci[oó]n|concentration|saturado|saturated|seco|dry|h[uú]medo|wet|velocidad de carga|loading rate)\b/giu],
 ['RELACION','relacion_contextual','relacion',/\b(?:aumenta|incrementa|reduce|disminuye|depende de|influye en|afecta|relacionado con|correlaciona|proporcional|increase|decrease|depends on|influences|affects|associated with|proportional to|correlates with)\b/giu],
 ['EVIDENCIA','composicion_contextual','composicion',/\b(?:composici[oó]n|composition|formado por|composed of|consists of|contains|contiene|constituido por|made of|porcentaje|percentage|proporci[oó]n|proportion|relaci[oó]n agua\/cemento|water\/cement ratio)\b/giu]
];

const n=(s:string)=>s.replace(/\s+/g,' ').trim();
const ss=(t:string)=>{const out:Array<{t:string;i:number}>=[];const re=/[^.!?\n]+(?:[.!?]|$)/g;let m:RegExpExecArray|null;while((m=re.exec(t))){const z=n(m[0]);if(z.length>=20)out.push({t:z,i:m.index});}return out;};

function idioma(texto:string): 'es'|'en'|'mixto' {
 const t=texto.toLowerCase();
 const es=(t.match(/\b(?:el|la|los|las|de|del|que|una|un|para|con|se|como|muestra|ensayo|medición|medicion|resultado|cuando|entre|propiedad|material)\b/g)||[]).length;
 const en=(t.match(/\b(?:the|of|and|is|are|a|an|for|with|by|as|sample|test|measurement|result|when|between|property|material)\b/g)||[]).length;
 if(es&&en)return 'mixto'; return en>es?'en':'es';
}

function entidadPrincipal(texto:string,inicio:number,radio=1800):string|null {
 const ini=Math.max(0,inicio-radio),fin=Math.min(texto.length,inicio+radio),zona=texto.slice(ini,fin);
 M.lastIndex=0;let mejor:string|null=null,distancia=Infinity,m:RegExpExecArray|null;
 while((m=M.exec(zona))){const d=Math.abs((ini+m.index)-inicio);if(d<distancia){distancia=d;mejor=n(m[0]);}}
 return mejor;
}

function indiceOracion(oraciones:Array<{t:string;i:number}>,pos:number):number {let idx=0;for(let i=0;i<oraciones.length;i++){if(oraciones[i].i<=pos)idx=i;else break;}return idx;}

// Contexto documental deliberadamente grande: hasta 8 oraciones antes y 8 despues,
// con tope alto para conservar definicion, composicion, medicion, resultados,
// condiciones, relaciones y aplicaciones que esten cerca del disparador.
function contextoAmplio(texto:string,pos:number,max=12000):string {
 const oraciones=ss(texto);if(!oraciones.length)return n(texto.slice(Math.max(0,pos-4000),Math.min(texto.length,pos+8000)));
 const idx=indiceOracion(oraciones,pos),ini=Math.max(0,idx-8),fin=Math.min(oraciones.length-1,idx+8);
 const bloque=n(oraciones.slice(ini,fin+1).map(x=>x.t).join(' '));
 if(bloque.length<=max)return bloque;
 let out=oraciones[idx].t;
 for(let d=1;d<=8;d++){
  const izq=idx-d>=0?oraciones[idx-d].t:'';const der=idx+d<oraciones.length?oraciones[idx+d].t:'';
  if(izq&&out.length+izq.length+1<=max)out=izq+' '+out;
  if(der&&out.length+der.length+1<=max)out=out+' '+der;
 }
 return n(out.slice(0,max));
}

function add(a:HallazgoND[],x:any){
 const ent=x.ent?n(x.ent):null;if(!ent||/^entidad no determinada$/i.test(ent))return;
 const dato=n(x.dato);
 a.push({neuronId:x.id,tipo:x.tipo,campo:x.campo,entidadCandidata:ent,entidadPrincipal:ent,aspecto:x.aspecto,datoDocumental:dato,textoOriginal:dato,textoNormalizado:dato.toLowerCase(),valor:x.valor,valorTexto:x.valorTexto,unidad:x.unidad,contexto:dato,idioma:idioma(dato),confianza:x.conf,evidencia:{documento:x.doc,pagina:x.p,fragmento:dato,idioma:idioma(dato),tipoDocumento:'desconocido',posicionInicio:x.i,posicionFin:x.j},metadatos:{extractor:'extractorContextualND',entidadPrincipal:ent,aspecto:x.aspecto,datoDocumental:dato,disparador:x.texto}});
}

export function extraerContextualND(texto:string,pagina:number,documento:string,neuronId:string):HallazgoND[]{
 const a:HallazgoND[]=[],oraciones=ss(texto);let m:RegExpExecArray|null;
 M.lastIndex=0;
 while((m=M.exec(texto))){const e=n(m[0]),dato=contextoAmplio(texto,m.index,12000);add(a,{id:neuronId,tipo:'MATERIAL',campo:'entidad_material',aspecto:'identidad_y_datos_asociados',ent:e,dato,texto:e,p:pagina,doc:documento,i:m.index,j:m.index+m[0].length,conf:.88});}

 const EXCLUIR_PROPIEDAD=/^(óxido de silicio|óxido de magnesio|silicon dioxide|magnesium oxide|al2o3|cao|sio2)$/i;
 for(const p of PROPIEDADES){
  for(const q of new Set([p.nombre_es,p.nombre_en,...(p.sinonimos||[])].filter(Boolean) as string[])){
   if(q.trim().length<4||EXCLUIR_PROPIEDAD.test(q.trim()))continue;
   const r=new RegExp('(?<![\\p{L}\\p{N}])'+q.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')+'(?![\\p{L}\\p{N}])','giu');
   while((m=r.exec(texto))){
    const frase=contextoAmplio(texto,m.index,12000);
    const informativa=/(?:mide|medir|measurement|measures?|defined as|se define|definida como|corresponde a|representa|indica|depends|depende|influye|afecta|increases?|decreases?|aumenta|disminuye|valor|value|unit|unidad|method|m[eé]todo|test|ensayo|determina|determination|application|aplicaci[oó]n|used|utiliza|propiedad|property|resistencia|resistance|densidad|density|porosity|porosidad|conductividad|conductivity|temperatura|temperature|pH)/iu.test(frase);
    if(!informativa)continue;
    add(a,{id:neuronId,tipo:'PROPIEDAD',campo:'propiedad_con_datos',aspecto:'propiedad',ent:p.nombre_es||m[0],dato:frase,texto:m[0],p:pagina,doc:documento,i:m.index,j:m.index+m[0].length,conf:.84});
   }
  }
 }

 V.lastIndex=0;
 while((m=V.exec(texto))){
  const raw=n(m[0]),z=raw.match(/^([-+]?\d+(?:[.,]\d+)?)\s*(.*)$/),dato=contextoAmplio(texto,m.index,12000),ent=entidadPrincipal(texto,m.index,1800);
  if(!ent)continue;
  add(a,{id:neuronId,tipo:'MAGNITUD',campo:'dato_cuantitativo_contextual',aspecto:'valor_y_unidad',ent,dato,texto:raw,p:pagina,doc:documento,i:m.index,j:m.index+m[0].length,conf:.9,valor:Number((z?.[1]||'').replace(',','.')),valorTexto:z?.[1]||raw,unidad:z?.[2]});
 }

 for(const [tipo,campo,aspecto,r] of P){
  r.lastIndex=0;
  while((m=r.exec(texto))){const idx=m.index,ent=entidadPrincipal(texto,idx,1800);if(!ent)continue;const dato=contextoAmplio(texto,idx,12000);add(a,{id:neuronId,tipo,campo,aspecto,ent,dato,texto:m[0],p:pagina,doc:documento,i:idx,j:idx+m[0].length,conf:.74});}
 }
 return a;
}
