import { extraerDefinicionesPropiedadesCompleto } from './extractorDefinicionesCompleto';
import { extraerNDUniversal } from './extractorNDUniversal';
import { extraerMetadatosCientificosND } from './extractorMetadatosCientificosND';
import { extraerDatosCientificosND } from './extractorDatosCientificosND';
import { extraerContextualND } from './extractorContextualND';
import { extraerCandidatosSemanticosND } from './extractorSemanticoND';
import { HallazgoND } from '../memoria-nd/tipos';

export function extraerNDCompleto(texto:string,pagina:number,documento:string,neuronId:string):HallazgoND[]{
  const base=extraerNDUniversal(texto,pagina,documento,neuronId)
    .filter(h=>!['DEFINICION','MATERIAL','PROPIEDAD','ATRIBUTO'].includes(h.tipo));
  const defs=extraerDefinicionesPropiedadesCompleto(texto).map(h=>({
    neuronId,tipo:'DEFINICION' as const,campo:h.campo,
    textoOriginal:h.contenido.trim(),textoNormalizado:h.contenido.trim().toLowerCase(),
    entidadCandidata:h.nombre_propiedad,entidadPrincipal:h.nombre_propiedad,aspecto:'definicion',
    datoDocumental:h.contenido.trim(),contexto:h.contenido.trim(),idioma:h.idioma,confianza:.78,
    evidencia:{documento,pagina,fragmento:h.contenido.trim(),idioma:h.idioma,tipoDocumento:'desconocido' as const},
    metadatos:{extractor:'extractorDefinicionesCompleto',entidadPrincipal:h.nombre_propiedad,aspecto:'definicion'}
  } satisfies HallazgoND));
  return dedup([
    ...base,
    ...defs,
    ...extraerContextualND(texto,pagina,documento,neuronId),
    ...extraerMetadatosCientificosND(texto,pagina,documento,neuronId),
    ...extraerDatosCientificosND(texto,pagina,documento,neuronId),
    ...extraerCandidatosSemanticosND(texto,pagina,documento,neuronId),
  ]);
}
function dedup(h:HallazgoND[]){
 const s=new Set<string>();
 return h.filter(x=>{const e=x.evidencia;const k=[x.neuronId,x.tipo,x.campo||'',e.documento,e.pagina,e.posicionInicio??'',e.posicionFin??'',x.entidadPrincipal||x.entidadCandidata||'',x.aspecto||'',x.datoDocumental||x.textoNormalizado].join('|');if(s.has(k))return false;s.add(k);return true;});
}
