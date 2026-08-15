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
import { calcularBloques } from '../comprension/gestorBloques';
import { crearRAMMateriales } from '../memoria/ramMateriales';
import { crearRAMPropiedades } from '../memoria/ramPropiedades';
import { crearRAMValores } from '../memoria/ramValores';
import { crearRAMComponentes } from '../memoria/ramComponentes';
import { crearRAMNormas } from '../memoria/ramNormas';
import { crearRAMCondicionEnsayo } from '../memoria/ramCondicionEnsayo';
import { consolidarBloque } from '../consolidacion/consolidador';
import { validarBloque } from '../validacion/validadorGeneral';
import { PROPIEDADES } from '../diccionarios/propiedades';
import { UNIDADES } from '../diccionarios/unidades';
import { INSTRUMENTOS } from '../diccionarios/instrumentos';
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
import { guardarDatosSinClasificarLote } from '../supabase/guardarDatosSinClasificar';
import { CheckpointNeurona, PropiedadExtraida, EntradaMaterial } from './tipos';
import { construirMemoriaTemporal } from '../comprension/construirMemoria';

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

    let paginas: PaginaTexto[];
    try {
      paginas = await extraerPaginas(buffer);
    } catch (err: any) {
      console.error(`      ❌ No se pudo extraer texto (¿escaneado sin OCR?): ${err.message}`);
      return;
    }

    console.log(`      ${paginas.length} páginas`);

    // ── Neurona de Comprensión Documental (Paso 6) + densidad de
    //    menciones (Paso 5): se calculan UNA sola vez por documento,
    //    ANTES de procesar página por página.
    //
    //    IMPORTANTE: acá usamos el texto CRUDO de cada página (sin
    //    aplastar los saltos de línea) para que detectorEstructura
    //    pueda reconocer títulos como "3.2 Propiedades del Yeso"
    //    (necesita el \n real antes del número). Las páginas se unen
    //    con un solo carácter de salto de línea, así el offset de
    //    cada página queda exacto para poder ubicarla después. La
    //    "limpieza" de espacios para el matcheo de palabras la hace
    //    analizarPagina() por su cuenta, más abajo, sin destruir esta
    //    alineación de posiciones (ver el cambio correspondiente en
    //    motorExtraccion.ts: ahora sustituye espacio por espacio,
    //    uno a uno, en vez de fusionar varios en uno). ─────────────
    const offsetsPorPagina: number[] = [];
    let offsetAcumulado = 0;
    for (const p of paginas) {
      const textoCrudo = p.texto || '';
      offsetsPorPagina.push(offsetAcumulado);
      offsetAcumulado += textoCrudo.length + 1; // +1 por el '\n' separador de abajo
    }
    const textoCompletoDocumento = paginas.map(p => p.texto || '').join('\n');

    const memoria = construirMemoriaTemporal(textoCompletoDocumento, materiales, archivo.nombre, archivo.id);
    console.log(`      🧠 Comprensión: idioma=${memoria.idioma}, tema principal=${memoria.temaPrincipal || '(sin determinar)'}, confianza=${memoria.nivelConfianzaComprension}, materiales relevantes=[${memoria.materialesRelevantes.join(', ') || 'ninguno'}]`);

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

    // ── LOOP 1: conocimiento conceptual, EXACTAMENTE igual que
    //    antes, sin ningún cambio — sigue siendo por página. ───────
    for (let i = paginaInicial; i < paginas.length; i++) {
      const { pagina, texto } = paginas[i];
      if (!texto || texto.trim().length < 20) {
        this.actualizarProgresoPagina(checkpoint, archivo.id, pagina);
        continue;
      }

      const capituloDetectado = detectarCapitulo(texto);
      if (capituloDetectado) capituloActual = capituloDetectado;

      const conocimientoCandidato = extraerConocimientoConceptual(texto, materiales);
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
      await guardarTablasComparativasLote(archivo.nombre, pagina, tablasComparativas);

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

      this.actualizarProgresoPagina(checkpoint, archivo.id, pagina);
    }

    // ── LOOP 2: NUEVO. Materiales/propiedades/valores/componentes/
    //    normas/condición de ensayo, ahora por BLOQUE DE MATERIAL en
    //    vez de por página — esto es lo que resuelve el bug del
    //    índice. Corre después del loop de arriba, sobre el mismo
    //    textoCompletoDocumento que ya está en memoria. ─────────────
    const bloques = calcularBloques(memoria, textoCompletoDocumento.length);
    console.log(`      🧩 ${bloques.length} bloques de material detectados`);

    const ramMateriales = crearRAMMateriales(materiales) as any;
    const ramPropiedades = crearRAMPropiedades(PROPIEDADES) as any;
    const ramValores = crearRAMValores(UNIDADES) as any;
    const ramComponentes = crearRAMComponentes(componentes) as any;
    const ramNormas = crearRAMNormas() as any;
    const ramCondicionEnsayo = crearRAMCondicionEnsayo(INSTRUMENTOS) as any;

    // Mismo criterio de reanudación que el loop de arriba, pero
    // traducido a posición de caracter: si ya habíamos pasado la
    // página `paginaInicial` en una corrida anterior, no reprocesamos
    // los bloques que caen antes de esa posición (evita duplicar
    // filas en Turso si el proceso se cortó a mitad de documento).
    const posicionYaCubierta = offsetsPorPagina[paginaInicial] ?? 0;

    function paginaDePosicion(posicion: number): number {
      let idx = 0;
      for (let i = 0; i < offsetsPorPagina.length; i++) {
        if (offsetsPorPagina[i] <= posicion) idx = i; else break;
      }
      return paginas[idx].pagina;
    }

    for (const bloque of bloques) {
      if (bloque.fin <= posicionYaCubierta) continue;

      const textoBloque = textoCompletoDocumento.slice(bloque.inicio, bloque.fin);
      if (!textoBloque || textoBloque.trim().length < 20) continue;

      ramMateriales.activarDesdeTexto(textoBloque, bloque.inicio);
      ramPropiedades.activarDesdeTexto(textoBloque, bloque.inicio);
      ramValores.activarDesdeTexto(textoBloque, bloque.inicio);
      ramComponentes.activarDesdeTexto(textoBloque, bloque.inicio);
      ramNormas.activarDesdeTexto(textoBloque, bloque.inicio);
      ramCondicionEnsayo.activarDesdeTexto(textoBloque, bloque.inicio);

      const materialResuelto = ramMateriales.entregar();
      const consolidado = consolidarBloque(
        bloque,
        materialResuelto,
        ramPropiedades.entregar(),
        ramValores.entregar(),
        ramComponentes.entregar(),
        ramNormas.entregar(),
        ramCondicionEnsayo.entregar(),
        textoCompletoDocumento
      );
      const validado = validarBloque(bloque, consolidado.registros);

      if (validado.bloqueDescartadoPorEstructura) {
        console.log(`      🚫 Bloque descartado (nodo "${bloque.tipoNodoDominante}"): ${bloque.capituloActivo ?? capituloActual ?? 'sin capítulo'}`);
      }
      if (consolidado.candidatos.length > 0) {
        console.log(`      ⚠️  ${consolidado.candidatos.length} candidatos descartados en este bloque (sin material o sin valor)`);
      }

      const paginaDelBloque = paginaDePosicion(bloque.inicio);

      for (const r of validado.validos) {
        const registroCompleto = {
          neurona_id: this.neuronId,
          documento: archivo.nombre,
          drive_file_id: archivo.id,
          pagina: paginaDelBloque,
          capitulo: bloque.capituloActivo ?? capituloActual,
          ...r,
        };
        if (registroCompleto.componente) {
          registrosComponentesPendientes.push(registroCompleto);
        } else {
          registrosPendientes.push(registroCompleto);
        }
      }
      totalHallazgos += validado.validos.length;

      if (registrosPendientes.length >= 50) {
        await guardarLote(registrosPendientes);
        await guardarLotePropiedadesTurso(registrosPendientes);
        registrosPendientes = [];
      }
      if (registrosComponentesPendientes.length >= 50) {
        await guardarLoteComponentes(registrosComponentesPendientes);
        registrosComponentesPendientes = [];
      }
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