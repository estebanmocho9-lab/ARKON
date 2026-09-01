// Definiciones ND ancladas a una entidad, conservando contexto documental muy amplio.
// ND prioriza conservar informacion: la consolidacion posterior decidira que sirve.
import { PROPIEDADES } from '../diccionarios/propiedades';
import { PATRONES_DEFINICION_COMPLETA_ND } from '../diccionarios/patronesDefinicionCompletaND';
import { HallazgoDefinicion } from './extractorDefiniciones';

function idioma(texto:string): 'es'|'en' {
 const t=texto.toLowerCase();
 const es=(t.match(/\b(?:el|la|los|las|de|del|que|una|un|para|con|se|como|mide|medición|propiedad|material)\b/g)||[]).length;
 const en=(t.match(/\b(?:the|of|and|is|are|a|an|for|with|by|as|measure|measurement|property|material)\b/g)||[]).length;
 return en>es?'en':'es';
}
function escapar(s:string){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
function normalizar(s:string){return s.replace(/\s+/g,' ').trim();}
function oraciones(texto:string): Array<{texto:string;inicio:number}> {
 const out:Array<{texto:string;inicio:number}>=[];
 const re=/[^.!?\n]+(?:[.!?]|$)/g; let m:RegExpExecArray|null;
 while((m=re.exec(texto))){const t=normalizar(m[0]);if(t.length>=20)out.push({texto:t,inicio:m.index});}
 return out;
}

// Ventana deliberadamente grande: hasta 10 oraciones antes y 10 despues,
// con tope de 12000 caracteres. Esto evita guardar una definicion aislada.
function contextoAmplio(sents:Array<{texto:string;inicio:number}>,indice:number,maxCaracteres=12000):string {
 const inicio=Math.max(0,indice-10),fin=Math.min(sents.length-1,indice+10);
 const bloque=normalizar(sents.slice(inicio,fin+1).map(x=>x.texto).join(' '));
 if(bloque.length<=maxCaracteres)return bloque;
 let out=sents[indice].texto;
 for(let d=1;d<=10;d++){
  const izq=indice-d>=0?sents[indice-d].texto:'';
  const der=indice+d<sents.length?sents[indice+d].texto:'';
  if(izq&&out.length+izq.length+1<=maxCaracteres)out=izq+' '+out;
  if(der&&out.length+der.length+1<=maxCaracteres)out=out+' '+der;
 }
 return normalizar(out.slice(0,maxCaracteres));
}

export function extraerDefinicionesPropiedadesCompleto(texto:string): HallazgoDefinicion[] {
 const salida:HallazgoDefinicion[]=[];
 const sents=oraciones(texto);
 const vistos=new Set<string>();
 for(const propiedad of PROPIEDADES){
  const terminos=[propiedad.nombre_es,propiedad.nombre_en,...(propiedad.sinonimos||[])]
   .filter((t):t is string=>!!t&&t.trim().length>=4).map(t=>t.trim());
  for(const termino of new Set(terminos)){
   const reTermino=new RegExp(`(?<![\\p{L}\\p{N}])${escapar(termino)}(?![\\p{L}\\p{N}])`,'iu');
   for(let i=0;i<sents.length;i++){
    const s=sents[i];
    if(!reTermino.test(s.texto)) continue;
    for(const patron of PATRONES_DEFINICION_COMPLETA_ND){
     const flags=patron.regex.flags.replace(/g/g,'');
     const rePatron=new RegExp(patron.regex.source,flags);
     if(!rePatron.test(s.texto)) continue;
     const contenido=normalizar(contextoAmplio(sents,i,12000));
     if(contenido.length<40) continue;
     const clave=`${propiedad.id}|${patron.campo}|${s.inicio}|${contenido}`;
     if(vistos.has(clave)) continue;
     vistos.add(clave);
     salida.push({nombre_propiedad:propiedad.id,campo:patron.campo,contenido,idioma:idioma(contenido)});
    }
   }
  }
 }
 return salida;
}
