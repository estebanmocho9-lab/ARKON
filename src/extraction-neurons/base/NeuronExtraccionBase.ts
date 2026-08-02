// ============================================================
// src/extraction-neurons/base/NeuronExtraccionBase.ts
// Clase abstracta compartida por las 10 neuronas de extracción.
// Cada neurona concreta (NE01...NE10) solo declara su neuronId
// y su número de subcarpeta — toda la lógica vive acá.
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
import { extraerPaginas, detectarCapitulo } from '../pdf/pdfParser';
import { cargarDiccionarioMateriales, cargarDiccionarioComponentes } from '../diccionarios/materiales';
import { analizarPagina } from './motorExtraccion';
import { extraerConocimientoConceptual, extraerReglasCausales } from './extractorConocimiento';
import {
extraerEspecificacionesDiseno,
extraerReaccionesQuimicas,
extraerHallazgosExperimentales,
extraerDatosMercado,
extraerTablasComparativas,
} from './extractorAmpliado';
import {
extraerSignificado,
extraerFuncion,
extraerFactoresModificadores,
extraerRelaciones,
extraerProcesos,
extraerAplicaciones,
extraerVentajas,
extraerLimitaciones,
extraerIdentidadExtendida,
extraerBibliografia,
extraerEstadoNatural,
} from './extractorESP001';
import { guardarConocimientoLote, guardarReglasLote } from '../../turso/guardarConocimiento';
import {
guardarEspecificacionesLote,
guardarReaccionesLote,
guardarHallazgosLote,
guardarDatosMercadoLote,
guardarTablasComparativasLote,
} from '../../turso/guardarConocimientoAmpliado';
import {
guardarSignificadoLote,
guardarFuncionLote,
guardarFactoresModificadoresLote,
guardarRelacionesLote,
guardarProcesosLote,
guardarAplicacionesLote,
guardarVentajasLote,
guardarLimitacionesLote,
guardarIdentidadExtendidaLote,
guardarBibliografiaLote,
guardarEstadoNaturalLote,
} from '../../turso/guardarConocimientoESP001';
import { guardarLotePropiedadesTurso } from '../../turso/guardarPropiedadesTurso';
import { documentoYaProcesado, borrarDocumento, guardarLote } from '../supabase/guardarExtraccion';
import { guardarLoteComponentes } from '../supabase/guardarExtraccionComponentes';
import { CheckpointNeurona, PropiedadExtraida, EntradaMaterial } from './tipos';

const CARPETA_CHECKPOINTS = path.join(process.cwd(), 'checkpoints');
const CARPETA_LOGS = path.join(process.cwd(), 'logs');

export abstract class NeuronExtraccionBase {
  abstract readonly neuronId: string;         // ej. 'NE-01'
  abstract readonly numeroCarpeta: string;    // ej. '01'

  // ── ID de la carpeta madre en Drive, compartido por las 10.
  //    Se toma de la variable de entorno CARPETA_MADRE_DRIVE_ID. ──
  protected obtenerCarpetaMadreId(): string {
    const id = process.env.CARPETA_MADRE_DRIVE_ID;
    if (!id) {
      throw new Error(
        'Falta la variable de entorno CARPETA_MADRE_DRIVE_ID (el ID o URL de ' +
        '"ImpulsoIA - Biblioteca Técnica" en Drive).'
      );
    }
    return extraerIdCarpeta(id);
  }

  // ── Checkpoint local ─────────────────────────────────────────
  private rutaCheckpoint(): string {
    if (!fs.existsSync(CARPETA_CHECKPOINTS)) fs.mkdirSync(CARPETA_CHECKPOINTS, { recursive: true });
    return path.join(CARPETA_CHECKPOINTS, `${this.neuronId}.json`);
  }

  private cargarCheckpoint(): CheckpointNeurona {
    const ruta = this.rutaCheckpoint();
    if (!fs.existsSync(ruta)) {
      return { documentosCompletos: [] };
    }
    return JSON.parse(fs.readFileSync(ruta, 'utf8'));
  }

  private guardarCheckpoint(cp: CheckpointNeurona): void {
    fs.writeFileSync(this.rutaCheckpoint(), JSON.stringify(cp, null, 2), 'utf8');
  }

  // ── Log de candidatos no clasificados ────────────────────────
  private registrarCandidatos(documento: string, candidatos: { pagina: number; fragmento: string; numero: string; unidadDetectada: string }[]): void {
    if (candidatos.length === 0) return;
    if (!fs.existsSync(CARPETA_LOGS)) fs.mkdirSync(CARPETA_LOGS, { recursive: true });
    const ruta = path.join(CARPETA_LOGS, `candidatos_${this.neuronId}.jsonl`);
    const lineas = candidatos.map(c => JSON.stringify({ documento, ...c })).join('\n') + '\n';
    fs.appendFileSync(ruta, lineas, 'utf8');
  }

  // ── Punto de entrada: procesa toda la carpeta asignada ───────
  async ejecutar(opciones: { reprocesar?: boolean } = {}): Promise<void> {
    console.log(`\n🧠 ${this.neuronId} arrancando (carpeta ${this.numeroCarpeta})...`);

    const checkpoint = this.cargarCheckpoint();

    // Resolver la subcarpeta (una sola vez, después queda en el checkpoint)
    let carpetaId = checkpoint.carpetaDriveIdResuelta;
    if (!carpetaId) {
      carpetaId = await resolverSubcarpetaPorNombre(this.obtenerCarpetaMadreId(), this.numeroCarpeta);
      checkpoint.carpetaDriveIdResuelta = carpetaId;
      this.guardarCheckpoint(checkpoint);
    }

    const archivos = await listarPDFs(carpetaId);
    console.log(`   📚 ${archivos.length} PDFs en la carpeta ${this.numeroCarpeta}`);

    const materiales: EntradaMaterial[] = await cargarDiccionarioMateriales();
    const componentes: EntradaMaterial[] = await cargarDiccionarioComponentes();

    let procesados = 0;

    for (const archivo of archivos) {
      const yaCompletoEnCheckpoint = checkpoint.documentosCompletos.includes(archivo.id);

      if (yaCompletoEnCheckpoint && !opciones.reprocesar) {
        continue;
      }

      if (opciones.reprocesar) {
        await borrarDocumento(archivo.id);
      } else if (!yaCompletoEnCheckpoint) {
        // Doble chequeo contra Supabase, por si el checkpoint local
        // se perdió pero los datos ya estaban guardados.
        const yaEnSupabase = await documentoYaProcesado(archivo.id);
        if (yaEnSupabase) {
          checkpoint.documentosCompletos.push(archivo.id);
          this.guardarCheckpoint(checkpoint);
          console.log(`   ⏭️  "${archivo.nombre}" ya estaba en Supabase, se omite`);
          continue;
        }
      }

      await this.procesarDocumento(archivo, materiales, componentes, checkpoint);
      procesados++;
    }

    console.log(`\n🏁 ${this.neuronId} terminó: ${procesados} documentos procesados en esta corrida.`);
  }

  // ── Procesa un documento entero, con reanudación por página ──
  private async procesarDocumento(
    archivo: ArchivoDrive,
    materiales: EntradaMaterial[],
    componentes: EntradaMaterial[],
    checkpoint: CheckpointNeurona
  ): Promise<void> {
    console.log(`\n   📖 ${archivo.nombre}`);

    let buffer: Buffer;
    try {
      buffer = await descargarArchivo(archivo.id);
    } catch (err: any) {
      console.error(`      ❌ No se pudo descargar: ${err.message}`);
      return;
    }

    // Salvavidas de memoria: en máquinas con poca RAM, un PDF muy
    // pesado (escaneado, muchas imágenes) puede colgar el proceso
    // entero. Mejor saltarlo y anotarlo para revisar aparte que
    // perder toda la corrida.
    const TAMANO_MAXIMO_MB = parseInt(process.env.TAMANO_MAXIMO_PDF_MB || '40', 10);
    const tamanoMB = buffer.length / (1024 * 1024);
    if (tamanoMB > TAMANO_MAXIMO_MB) {
      console.warn(`      ⚠️  "${archivo.nombre}" pesa ${tamanoMB.toFixed(1)} MB, supera el límite de ${TAMANO_MAXIMO_MB} MB para esta máquina. Se salta (revisar aparte).`);
      this.registrarCandidatos(archivo.nombre, [{ pagina: 0, fragmento: `ARCHIVO DEMASIADO PESADO (${tamanoMB.toFixed(1)} MB), no se procesó`, numero: '', unidadDetectada: '' }]);
      return;
    }

    let paginas;
    try {
      paginas = await extraerPaginas(buffer);
    } catch (err: any) {
      console.error(`      ❌ No se pudo extraer texto (¿escaneado sin OCR?): ${err.message}`);
      return;
    }

    console.log(`      ${paginas.length} páginas`);

    // Reanudación: si este documento venía a mitad de camino, arranca
    // después de la última página completada.
    let paginaInicial = 0;
    if (checkpoint.documentoEnProgreso?.driveFileId === archivo.id) {
      paginaInicial = checkpoint.documentoEnProgreso.ultimaPaginaCompletada;
      console.log(`      ↩️  Reanudando desde la página ${paginaInicial + 1}`);
    }

    let capituloActual: string | null = null;
    let totalHallazgos = 0;
    let registrosPendientes: PropiedadExtraida[] = [];
    let registrosComponentesPendientes: PropiedadExtraida[] = [];

    for (let i = paginaInicial; i < paginas.length; i++) {
      const { pagina, texto } = paginas[i];
      if (!texto || texto.trim().length < 20) {
        this.actualizarProgresoPagina(checkpoint, archivo.id, pagina);
        continue;
      }

      const capituloDetectado = detectarCapitulo(texto);
      if (capituloDetectado) capituloActual = capituloDetectado;

      const { registros, candidatos } = analizarPagina(texto, materiales, componentes);
      const conocimientoCandidato = extraerConocimientoConceptual(texto,
materiales);
const reglasCandidatas = extraerReglasCausales(texto);
const especificaciones = extraerEspecificacionesDiseno(texto, materiales);
const reacciones = extraerReaccionesQuimicas(texto, materiales);
const hallazgos = extraerHallazgosExperimentales(texto, materiales);
const datosMercado = extraerDatosMercado(texto, materiales);
const tablasComparativas = extraerTablasComparativas(texto, materiales);
await guardarConocimientoLote(archivo.nombre, pagina, conocimientoCandidato);
await guardarReglasLote(archivo.nombre, pagina, reglasCandidatas);
await guardarEspecificacionesLote(archivo.nombre, pagina, especificaciones);
await guardarReaccionesLote(archivo.nombre, pagina, reacciones);
await guardarHallazgosLote(archivo.nombre, pagina, hallazgos);
await guardarDatosMercadoLote(archivo.nombre, pagina, datosMercado);
await guardarTablasComparativasLote(archivo.nombre, pagina,
tablasComparativas);

// -- ESP-001: 10 categorías nuevas (significado, función, factores,
// relaciones, procesos, aplicaciones, ventajas, limitaciones,
// identidad extendida, bibliografía) --
const significado = extraerSignificado(texto, materiales);
const funcion = extraerFuncion(texto, materiales);
const factoresModificadores = extraerFactoresModificadores(texto, materiales);
const relaciones = extraerRelaciones(texto, materiales);
const procesos = extraerProcesos(texto, materiales);
const aplicaciones = extraerAplicaciones(texto, materiales);
const ventajas = extraerVentajas(texto, materiales);
const limitaciones = extraerLimitaciones(texto, materiales);
const identidadExtendida = extraerIdentidadExtendida(texto, materiales);
const bibliografia = extraerBibliografia(texto, materiales);
const estadoNatural = extraerEstadoNatural(texto, materiales);
await guardarSignificadoLote(archivo.nombre, pagina, significado);
await guardarFuncionLote(archivo.nombre, pagina, funcion);
await guardarFactoresModificadoresLote(archivo.nombre, pagina, factoresModificadores);
await guardarRelacionesLote(archivo.nombre, pagina, relaciones);
await guardarProcesosLote(archivo.nombre, pagina, procesos);
await guardarAplicacionesLote(archivo.nombre, pagina, aplicaciones);
await guardarVentajasLote(archivo.nombre, pagina, ventajas);
await guardarLimitacionesLote(archivo.nombre, pagina, limitaciones);
await guardarIdentidadExtendidaLote(archivo.nombre, pagina, identidadExtendida);
await guardarBibliografiaLote(archivo.nombre, pagina, bibliografia);
await guardarEstadoNaturalLote(archivo.nombre, pagina, estadoNatural);

      for (const r of registros) {
        const registroCompleto = {
          neurona_id: this.neuronId,
          documento: archivo.nombre,
          drive_file_id: archivo.id,
          pagina,
          capitulo: capituloActual,
          ...r,
        };
        if (registroCompleto.componente) {
          registrosComponentesPendientes.push(registroCompleto);
        } else {
          registrosPendientes.push(registroCompleto);
        }
      }
      totalHallazgos += registros.length;

      this.registrarCandidatos(archivo.nombre, candidatos.map(c => ({ ...c, pagina })));

      // Guardar en lotes de 50, o al terminar el documento
      if (registrosPendientes.length >= 50) {
        await guardarLote(registrosPendientes);
        await guardarLotePropiedadesTurso(registrosPendientes);
        registrosPendientes = [];
      }
      if (registrosComponentesPendientes.length >= 50) {
        await guardarLoteComponentes(registrosComponentesPendientes);
        registrosComponentesPendientes = [];
      }

      this.actualizarProgresoPagina(checkpoint, archivo.id, pagina);
    }

    if (registrosPendientes.length > 0) {
      await guardarLote(registrosPendientes);
      await guardarLotePropiedadesTurso(registrosPendientes);
    }
    if (registrosComponentesPendientes.length > 0) {
      await guardarLoteComponentes(registrosComponentesPendientes);
    }

    // Documento terminado: se marca completo y se limpia el progreso parcial
    checkpoint.documentosCompletos.push(archivo.id);
    checkpoint.documentoEnProgreso = undefined;
    this.guardarCheckpoint(checkpoint);

    console.log(`      ✅ ${totalHallazgos} propiedades extraídas de "${archivo.nombre}"`);
  }

  private actualizarProgresoPagina(checkpoint: CheckpointNeurona, driveFileId: string, pagina: number): void {
    checkpoint.documentoEnProgreso = { driveFileId, ultimaPaginaCompletada: pagina };
    this.guardarCheckpoint(checkpoint);
  }
}
