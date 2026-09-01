import { extraerDefinicionesPropiedadesCompleto } from './extractorDefinicionesCompleto';
import { extraerNDUniversal } from './extractorNDUniversal';
import { extraerMetadatosCientificosND } from './extractorMetadatosCientificosND';
import { extraerDatosCientificosND } from './extractorDatosCientificosND';
import { extraerContextualND } from './extractorContextualND';
import { HallazgoND } from '../memoria-nd/tipos';

// ND documental: conserva evidencia amplia, pero MATERIAL/PROPIEDAD/ATRIBUTO
// ya no se aceptan como simples menciones. Se reemplazan por registros que
// contienen entidad concreta + aspecto + oración/dato documental.
export function extraerNDCompleto(texto:string,pagina:number,documento:string,neuronId:string):HallazgoND[]{
  const base=extraerNDUniversal(texto,pagina,documento,neuronId)
    .filter(h=>!['DEFINICION','MATERIAL','PROPIEDAD','ATRIBUTO'].includes(h.tipo));
  const defs=extraerDefinicionesPropiedadesCompleto(texto).map(h=>({
    neuronId,tipo:'DEFINICION' as const,campo:h.campo,textoOriginal:h.contenido.trim(),
    textoNormalizado:h.contenido.trim().toLowerCase(),entidadCandidata:h.nombre_propiedad,
    entidadPrincipal:h.nombre_propiedad,aspecto:'definicion',datoDocumental:h.contenido.trim(),
    contexto:h.contenido.trim(),idioma:h.idioma,confianza:.65,
    evidencia:{documento,pagina,fragmento:h.contenido.trim(),idioma:h.idioma,tipoDocumento:'desconocido' as const},
    metadatos:{extractor:'extractorDefinicionesCompleto',entidadPrincipal:h.nombre_propiedad,aspecto:'definicion',datoDocumental:h.contenido.trim()}
  } satisfies HallazgoND));
  const contextual=extraerContextualND(texto,pagina,documento,neuronId);
  const metadatos=extraerMetadatosCientificosND(texto,pagina,documento,neuronId);
  const datos=extraerDatosCientificosND(texto,pagina,documento,neuronId);
  return dedup([...base,...defs,...contextual,...metadatos,...datos]);
}
function dedup(h:HallazgoND[]):HallazgoND[]{const seen=new Set<string>();return h.filter(x=>{const k=[x.neuronId,x.tipo,x.campo||'',x.evidencia.documento,x.evidencia.pagina,x.evidencia.posicionInicio??'',x.entidadPrincipal||x.entidadCandidata||'',x.aspecto||'',x.datoDocumental||x.textoNormalizado].join('|');if(seen.has(k))return false;seen.add(k);return true})}
