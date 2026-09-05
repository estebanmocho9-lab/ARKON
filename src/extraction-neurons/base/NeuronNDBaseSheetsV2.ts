// ============================================================
// ARKON — Base ND V2 con persistencia exclusiva en Google Sheets.
// No toca la base ND histórica de Turso y no participa en NE.
// ============================================================

import * as fs from 'fs';
import * as path from 'path';
import { resolverSubcarpetaPorNombre, listarPDFs, descargarArchivo, extraerIdCarpeta } from '../drive/driveReader';
import { procesarPaginasIncremental, detectarCapitulo } from '../pdf/pdfParser';
import { extraerNDCompleto } from './extractorNDCompleto';
import { prepararSheetsND, paginaYaProcesadaNDSheets, registrarDocumentoNDSheets, guardarPaginaNDSheets, finalizarDocumentoNDSheets } from '../sheets/ndSheetsPersistence';

const CARPETA_CHECKPOINTS = path.join(process.cwd(), 'checkpoints');
interface CheckpointND { documentosCompletos: string[]; documentoEnProgreso?: { driveFileId: string; ultimaPaginaCompletada: number } }

export abstract class NeuronNDBaseSheetsV2 {
  abstract readonly neuronId: string;
  abstract readonly numeroCarpeta: string;

  protected obtenerCarpetaMadreId() {
    const id = process.env.CARPETA_MADRE_DRIVE_ID;
    if (!id) throw new Error('Falta CARPETA_MADRE_DRIVE_ID en el .env');
    return extraerIdCarpeta(id);
  }

  private rutaCheckpoint() {
    if (!fs.existsSync(CARPETA_CHECKPOINTS)) fs.mkdirSync(CARPETA_CHECKPOINTS, { recursive: true });
    return path.join(CARPETA_CHECKPOINTS, `${this.neuronId}.json`);
  }

  private cargarCheckpoint(): CheckpointND {
    const r = this.rutaCheckpoint();
    if (!fs.existsSync(r)) return { documentosCompletos: [] };
    return JSON.parse(fs.readFileSync(r, 'utf8'));
  }

  private guardarCheckpoint(cp: CheckpointND) { fs.writeFileSync(this.rutaCheckpoint(), JSON.stringify(cp, null, 2), 'utf8'); }

  async ejecutar(limiteDocumentos?: number, limitePaginas?: number): Promise<void> {
    console.log(`\n🧠 ${this.neuronId} — ND documental — carpeta ${this.numeroCarpeta}`);
    if (limitePaginas) console.log(`   🧪 Prueba limitada a ${limitePaginas} páginas por documento`);

    await prepararSheetsND();
    const checkpoint = this.cargarCheckpoint();
    const carpetaId = await resolverSubcarpetaPorNombre(this.obtenerCarpetaMadreId(), this.numeroCarpeta);
    const archivos = await listarPDFs(carpetaId);
    console.log(`   📚 ${archivos.length} PDFs encontrados`);

    let procesados = 0;
    for (const archivo of archivos) {
      if (limiteDocumentos && procesados >= limiteDocumentos) break;
      if (!limitePaginas && checkpoint.documentosCompletos.includes(archivo.id)) continue;

      console.log(`\n   📖 ${archivo.nombre}`);
      let buffer: Buffer;
      try {
        // Drive -> memoria. No se crea ningún archivo PDF local.
        buffer = await descargarArchivo(archivo.id);
      } catch (err: any) {
        console.error(`      ❌ Lectura Drive: ${err?.message || err}`);
        continue;
      }

      const paginaInicial = limitePaginas ? 1 : (checkpoint.documentoEnProgreso?.driveFileId === archivo.id ? checkpoint.documentoEnProgreso.ultimaPaginaCompletada + 1 : 1);

      try {
        await registrarDocumentoNDSheets({ documentoDriveId: archivo.id, nombre: archivo.nombre, neuronId: this.neuronId, carpetaDrive: this.numeroCarpeta });
        let totalPaginas = 0, totalGuardados = 0, paginasCorrida = 0, totalTexto = 0, ultimaPagina = paginaInicial - 1;

        totalPaginas = await procesarPaginasIncremental(buffer, async ({ pagina, texto }, total) => {
          if (limitePaginas && paginasCorrida >= limitePaginas) return;
          totalPaginas = total;
          if (limitePaginas && pagina > limitePaginas) return;
          if (!limitePaginas && await paginaYaProcesadaNDSheets(archivo.id, this.neuronId, pagina)) return;

          paginasCorrida++;
          ultimaPagina = pagina;
          totalTexto += texto.trim().length;

          let hallazgos: ReturnType<typeof extraerNDCompleto> = [];
          if (texto && texto.trim().length >= 20) {
            const capitulo = detectarCapitulo(texto);
            hallazgos = extraerNDCompleto(texto, pagina, archivo.nombre, this.neuronId);
            for (const h of hallazgos) {
              h.metadatos = { ...(h.metadatos || {}), documentoDriveId: archivo.id, carpetaDrive: this.numeroCarpeta, ...(capitulo ? { capitulo } : {}) };
              if (capitulo) h.evidencia.seccion = capitulo;
            }
          }

          const guardados = await guardarPaginaNDSheets(hallazgos, archivo.id, archivo.nombre, this.neuronId, this.numeroCarpeta, pagina);
          totalGuardados += guardados;
          checkpoint.documentoEnProgreso = { driveFileId: archivo.id, ultimaPaginaCompletada: pagina };
          this.guardarCheckpoint(checkpoint);
          console.log(`      📄 ${pagina}/${total} → ${guardados}`);
        }, paginaInicial, limitePaginas);

        const completo = ultimaPagina >= totalPaginas && totalPaginas > 0;
        if (completo) {
          await finalizarDocumentoNDSheets({ documentoDriveId: archivo.id, nombre: archivo.nombre, neuronId: this.neuronId, carpetaDrive: this.numeroCarpeta, paginasTotal: totalPaginas, paginasProcesadas: paginasCorrida, hallazgosTotal: totalGuardados });
          checkpoint.documentosCompletos = checkpoint.documentosCompletos.filter(id => id !== archivo.id);
          checkpoint.documentosCompletos.push(archivo.id);
          delete checkpoint.documentoEnProgreso;
          this.guardarCheckpoint(checkpoint);
          console.log(`      ✅ ${totalGuardados} hallazgos nuevos en Google Sheets (${paginasCorrida} páginas procesadas)`);
        } else {
          this.guardarCheckpoint(checkpoint);
          console.log(`      🧪 Prueba parcial: ${totalGuardados} hallazgos, ${paginasCorrida}/${totalPaginas} páginas, texto=${totalTexto} caracteres. Última=${ultimaPagina}.`);
        }
        procesados++;
      } catch (err: any) {
        console.error(`      ❌ Procesamiento interrumpido: ${err?.message || err}`);
        console.log('      ↩️ Se conserva el checkpoint para reanudar.');
      } finally { buffer = Buffer.alloc(0); }
    }

    console.log(`\n🏁 ${this.neuronId}: ${procesados} documentos procesados en esta corrida.`);
    console.log('   💾 ND → Google Sheets únicamente.');
    console.log('   🚫 Turso no participa.');
    console.log('   🚫 Supabase no participa.');
    console.log('   🚫 NE no participa.');
  }
}
