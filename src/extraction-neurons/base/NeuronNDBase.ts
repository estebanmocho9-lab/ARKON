// ============================================================
// Neurona ND universal rediseñada.
//
// TODAS las ND hacen la misma extraccion. La diferencia entre
// ND01...ND10 es exclusivamente la carpeta de Google Drive que
// procesa cada neurona.
//
// Esta capa NO contiene razonamiento cientifico de las 100
// neuronas Directas/Inversas. Su responsabilidad es extraer,
// conservar evidencia y alimentar las RAM propias de la ND.
// ============================================================

import * as fs from 'fs';
import * as path from 'path';

import {
  resolverSubcarpetaPorNombre,
  listarPDFs,
  descargarArchivo,
  extraerIdCarpeta,
} from '../drive/driveReader';
import { extraerPaginas } from '../pdf/pdfParser';
import { extraerNDUniversal } from './extractorNDUniversal';
import { crearRAMsND, RAMSetND } from '../memoria-nd/ram';
import { guardarHallazgosND } from '../../turso/guardarHallazgosND';
import { HallazgoND } from '../memoria-nd/tipos';

const CARPETA_CHECKPOINTS = path.join(process.cwd(), 'checkpoints');

interface CheckpointND {
  documentosCompletos: string[];
}

export abstract class NeuronNDBase {
  abstract readonly neuronId: string;
  abstract readonly numeroCarpeta: string;

  readonly rams: RAMSetND;

  protected constructor() {
    this.rams = crearRAMsND(this.neuronId);
  }

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

  private cargarEnRAM(hallazgos: HallazgoND[]): void {
    for (const h of hallazgos) {
      const mapa: Record<string, keyof RAMSetND> = {
        MATERIAL: 'materiales', COMPONENTE: 'componentes', PROPIEDAD: 'propiedades',
        ATRIBUTO: 'atributos', MAGNITUD: 'magnitudes', FORMULA: 'formulas', SUB_CABLE: 'formulas',
        RELACION: 'relaciones', METODO: 'metodos', INSTRUMENTO: 'instrumentos', NORMA: 'normas',
        CONDICION: 'condiciones', APLICACION: 'aplicaciones', COMPORTAMIENTO: 'comportamiento',
        DEFINICION: 'definiciones', EVIDENCIA: 'evidencias', DESCONOCIDO: 'desconocidos',
      };
      this.rams[mapa[h.tipo]].agregar(h);
    }
  }

  async ejecutar(limiteDocumentos?: number): Promise<void> {
    console.log(`\n🧠 ${this.neuronId} arrancando — EXTRACCION UNIVERSAL ND — carpeta ${this.numeroCarpeta}`);

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

      let paginas: Array<{ pagina: number; texto: string }>;
      try {
        paginas = await extraerPaginas(buffer);
      } catch (err: any) {
        console.error(`      ❌ PDF: ${err.message}`);
        continue;
      }

      let total = 0;
      for (const { pagina, texto } of paginas) {
        if (!texto || texto.trim().length < 20) continue;

        const hallazgos = extraerNDUniversal(texto, pagina, archivo.nombre, this.neuronId);
        this.cargarEnRAM(hallazgos);
        await guardarHallazgosND(hallazgos);
        total += hallazgos.length;
      }

      console.log(`      ✅ ${total} hallazgos ND guardados sin clasificacion definitiva`);
      checkpoint.documentosCompletos.push(archivo.id);
      this.guardarCheckpoint(checkpoint);
      procesados++;
    }

    console.log(`\n🏁 ${this.neuronId}: ${procesados} documentos procesados.`);
    console.log(`   RAM ND: ${Object.values(this.rams).reduce((n, ram) => n + ram.cantidad(), 0)} hallazgos acumulados`);
  }
}
