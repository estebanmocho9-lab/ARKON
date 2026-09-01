// ============================================================
// Neurona ND universal V2.
// Flujo exclusivo ND: Drive -> PDF -> extractor ND -> Turso.
// No importa NE ni Supabase.
// ============================================================
import * as fs from 'fs';
import * as path from 'path';
import { resolverSubcarpetaPorNombre, listarPDFs, descargarArchivo, extraerIdCarpeta } from '../drive/driveReader';
import { procesarPaginasIncremental, detectarCapitulo } from '../pdf/pdfParser';
import { extraerNDCompleto } from './extractorNDCompleto';
import { registrarDocumentoND, actualizarPaginasTotalND, guardarPaginaND, finalizarDocumentoND } from '../../turso/guardarHallazgosND';
import { turso } from '../../turso/tursoClient';

const CARPETA_CHECKPOINTS=path.join(process.cwd(),'checkpoints');
const TABLAS_ND=['nd_datos_entidad','nd_entidades_documentales','nd_hallazgos_raw','nd_paginas','nd_materiales','nd_componentes','nd_propiedades','nd_magnitudes','nd_atributos','nd_relaciones','nd_condiciones','nd_metodos','nd_instrumentos','nd_aplicaciones','nd_comportamientos','nd_normas','nd_definiciones','nd_evidencias','nd_formulas','nd_documentos'];
interface CheckpointND{documentosCompletos:string[];documentoEnProgreso?:{driveFileId:string;ultimaPaginaCompletada:number}}

export abstract class NeuronNDBaseV2{
 abstract readonly neuronId:string;
 abstract readonly numeroCarpeta:string;
 protected obtenerCarpetaMadreId(){const id=process.env.CARPETA_MADRE_DRIVE_ID;if(!id)throw new Error('Falta CARPETA_MADRE_DRIVE_ID en el .env');return extraerIdCarpeta(id)}
 private rutaCheckpoint(){if(!fs.existsSync(CARPETA_CHECKPOINTS))fs.mkdirSync(CARPETA_CHECKPOINTS,{recursive:true});return path.join(CARPETA_CHECKPOINTS,`${this.neuronId}.json`)}
 private cargarCheckpoint():CheckpointND{const r=this.rutaCheckpoint();if(!fs.existsSync(r))return{documentosCompletos:[]};return JSON.parse(fs.readFileSync(r,'utf8'))}
 private guardarCheckpoint(cp:CheckpointND){fs.writeFileSync(this.rutaCheckpoint(),JSON.stringify(cp,null,2),'utf8')}
 private async paginaYaProcesada(documentoDriveId:string,pagina:number){const r=await turso.execute({sql:`SELECT estado FROM nd_paginas WHERE documento_drive_id=? AND pagina=?`,args:[documentoDriveId,pagina]});return r.rows[0]?.estado==='procesada'}
 private async limpiarDocumentoParaPrueba(documentoDriveId:string){for(const tabla of TABLAS_ND)await turso.execute({sql:`DELETE FROM ${tabla} WHERE documento_drive_id=?`,args:[documentoDriveId]})}

 async ejecutar(limiteDocumentos?:number,limitePaginas?:number):Promise<void>{
  console.log(`\n🧠 ${this.neuronId} — ND documental — carpeta ${this.numeroCarpeta}`);
  if(limitePaginas)console.log(`   🧪 Prueba limitada a ${limitePaginas} páginas por documento`);
  const checkpoint=this.cargarCheckpoint();
  const carpetaId=await resolverSubcarpetaPorNombre(this.obtenerCarpetaMadreId(),this.numeroCarpeta);
  const archivos=await listarPDFs(carpetaId);
  console.log(`   📚 ${archivos.length} PDFs encontrados`);let procesados=0;

  for(const archivo of archivos){
   if(limiteDocumentos&&procesados>=limiteDocumentos)break;
   if(!limitePaginas&&checkpoint.documentosCompletos.includes(archivo.id))continue;
   console.log(`\n   📖 ${archivo.nombre}`);let buffer:Buffer;
   try{buffer=await descargarArchivo(archivo.id)}catch(err:any){console.error(`      ❌ Descarga: ${err.message}`);continue}
   if(limitePaginas){
    await this.limpiarDocumentoParaPrueba(archivo.id);
    checkpoint.documentosCompletos=checkpoint.documentosCompletos.filter(id=>id!==archivo.id);
    delete checkpoint.documentoEnProgreso;
    this.guardarCheckpoint(checkpoint);
   }
   const paginaInicial=limitePaginas?1:(checkpoint.documentoEnProgreso?.driveFileId===archivo.id?checkpoint.documentoEnProgreso.ultimaPaginaCompletada+1:1);

   try{
    await registrarDocumentoND({documentoDriveId:archivo.id,nombre:archivo.nombre,neuronId:this.neuronId,carpetaDrive:this.numeroCarpeta});
    let totalPaginas=0,totalGuardados=0,paginasCorrida=0,totalTexto=0,ultimaPagina=paginaInicial-1;
    totalPaginas=await procesarPaginasIncremental(buffer,async({pagina,texto},total)=>{
     // Defensa adicional: aunque el parser cambie, una prueba nunca procesa
     // ni persiste más páginas que el límite solicitado.
     if(limitePaginas&&paginasCorrida>=limitePaginas)return;
     totalPaginas=total;
     if(pagina===paginaInicial)await actualizarPaginasTotalND(archivo.id,total);
     if(!limitePaginas&&await this.paginaYaProcesada(archivo.id,pagina))return;
     paginasCorrida++;ultimaPagina=pagina;totalTexto+=texto.trim().length;
     let hallazgos:ReturnType<typeof extraerNDCompleto>=[];
     if(texto&&texto.trim().length>=20){
      const capitulo=detectarCapitulo(texto);
      hallazgos=extraerNDCompleto(texto,pagina,archivo.nombre,this.neuronId);
      for(const h of hallazgos){
       h.metadatos={...(h.metadatos||{}),documentoDriveId:archivo.id,carpetaDrive:this.numeroCarpeta,...(capitulo?{capitulo}:{})};
       if(capitulo)h.evidencia.seccion=capitulo;
      }
     }
     const guardados=await guardarPaginaND(hallazgos,archivo.id,pagina);totalGuardados+=guardados;
     checkpoint.documentoEnProgreso={driveFileId:archivo.id,ultimaPaginaCompletada:pagina};this.guardarCheckpoint(checkpoint);
     if(limitePaginas || guardados>0)console.log(`      📄 ${pagina}/${total} → ${guardados}`);
     else if(pagina%25===0)console.log(`      📄 ${pagina}/${total}`);
    },paginaInicial,limitePaginas);

    const completo=ultimaPagina>=totalPaginas;
    if(completo){
     await finalizarDocumentoND(archivo.id);
     checkpoint.documentosCompletos=checkpoint.documentosCompletos.filter(id=>id!==archivo.id);checkpoint.documentosCompletos.push(archivo.id);delete checkpoint.documentoEnProgreso;this.guardarCheckpoint(checkpoint);
     procesados++;
     console.log(`      ✅ ${totalGuardados} hallazgos nuevos en Turso (${paginasCorrida} páginas procesadas)`);
    }else{
     this.guardarCheckpoint(checkpoint);
     procesados++;
     console.log(`      🧪 Prueba parcial: ${totalGuardados} hallazgos, ${paginasCorrida}/${totalPaginas} páginas, texto=${totalTexto} caracteres. Última=${ultimaPagina}.`);
    }
   }catch(err:any){console.error(`      ❌ Procesamiento interrumpido: ${err.message}`);console.log(`      ↩️ Reanudar desde la última página persistida.`)}finally{buffer=Buffer.alloc(0)}
  }
  console.log(`\n🏁 ${this.neuronId}: ${procesados} documentos procesados en esta corrida.`);console.log('   💾 ND → Turso únicamente. NE y Supabase no participan.');
 }
}
