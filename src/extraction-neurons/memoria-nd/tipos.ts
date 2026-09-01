// Tipos exclusivos de ND. No son memoria de NE.
export type TipoCandidatoND =
  | 'MATERIAL' | 'COMPONENTE' | 'ATRIBUTO' | 'PROPIEDAD' | 'CABLE'
  | 'MAGNITUD' | 'FORMULA' | 'SUB_CABLE' | 'RELACION' | 'METODO'
  | 'INSTRUMENTO' | 'NORMA' | 'CONDICION' | 'APLICACION' | 'COMPORTAMIENTO'
  | 'DEFINICION' | 'EVIDENCIA' | 'DESCONOCIDO';
export type TipoDocumentoND = 'libro'|'manual'|'ficha_tecnica'|'norma'|'articulo'|'tesis'|'informe'|'catalogo'|'patente'|'presentacion'|'documento_tecnico'|'otro'|'desconocido';
export interface EvidenciaND { documento:string; pagina:number; fragmento:string; idioma:'es'|'en'|'mixto'; tipoDocumento:TipoDocumentoND; posicionInicio?:number; posicionFin?:number; seccion?:string; tabla?:string; figura?:string; }
export interface HallazgoND {
  id?:string; neuronId:string; tipo:TipoCandidatoND; campo?:string;
  textoOriginal:string; textoNormalizado:string; entidadCandidata?:string;
  // La ND guarda explícitamente entidad -> aspecto -> dato documental.
  entidadPrincipal?:string; aspecto?:string; datoDocumental?:string; relacionEntidad?:string;
  valor?:number; valorTexto?:string; unidad?:string; simbolo?:string;
  contexto:string; idioma:'es'|'en'|'mixto'; confianza:number;
  evidencia:EvidenciaND; metadatos?:Record<string,unknown>;
}
export interface RAMND<T> { readonly nombre:string; agregar(hallazgo:T):void; consultar():T[]; cantidad():number; entregar():T[]; limpiar():void; }
