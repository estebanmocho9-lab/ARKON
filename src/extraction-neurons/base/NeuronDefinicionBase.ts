// ============================================================
// src/extraction-neurons/base/NeuronDefinicionBase.ts
// Neurona DEDICADA a llenar fichas_propiedades. Separada por
// completo de NeuronExtraccionBase.ts — no comparte checkpoint,
// no comparte logica, solo reutiliza las utilidades de Drive/PDF
// que ya existian.
// ============================================================

import * as fs from 'fs';
import * as path from 'path';

import {
  resolverSubcarpetaPorNombre,
  listarPDFs,
  descargarArchivo,
  extraerIdCarpeta,
  ArchivoDrive,
} from '../drive/driveReader';
import { extraerPaginas } from '../pdf/pdfParser';
import { extraerDefinicionesPropiedades } from './extractorDefiniciones';
import { guardarHallazgosDefinicion } from '../../turso/guardarFichaPropiedad';

const CARPETA_CHECKPOINTS = path.join(process.cwd(), 'checkpoints');

interface CheckpointDefinicion {
  documentosCompletos: string[];
}

export abstract class NeuronDefinicionBase {
  abstract readonly neuronId: string;      // ej. 'ND-09'
  abstract readonly numeroCarpeta: string; // ej. '09'

  protected obtenerCarpetaMadreId(): string {
    const id = process.env.CARPETA_MADRE_DRIVE_ID;
    if (!id) throw new Error('Falta CARPETA_MADRE_DRIVE_ID en el .env');
    return extraerIdCarpeta(id);
  }

  private rutaCheckpoint(): string {
    if (!fs.existsSync(CARPETA_CHECKPOINTS)) fs.mkdirSync(CARPETA_CHECKPOINTS, { recursive: true });
    return path.join(CARPETA_CHECKPOINTS, `${this.neuronId}.json`);
  }

  private cargarCheckpoint(): CheckpointDefinicion {
    const ruta = this.rutaCheckpoint();
    if (!fs.existsSync(ruta)) return { documentosCompletos: [] };
    return JSON.parse(fs.readFileSync(ruta, 'utf8'));
  }

  private guardarCheckpoint(cp: CheckpointDefinicion): void {
    fs.writeFileSync(this.rutaCheckpoint(), JSON.stringify(cp, null, 2), 'utf8');
  }

  async ejecutar(limiteDocumentos?: number): Promise<void> {
    console.log(`\n🧠 ${this.neuronId} arrancando (carpeta ${this.numeroCarpeta}) — modo DEFINICIONES...`);
    if (limiteDocumentos) {
      console.log(`   ⚙️  Limite de esta corrida: ${limiteDocumentos} documento(s)`);
    }

    const checkpoint = this.cargarCheckpoint();
    const carpetaId = await resolverSubcarpetaPorNombre(this.obtenerCarpetaMadreId(), this.numeroCarpeta);
    const archivos = await listarPDFs(carpetaId);

    console.log(`   📚 ${archivos.length} PDFs en la carpeta ${this.numeroCarpeta}`);

    let procesados = 0;

    for (const archivo of archivos) {
      if (limiteDocumentos && procesados >= limiteDocumentos) {
        console.log(`\n   ⏸️  Limite de ${limiteDocumentos} documento(s) alcanzado, se detiene aca por hoy.`);
        break;
      }

      if (checkpoint.documentosCompletos.includes(archivo.id)) continue;

      console.log(`\n   📖 ${archivo.nombre}`);

      let buffer: Buffer;
      try {
        buffer = await descargarArchivo(archivo.id);
      } catch (err: any) {
        console.error(`      ❌ No se pudo descargar: ${err.message}`);
        continue;
      }

      let paginas;
      try {
        paginas = await extraerPaginas(buffer);
      } catch (err: any) {
        console.error(`      ❌ No se pudo extraer texto: ${err.message}`);
        continue;
      }

      console.log(`      ${paginas.length} páginas`);
      let totalHallazgos = 0;

      for (const { pagina, texto } of paginas) {
        if (!texto || texto.trim().length < 20) continue;

        const hallazgos = extraerDefinicionesPropiedades(texto);
        if (hallazgos.length > 0) {
          await guardarHallazgosDefinicion(archivo.nombre, pagina, hallazgos);
          totalHallazgos += hallazgos.length;
        }
      }

      console.log(`      ✅ ${totalHallazgos} datos de definición encontrados en "${archivo.nombre}"`);

      checkpoint.documentosCompletos.push(archivo.id);
      this.guardarCheckpoint(checkpoint);
      procesados++;
    }

    console.log(`\n🏁 ${this.neuronId} terminó: ${procesados} documentos procesados.`);
  }
}
