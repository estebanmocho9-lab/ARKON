// ============================================================
// Neurona ND universal.
// Todas las ND hacen la MISMA extracción; solo cambia la carpeta.
// ND conserva evidencia y escribe directamente en Turso.
// ============================================================
import * as fs from 'fs';
import * as path from 'path';
import { resolverSubcarpetaPorNombre, listarPDFs, descargarArchivo, extraerIdCarpeta } from '../drive/driveReader';
import { procesarPaginasIncremental, detectarCapitulo } from '../pdf/pdfParser';
import { extraerNDCompleto } from './extractorNDCompleto';
import { registrarDocumentoND, actualizarPaginasTotalND, guardarPaginaND, finalizarDocumentoND } from '../../turso/guardarHallazgosND';
import { turso } from '../../turso/tursoClient';
const CARPETA_CHECKPOINTS=path.join(process.cwd(),'checkpoints');
interface CheckpointND{documentosCompletos:string[];documentoEnProgreso?:{driveFileId:string;ultimaPaginaCompletada:number}}
export abstract class NeuronNDBase{
 abstract readonly neuronId:string; abstract readonly numeroCarpeta:string;
 protected obtenerCarpetaMadreId(){const id=process.env.CARPETA_MADRE_DRIVE_ID;if(!id)throw new Error('Falta CARPETA_MADRE_DRIVE_ID en el .env');return extraerIdCarpeta(id)}
 private rutaCheckpoint(){if(!fs.existsSync(CARPETA_CHECKPOINTS))fs.mkdirSync(CARPETA_CHECKPOINTS,{recursive:true});return path.join(CARPETA_CHECKPOINTS,`${this.neuronId}.json`)}
 private cargarCheckpoint():CheckpointND{const r=this.rutaCheckpoint();if(!fs.existsSync(r))return{documentosCompletos:[]};return JSON.parse(fs.readFileSync(r,'utf8'))}
 private guardarCheckpoint(cp:CheckpointND){fs.writeFileSync(this.rutaCheckpoint(),JSON.stringify(cp,null,2),'utf8')}
 private async paginaYaProcesada(documentoDriveId:string,pagina:number){const r=await turso.execute({sql:`SELECT estado FROM nd_paginas WHERE documento_drive_id=? AND pagina=?`,args:[documentoDriveId,pagina]});return r.rows[0]?.estado==='procesada'}
 async ejecutar(limiteDocumentos?:number):Promise<void>{
  console.log(`\n🧠 ${this.neuronId} — ND documental — carpeta ${this.numeroCarpeta}`);
  const checkpoint=this.cargarCheckpoint(),carpetaId=await resolverSubcarpetaPorNombre(this.obtenerCarpetaMadreId(),this.numeroCarpeta),archivos=await listarPDFs(carpetaId);
  console.log(`   📚 ${archivos.length} PDFs encontrados`);let procesados=0;
  for(const archivo of archivos){
   if(limiteDocumentos&&procesados>=limiteDocumentos)break;if(checkpoint.documentosCompletos.includes(archivo.id))continue;
   console.log(`\n   📖 ${archivo.nombre}`);let buffer:Buffer;
   try{buffer=await descargarArchivo(archivo.id)}catch(err:any){console.error(`      ❌ Descarga: ${err.message}`);continue}
   const paginaInicial=checkpoint.documentoEnProgreso?.driveFileId===archivo.id?checkpoint.documentoEnProgreso.ultimaPaginaCompletada+1:1;
   try{
    await registrarDocumentoND({documentoDriveId:archivo.id,nombre:archivo.nombre,neuronId:this.neuronId,carpetaDrive:this.numeroCarpeta});
    let totalPaginas=0,totalGuardados=0;
    totalPaginas=await procesarPaginasIncremental(buffer,async({pagina,texto},total)=>{
     totalPaginas=total;
     if(pagina===paginaInicial)await actualizarPaginasTotalND(archivo.id,total);
     if(await this.paginaYaProcesada(archivo.id,pagina))return;
     let hallazgos:ReturnType<typeof extraerNDCompleto>=[];
     if(texto&&texto.trim().length>=20){
      const capitulo=detectarCapitulo(texto);hallazgos=extraerNDCompleto(texto,pagina,archivo.nombre,this.neuronId);
      for(const h of hallazgos){h.metadatos={...(h.metadatos||{}),documentoDriveId:archivo.id,carpetaDrive:this.numeroCarpeta,...(capitulo?{capitulo}:{})};if(capitulo)h.evidencia.seccion=capitulo}
     }
     const guardados=await guardarPaginaND(hallazgos,archivo.id,pagina);totalGuardados+=guardados;
     checkpoint.documentoEnProgreso={driveFileId:archivo.id,ultimaPaginaCompletada:pagina};this.guardarCheckpoint(checkpoint);
     console.log(`      📄 ${pagina}/${total} → ${guardados}`);
    },paginaInicial);
    await finalizarDocumentoND(archivo.id);checkpoint.documentosCompletos.push(archivo.id);delete checkpoint.documentoEnProgreso;this.guardarCheckpoint(checkpoint);procesados++;
    console.log(`      ✅ ${totalGuardados} hallazgos nuevos en Turso (${totalPaginas} páginas)`);
   }catch(err:any){console.error(`      ❌ Procesamiento interrumpido: ${err.message}`);console.log(`      ↩️  Reanudar: la última página persistida queda registrada en Turso/checkpoint.`)}finally{buffer=Buffer.alloc(0)}
  }
  console.log(`\n🏁 ${this.neuronId}: ${procesados} documentos procesados en esta corrida.`);console.log('   💾 ND → Turso únicamente. NE y Supabase no participan.');
 }
}
