import { extraerDocumentalExhaustivoNDV3 } from './extractorDocumentalExhaustivoNDV3';
import { extraerDatosCientificosND } from './extractorDatosCientificosND';
import { normalizarHallazgosND } from './normalizadorHallazgosND';
import { HallazgoND } from '../memoria-nd/tipos';

/**
 * ND completo: identifica entidades concretas y conserva la información
 * documental asociada por aspecto. La normalización final corrige conflictos
 * entre categorías (por ejemplo diámetro/espesor como MAGNITUD y no como
 * PROPIEDAD) y agrega entidades materiales/atributos concretos que hayan
 * quedado fuera de los diccionarios especializados.
 */
export function extraerNDCompleto(texto:string,pagina:number,documento:string,neuronId:string):HallazgoND[]{
 const exhaustivo=extraerDocumentalExhaustivoNDV3(texto,pagina,documento,neuronId);
 const cuantitativo=extraerDatosCientificosND(texto,pagina,documento,neuronId);
 const normalizados=normalizarHallazgosND([...exhaustivo,...cuantitativo],texto,pagina,documento,neuronId);
 return dedup(normalizados);
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
