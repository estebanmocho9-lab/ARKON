import { extraerDocumentalExhaustivoNDV3 } from './extractorDocumentalExhaustivoNDV3';
import { extraerDatosCientificosND } from './extractorDatosCientificosND';
import { HallazgoND } from '../memoria-nd/tipos';

/**
 * ND completo: primero identifica entidades concretas y luego conserva toda la
 * informacion documental asociada por aspecto. No resume definiciones.
 * Los datos numericos y formulas se conservan adicionalmente como evidencia
 * cuantitativa cruda para que no se pierdan aunque aun no esten anclados.
 */
export function extraerNDCompleto(texto:string,pagina:number,documento:string,neuronId:string):HallazgoND[]{
 const exhaustivo=extraerDocumentalExhaustivoNDV3(texto,pagina,documento,neuronId);
 const cuantitativo=extraerDatosCientificosND(texto,pagina,documento,neuronId);
 return dedup([...exhaustivo,...cuantitativo]);
}

function dedup(hallazgos:HallazgoND[]):HallazgoND[]{
 const seen=new Set<string>();
 return hallazgos.filter(h=>{
  const e=h.evidencia;
  const key=[h.neuronId,h.tipo,h.campo||'',e.documento,e.pagina,e.posicionInicio??'',e.posicionFin??'',h.entidadPrincipal||h.entidadCandidata||'',h.aspecto||'',h.datoDocumental||h.textoNormalizado].join('|');
  if(seen.has(key))return false;
  seen.add(key);return true;
 });
}
