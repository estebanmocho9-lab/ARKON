// ============================================================
// Neurona ND universal.
// Todas las ND hacen la MISMA extracción; solo cambia la carpeta.
// ND conserva evidencia y escribe directamente en Turso.
// No mantiene el documento completo ni todos los hallazgos en RAM.
// ============================================================

import * as fs from 'fs';
import * as path from 'path';
import { resolverSubcarpetaPorNombre, listarPDFs, descargarArchivo, extraerIdCarpeta } from '../drive/driveReader';
import { procesarPaginasIncremental, detectarCapitulo } from '../pdf/pdfParser';
import { extraerNDCompleto } from './extractorNDCompleto';
import {
  registrarDocumentoND,
  guardarPaginaND,
  finalizarDocumentoND,
} from '../../turso/guardarHallazgosND';

const CARPETA_CHECKPOINTS = path.join(process.cwd(), 'checkpoints');
interface CheckpointND {
  documentosCompletos: string[];
  documentoEnProgreso?: { driveFileId: string; ultimaPaginaCompletada: number };
}

export abstract class NeuronNDBase {
  abstract readonly neuronId: string;
  abstract readonly numeroCarpeta: string;

  protected obtenerCarpetaMadreId(): string {
    const id = process.env.CARPETA_MADRE_DRIVE_ID;
    if (!id) throw new Error('Falta CARPETA_MADRE_DRIVE_ID en el .env');
    return extraerIdCarpeta(id);
  }

  private rutaCheckpoint(): string {
    if (!fs.existsSync(CARPETA_CHECKPOINTS)) fs.mkdirSync(CARPETA_CHECKPOINTS, { recursive: true });
    return path.join(CARPETA_CHECKPOINTS, `${this.neuronId}.json`);
  }

  private cargarCheckpoint(): CheckpointND {
    const ruta = this.rutaCheckpoint();
    if (!fs.existsSync(ruta)) return { documentosCompletos: [] };
    return JSON.parse(fs.readFileSync(ruta, 'utf8'));
  }

  private guardarCheckpoint(cp: CheckpointND): void {
    fs.writeFileSync(this.rutaCheckpoint(), JSON.stringify(cp, null, 2), 'utf8');
  }

  async ejecutar(limiteDocumentos?: number): Promise<void> {
    console.log(`\n🧠 ${this.neuronId} — ND documental — carpeta ${this.numeroCarpeta}`);
    const checkpoint = this.cargarCheckpoint();
    const carpetaId = await resolverSubcarpetaPorNombre(this.obtenerCarpetaMadreId(), this.numeroCarpeta);
    const archivos = await listarPDFs(carpetaId);
    console.log(`   📚 ${archivos.length} PDFs encontrados`);

    let procesados = 0;
    for (const archivo of archivos) {
      if (limiteDocumentos && procesados >= limiteDocumentos) break;
      if (checkpoint.documentosCompletos.includes(archivo.id)) continue;

      console.log(`\n   📖 ${archivo.nombre}`);
      let buffer: Buffer;
      try {
        buffer = await descargarArchivo(archivo.id);
      } catch (err: any) {
        console.error(`      ❌ Descarga: ${err.message}`);
        continue;
      }

      const paginaInicial = checkpoint.documentoEnProgreso?.driveFileId === archivo.id
        ? checkpoint.documentoEnProgreso.ultimaPaginaCompletada + 1
        : 1;

      try {
        await registrarDocumentoND({
          documentoDriveId: archivo.id,
          nombre: archivo.nombre,
          neuronId: this.neuronId,
          carpetaDrive: this.numeroCarpeta,
        });

        let ultimaPagina = paginaInicial - 1;
        let totalPaginas = 0;
        let totalGuardados = 0;

        totalPaginas = await procesarPaginasIncremental(buffer, async ({ pagina, texto }, total) => {
          totalPaginas = total;
          if (!texto || texto.trim().length < 20) {
            checkpoint.documentoEnProgreso = { driveFileId: archivo.id, ultimaPaginaCompletada: pagina };
            this.guardarCheckpoint(checkpoint);
            return;
          }

          const capitulo = detectarCapitulo(texto);
          const hallazgos = extraerNDCompleto(texto, pagina, archivo.nombre, this.neuronId);
          for (const h of hallazgos) {
            h.metadatos = {
              ...(h.metadatos || {}),
              documentoDriveId: archivo.id,
              carpetaDrive: this.numeroCarpeta,
              ...(capitulo ? { capitulo } : {}),
            };
            if (capitulo) h.evidencia.seccion = capitulo;
          }

          const guardados = await guardarPaginaND(hallazgos, archivo.id, pagina);
          totalGuardados += guardados;
          ultimaPagina = pagina;

          checkpoint.documentoEnProgreso = { driveFileId: archivo.id, ultimaPaginaCompletada: pagina };
          this.guardarCheckpoint(checkpoint);

          console.log(`      📄 ${pagina}/${total} → ${guardados} hallazgos guardados`);
        }, paginaInicial);

        await finalizarDocumentoND(archivo.id);
        checkpoint.documentosCompletos.push(archivo.id);
        delete checkpoint.documentoEnProgreso;
        this.guardarCheckpoint(checkpoint);
        procesados++;

        console.log(`      ✅ ${totalGuardados} hallazgos persistidos en Turso (${totalPaginas} páginas)`);
      } catch (err: any) {
        console.error(`      ❌ Procesamiento interrumpido: ${err.message}`);
        console.log(`      ↩️  El checkpoint permite reanudar desde la última página guardada.`);
      } finally {
        buffer = Buffer.alloc(0);
      }
    }

    console.log(`\n🏁 ${this.neuronId}: ${procesados} documentos procesados en esta corrida.`);
    console.log('   💾 Los hallazgos quedan en Turso; ND no mantiene una RAM documental acumulativa.');
  }
}
