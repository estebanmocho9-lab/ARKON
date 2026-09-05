import { HallazgoND, TipoDocumentoND } from '../memoria-nd/tipos';

const TIPOS_DOCUMENTO: TipoDocumentoND[] = ['libro','manual','ficha_tecnica','norma','articulo','tesis','informe','catalogo','patente','presentacion','documento_tecnico','otro','desconocido'];

function tipoDocumentoND(valor: unknown): TipoDocumentoND {
  const v = String(valor || '').trim() as TipoDocumentoND;
  return TIPOS_DOCUMENTO.includes(v) ? v : 'documento_tecnico';
}

export function mapearHallazgosND(findings:any[],documento:string,neuronId:string):HallazgoND[]{return findings.map((f:any)=>({neuronId,tipo:(f.kind==='ENTIDAD'?'EVIDENCIA':(f.kind||'DESCONOCIDO')) as HallazgoND['tipo'],campo:f.field,textoOriginal:String(f.originalText||f.documentaryData||''),textoNormalizado:String(f.normalizedText||f.originalText||'').toLowerCase(),entidadCandidata:f.entity,entidadPrincipal:f.entity,aspecto:f.aspect,datoDocumental:f.documentaryData,valor:typeof f.value==='number'?f.value:undefined,valorTexto:f.valueText,unidad:f.unit,simbolo:f.symbol,contexto:f.context||f.originalText||'',idioma:'mixto',confianza:Number(f.confidence||.5),evidencia:{documento,pagina:Number(f.page||0),fragmento:String(f.evidence?.fragment||f.originalText||''),idioma:'mixto',tipoDocumento:tipoDocumentoND(f.documentType||f.tipoDocumento||f.metadata?.tipoDocumento),posicionInicio:Number.isFinite(f.evidence?.start)?f.evidence.start:undefined,posicionFin:Number.isFinite(f.evidence?.end)?f.evidence.end:undefined,seccion:f.section||undefined},metadatos:{...(f.metadata||{}),extractor:'deterministic_spatial'}}))}
