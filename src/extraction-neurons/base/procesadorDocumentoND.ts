import { construirMemoriaTemporal } from '../comprension/construirMemoria';
import { calcularBloques, esBloqueDescartable, BloqueMaterial } from '../comprension/gestorBloques';
import { crearRAMsND, RAMSetND } from '../memoria-nd/ram';
import { HallazgoND } from '../memoria-nd/tipos';
import { extraerNDCompleto } from './extractorNDCompleto';
import { mapearHallazgosND } from '../nd-deterministic/mapearHallazgosND';
export interface PaginaND{pagina:number;texto:string;inicio:number;fin:number}
export interface ResultadoDocumentoND{memoria:ReturnType<typeof construirMemoriaTemporal>;bloques:BloqueMaterial[];hallazgos:HallazgoND[];rams:RAMSetND}
const MATERIAL_RE=/\b(?:cemento|cement|concreto|hormig[oó]n|concrete|acero|steel|madera|wood|aluminio|aluminum|cobre|copper|vidrio|glass|cer[aá]mica|ceramic|pol[ií]mero|polymer|resina|resin|mortero|mortar|arena|sand|fibra|fiber|epoxi|epoxy|ladrillo|brick)\b/giu;
function fusionar(xs:HallazgoND[]){const m=new Map<string,HallazgoND>();for(const h of xs){const k=[h.pagina,h.tipo,h.entidadPrincipal||h.entidadCandidata||'',h.aspecto||'',h.valorTexto||'',h.unidad||'',h.textoNormalizado].join('|').toLowerCase();const old=m.get(k);if(!old)m.set(k,h);else m.set(k,{...old,...h,confianza:Math.max(old.confianza||0,h.confianza||0),contexto:(h.contexto||'').length>(old.contexto||'').length?h.contexto:old.contexto,metadatos:{...(old.metadatos||{}),...(h.metadatos||{})}})}return [...m.values()]}
function ram(r:RAMSetND,h:HallazgoND){switch(h.tipo){case'MATERIAL':r.materials.agregar(h);break;case'COMPONENTE':r.components.agregar(h);break;case'PROPIEDAD':r.properties.agregar(h);break;case'ATRIBUTO':r.attributes.agregar(h);break;case'MAGNITUD':r.magnitudes.agregar(h);break;case'FORMULA':case'SUB_CABLE':r.formulas.agregar(h);break;case'RELACION':r.relations.agregar(h);break;case'METODO':r.methods.agregar(h);break;case'INSTRUMENTO':r.instruments.agregar(h);break;case'NORMA':r.norms.agregar(h);break;case'CONDICION':r.conditions.agregar(h);break;case'APLICACION':r.applications.agregar(h);break;case'COMPORTAMIENTO':r.behavior.agregar(h);break;case'DEFINICION':r.definitions.agregar(h);break;case'EVIDENCIA':r.evidences.agregar(h);break;default:r.unknowns.agregar(h)}}
export function procesarDocumentoND(paginas:PaginaND[],documento:string,driveFileId:string,neuronId:string,deterministas:any[]=[]):ResultadoDocumentoND{
 const texto=paginas.map(p=>p.texto).join('\n\n');const nombres=[...new Set([...texto.matchAll(MATERIAL_RE)].map(m=>m[0]))];
 const materiales=nombres.map(n=>({nombre_es:n,nombre_en:n,sinonimos:[],familia:'documento',subfamilia:'',materialAsociado:null}));
 const memoria=construirMemoriaTemporal(texto,materiales,documento,driveFileId);const bloques=calcularBloques(memoria,texto.length);const validos=bloques.filter(b=>!esBloqueDescartable(b));const hs:HallazgoND[]=[];
 for(const p of paginas){const activos=validos.filter(b=>p.fin>=b.inicio&&p.inicio<=b.fin);if(!activos.length)continue;for(const h of extraerNDCompleto(p.texto,p.pagina,documento,neuronId))hs.push({...h,metadatos:{...(h.metadatos||{}),driveFileId,bloquesND:activos.map(b=>b.id)}})}
 const hallazgos=fusionar([...hs,...mapearHallazgosND(deterministas,documento,neuronId)]);const rams=crearRAMsND(neuronId);for(const h of hallazgos)ram(rams,h);return{memoria,bloques,hallazgos,rams};
}
