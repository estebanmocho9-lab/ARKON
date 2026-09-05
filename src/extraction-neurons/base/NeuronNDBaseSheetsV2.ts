import * as fs from 'fs';
import * as path from 'path';
import { resolverSubcarpetaPorNombre, listarPDFs, descargarArchivo, extraerIdCarpeta } from '../drive/driveReader';
import { extraerPaginas, detectarCapitulo } from '../pdf/pdfParser';
import { prepararSheetsND, paginaYaProcesadaNDSheets, registrarDocumentoNDSheets, guardarPaginaNDSheets, finalizarDocumentoNDSheets, resetSheetsNDContext } from '../sheets/ndSheetsPersistence';
import { crearSpreadsheetND, resetNDSpreadsheet } from '../sheets/ndSheetsConnection';
import { ejecutarDeterministaND } from '../nd-deterministic/runDeterministicND';
import { procesarDocumentoND, PaginaND } from './procesadorDocumentoND';

const CHECKPOINTS=path.join(process.cwd(),'checkpoints');
const FORZAR_REANALISIS=process.env.ND_REANALIZAR==='1';
interface CheckpointND{documentosCompletos:string[];documentoEnProgreso?:{driveFileId:string;ultimaPaginaCompletada:number}}

export abstract class NeuronNDBaseSheetsV2{
 abstract readonly neuronId:string;
 abstract readonly numeroCarpeta:string;
 private ruta(){if(!fs.existsSync(CHECKPOINTS))fs.mkdirSync(CHECKPOINTS,{recursive:true});return path.join(CHECKPOINTS,`${this.neuronId}.json`)}
 private cargar():CheckpointND{const r=this.ruta();if(!fs.existsSync(r))return{documentosCompletos:[]};return JSON.parse(fs.readFileSync(r,'utf8'))}
 private guardar(c:CheckpointND){fs.writeFileSync(this.ruta(),JSON.stringify(c,null,2),'utf8')}
 protected obtenerCarpetaMadreId(){const id=process.env.CARPETA_MADRE_DRIVE_ID;if(!id)throw new Error('Falta CARPETA_MADRE_DRIVE_ID en el .env');return extraerIdCarpeta(id)}

 async ejecutar(limiteDocumentos?:number,limitePaginas?:number,nombreObjetivo?:string):Promise<void>{
  console.log(`\n🧠 ${this.neuronId} — ND documental — carpeta ${this.numeroCarpeta}`);
  const cp=this.cargar();
  const carpeta=await resolverSubcarpetaPorNombre(this.obtenerCarpetaMadreId(),this.numeroCarpeta);
  let archivos=await listarPDFs(carpeta);
  if(nombreObjetivo)archivos=archivos.filter(a=>a.nombre===nombreObjetivo);
  console.log(`   📚 ${archivos.length} PDFs encontrados`);
  let hechos=0;
  for(const archivo of archivos){
   if(limiteDocumentos&&hechos>=limiteDocumentos)break;
   if(!FORZAR_REANALISIS&&!limitePaginas&&cp.documentosCompletos.includes(archivo.id))continue;
   console.log(`\n   📖 ${archivo.nombre}`);
   let buffer:Buffer;
   try{buffer=await descargarArchivo(archivo.id)}catch(e:any){console.error(`      ❌ Drive: ${e?.message||e}`);continue}
   const inicio=FORZAR_REANALISIS||limitePaginas?1:(cp.documentoEnProgreso?.driveFileId===archivo.id?cp.documentoEnProgreso.ultimaPaginaCompletada+1:1);
   try{
    resetNDSpreadsheet();
    resetSheetsNDContext();
    const spreadsheetId=await crearSpreadsheetND(archivo.nombre);
    await prepararSheetsND();
    console.log(`      💾 Resultado ND de este PDF: ${spreadsheetId}`);
    const todas=await extraerPaginas(buffer);
    const seleccion=limitePaginas?todas.slice(0,limitePaginas):todas;
    const paginas:PaginaND[]=[];let off=0;
    for(const x of todas){const t=x.texto||'';paginas.push({pagina:x.pagina,texto:t,inicio:off,fin:off+t.length});off+=t.length+2}
    let determinista:{pages:any[];findings:any[]}={pages:[],findings:[]};
    try{
     determinista=await ejecutarDeterministaND(buffer,inicio,limitePaginas?Math.min(limitePaginas,todas.length):todas.length);
     console.log(`      🔎 Determinista ND: ${determinista.findings.length} hallazgos, ${determinista.pages.length} páginas`);
    }catch(e:any){
     console.warn(`      ⚠️ Determinista ND omitido: ${e?.message||e}`);
    }
    const resultado=procesarDocumentoND(paginas,archivo.nombre,archivo.id,this.neuronId,determinista.findings);
    console.log(`      🧠 ND fusionado: ${resultado.hallazgos.length} hallazgos`);
    await registrarDocumentoNDSheets({documentoDriveId:archivo.id,nombre:archivo.nombre,neuronId:this.neuronId,carpetaDrive:this.numeroCarpeta,paginasTotal:todas.length});
    const porPagina=new Map<number,typeof resultado.hallazgos>();
    for(const h of resultado.hallazgos){const a=porPagina.get(h.evidencia.pagina)||[];a.push(h);porPagina.set(h.evidencia.pagina,a)}
    let guardados=0,procesadas=0,last=inicio-1;
    for(const pagina of seleccion){
     if(pagina.pagina<inicio)continue;
     if(limitePaginas&&pagina.pagina>limitePaginas)break;
     if(!FORZAR_REANALISIS&&!limitePaginas&&await paginaYaProcesadaNDSheets(archivo.id,this.neuronId,pagina.pagina))continue;
     const hs=porPagina.get(pagina.pagina)||[];
     const cap=detectarCapitulo(pagina.texto||'');
     for(const h of hs){h.metadatos={...(h.metadatos||{}),documentoDriveId:archivo.id,carpetaDrive:this.numeroCarpeta,motor:'ND-comprension-bloques-5extractores-determinista-16RAM'};if(cap)h.evidencia.seccion=cap}
     const paginaDeterminista=determinista.pages.find((p:any)=>Number(p.page??p.pagina)===pagina.pagina);
     const n=await guardarPaginaNDSheets(hs,archivo.id,archivo.nombre,this.neuronId,this.numeroCarpeta,pagina.pagina,paginaDeterminista);
     guardados+=n;procesadas++;last=pagina.pagina;
     cp.documentoEnProgreso={driveFileId:archivo.id,ultimaPaginaCompletada:last};this.guardar(cp);
     console.log(`      📄 ${pagina.pagina}/${todas.length} → ${n} hallazgos`);
    }
    const completo=!limitePaginas&&last>=todas.length&&todas.length>0;
    if(completo){await finalizarDocumentoNDSheets({documentoDriveId:archivo.id,nombre:archivo.nombre,neuronId:this.neuronId,carpetaDrive:this.numeroCarpeta,paginasTotal:todas.length,paginasProcesadas:procesadas,hallazgosTotal:guardados});cp.documentosCompletos=[...cp.documentosCompletos.filter(id=>id!==archivo.id),archivo.id];delete cp.documentoEnProgreso;this.guardar(cp);console.log(`      ✅ ${guardados} hallazgos`)}
    else{this.guardar(cp);console.log(`      🧪 ${guardados} hallazgos, ${procesadas} páginas procesadas`)}
    hechos++;
   }catch(e:any){console.error(`      ❌ ND: ${e?.message||e}`);this.guardar(cp)}
   finally{buffer=Buffer.alloc(0)}
  }
  console.log(`\n🏁 ${this.neuronId}: ${hechos} documentos procesados.`);
 }
}
