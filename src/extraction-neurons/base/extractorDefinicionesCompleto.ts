// Definiciones ND estrictamente ancladas a la misma oración que la entidad.
// No se permite asociar una propiedad con un fragmento genérico encontrado a
// cientos de caracteres de distancia.
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

export function extraerDefinicionesPropiedadesCompleto(texto:string): HallazgoDefinicion[] {
 const salida:HallazgoDefinicion[]=[];
 const sents=oraciones(texto);
 const vistos=new Set<string>();
 for(const propiedad of PROPIEDADES){
  const terminos=[propiedad.nombre_es,propiedad.nombre_en,...(propiedad.sinonimos||[])]
   .filter((t):t is string=>!!t&&t.trim().length>=4).map(t=>t.trim());
  for(const termino of new Set(terminos)){
   const reTermino=new RegExp(`(?<![\\p{L}\\p{N}])${escapar(termino)}(?![\\p{L}\\p{N}])`,'iu');
   for(const s of sents){
    if(!reTermino.test(s.texto)) continue;
    for(const patron of PATRONES_DEFINICION_COMPLETA_ND){
     const flags=patron.regex.flags.replace(/g/g,'');
     const rePatron=new RegExp(patron.regex.source,flags);
     const pm=rePatron.exec(s.texto);
     if(!pm) continue;
     const contenido=normalizar(pm[0]);
     if(contenido.length<20) continue;
     const clave=`${propiedad.id}|${patron.campo}|${s.inicio}|${contenido}`;
     if(vistos.has(clave)) continue;
     vistos.add(clave);
     salida.push({nombre_propiedad:propiedad.id,campo:patron.campo,contenido:contenido.slice(0,1200),idioma:idioma(contenido)});
    }
   }
  }
 }
 return salida;
}
