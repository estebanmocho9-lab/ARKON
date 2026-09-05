import * as fs from 'fs';
import * as path from 'path';
import { resolverSubcarpetaPorNombre, listarPDFs, descargarArchivo, extraerIdCarpeta } from '../drive/driveReader';
import { extraerPaginas, detectarCapitulo } from '../pdf/pdfParser';
import { prepararEsquemaNDTurso, paginaYaProcesadaNDTurso, iniciarDocumentoNDTurso, guardarPaginaNDTurso, finalizarDocumentoNDTurso, fallarDocumentoNDTurso } from '../turso/ndTursoPersistence';
import { ejecutarDeterministaND } from '../nd-deterministic/runDeterministicND';
import { procesarDocumentoND, PaginaND } from './procesadorDocumentoND';

const CHECKPOINTS=path.join(process.cwd(),'checkpoints');
const FORZAR_REANALISIS=process.env.ND_REANALIZAR==='1';
const DESDE_PAGINA=Number(process.env.ND_DESDE_PAGINA||'1');
const HASTA_PAGINA=Number(process.env.ND_HASTA_PAGINA||'0');
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
  await prepararEsquemaNDTurso();
  const cp=this.cargar();
  const carpeta=await resolverSubcarpetaPorNombre(this.obtenerCarpetaMadreId(),this.numeroCarpeta);
  let archivos=await listarPDFs(carpeta);
  if(nombreObjetivo){
   const objetivoNormalizado=nombreObjetivo.replace(/^\(\d+\)/,'').trim().toLowerCase();
   archivos=archivos.filter(a=>a.nombre===nombreObjetivo||a.nombre.replace(/^\(\d+\)/,'').trim().toLowerCase()===objetivoNormalizado);
  }
  console.log(`   📚 ${archivos.length} PDFs objetivo encontrados${nombreObjetivo?` → ${nombreObjetivo}`:''}`);
  let hechos=0;

  for(const archivo of archivos){
   if(limiteDocumentos&&hechos>=limiteDocumentos)break;
   if(!FORZAR_REANALISIS&&!limitePaginas&&cp.documentosCompletos.includes(archivo.id))continue;
   console.log(`\n   📖 ${archivo.nombre}`);
   let buffer:Buffer;
   try{buffer=await descargarArchivo(archivo.id)}catch(e:any){console.error(`      ❌ Drive: ${e?.message||e}`);continue}

   const inicio=FORZAR_REANALISIS||limitePaginas?1:(cp.documentoEnProgreso?.driveFileId===archivo.id?cp.documentoEnProgreso.ultimaPaginaCompletada+1:1);
   let ejecucionId:number|undefined;
   try{
    const todas=await extraerPaginas(buffer);
    const desde=Math.max(1,DESDE_PAGINA);
    const hasta=HASTA_PAGINA>0?Math.min(HASTA_PAGINA,todas.length):todas.length;
    if(desde>hasta)throw new Error(`Rango de páginas inválido: ${desde}-${hasta}.`);
    const seleccion=limitePaginas?todas.slice(0,limitePaginas).filter((p:any)=>p.pagina>=desde&&p.pagina<=hasta):todas.filter((p:any)=>p.pagina>=desde&&p.pagina<=hasta);
    console.log(`      📑 ${todas.length} páginas detectadas. Tanda: páginas ${desde}-${hasta}.`);

    ejecucionId=await iniciarDocumentoNDTurso({documentoDriveId:archivo.id,nombre:archivo.nombre,neuronId:this.neuronId,carpetaDrive:this.numeroCarpeta,paginasTotal:todas.length});
    console.log(`      💾 Turso: documento iniciado (ejecución ${ejecucionId})`);

    let guardados=0,procesadas=0,last=inicio-1;
    for(const pagina of seleccion){
     if(pagina.pagina<inicio)continue;
     if(limitePaginas&&pagina.pagina>limitePaginas)break;
     if(!FORZAR_REANALISIS&&!limitePaginas&&await paginaYaProcesadaNDTurso(archivo.id,pagina.pagina))continue;

     const texto=pagina.texto||'';
     const paginaND:PaginaND={pagina:pagina.pagina,texto,inicio:0,fin:texto.length};
     let deterministaPagina:{pages:any[];findings:any[]}={pages:[],findings:[]};
     try{
      deterministaPagina=await ejecutarDeterministaND(buffer,pagina.pagina,pagina.pagina);
      console.log(`      🔎 Página ${pagina.pagina}: determinista ${deterministaPagina.findings.length} hallazgos`);
     }catch(e:any){
      console.warn(`      ⚠️ Página ${pagina.pagina}: determinista omitido: ${e?.message||e}`);
     }

     const resultado=procesarDocumentoND([paginaND],archivo.nombre,archivo.id,this.neuronId,deterministaPagina.findings);
     const hallazgos=resultado.hallazgos;
     const cap=detectarCapitulo(texto);
     for(const h of hallazgos){
      h.metadatos={...(h.metadatos||{}),documentoDriveId:archivo.id,carpetaDrive:this.numeroCarpeta,motor:'ND-comprension-bloques-5extractores-determinista-16RAM',persistencia:'turso'};
      if(cap)h.evidencia.seccion=cap;
     }

     const paginaDeterminista=deterministaPagina.pages.find((p:any)=>Number(p.page??p.pagina)===pagina.pagina);
     const n=await guardarPaginaNDTurso(hallazgos,archivo.id,archivo.nombre,this.neuronId,this.numeroCarpeta,pagina.pagina,paginaDeterminista);
     guardados+=n;procesadas++;last=pagina.pagina;
     cp.documentoEnProgreso={driveFileId:archivo.id,ultimaPaginaCompletada:last};this.guardar(cp);
     console.log(`      📄 ${pagina.pagina}/${todas.length} → ${n} hallazgos guardados en Turso`);
    }

    const completo=desde===1&&hasta===todas.length&&!limitePaginas&&last>=todas.length&&todas.length>0;
    if(completo){
     await finalizarDocumentoNDTurso({documentoDriveId:archivo.id,nombre:archivo.nombre,neuronId:this.neuronId,carpetaDrive:this.numeroCarpeta,paginasTotal:todas.length,paginasProcesadas:procesadas,hallazgosTotal:guardados,ejecucionId});
     cp.documentosCompletos=[...cp.documentosCompletos.filter(id=>id!==archivo.id),archivo.id];
     delete cp.documentoEnProgreso;this.guardar(cp);
     console.log(`      ✅ ${guardados} hallazgos persistidos en Turso`)
    }else{
     this.guardar(cp);
     console.log(`      🧪 ${guardados} hallazgos, ${procesadas} páginas persistidas en Turso`)
    }
    hechos++;
   }catch(e:any){
    console.error(`      ❌ ND: ${e?.message||e}`);
    if(ejecucionId)await fallarDocumentoNDTurso(archivo.id,ejecucionId,String(e?.message||e));
    this.guardar(cp)
   }finally{buffer=Buffer.alloc(0)}
  }
  console.log(`\n🏁 ${this.neuronId}: ${hechos} documentos procesados.`);
 }
}