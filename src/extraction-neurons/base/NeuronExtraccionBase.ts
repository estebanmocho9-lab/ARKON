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
import { esBloqueDescartable } from '../comprension/gestorBloques';
import {
  construirEntradasProcesamiento,
  hipotesisAceptadaAPropiedadExtraida,
  hipotesisPendienteAContexto,
} from '../../comprehension-neuron/adaptadorPipeline';
import { procesarCandidato, ResultadoProcesamiento } from '../../comprehension-neuron/neuronaComprension';
import { enrutarResultados } from '../../comprehension-neuron/enrutadorResultados';
import { obtenerMateriales, obtenerFamilias } from '../../comprehension-neuron/diccionario/materiales';
import { Hipotesis } from '../../comprehension-neuron/tipos/hipotesis';
import { BloqueMaterial } from '../comprension/gestorBloques';
import { guardarLotePendientes, HipotesisConContexto } from '../../turso/guardarPendientesRevision';
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
import {
  guardarConocimientoLote,
  guardarReglasLote,
} from '../../turso/guardarConocimiento';
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
import { guardarHallazgosND } from '../../turso/guardarHallazgosND';
import { documentoYaProcesado, borrarDocumento, guardarLote } from '../supabase/guardarExtraccion';
import { guardarDatosSinClasificarLote } from '../supabase/guardarDatosSinClasificar';
import { CheckpointNeurona, PropiedadExtraida, EntradaMaterial, PaginaTexto } from './tipos';
import { construirMemoriaTemporal } from '../comprension/construirMemoria';
import { extraerNDCompleto } from './extractorNDCompleto';

const CARPETA_CHECKPOINTS = path.join(process.cwd(), 'checkpoints');
const CARPETA_LOGS = path.join(process.cwd(), 'logs');

export abstract class NeuronExtraccionBase {
  abstract readonly neuronId: string;
  abstract readonly numeroCarpeta: string;

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

  private rutaCheckpoint(): string {
    if (!fs.existsSync(CARPETA_CHECKPOINTS)) fs.mkdirSync(CARPETA_CHECKPOINTS, { recursive: true });
    return path.join(CARPETA_CHECKPOINTS, `${this.neuronId}.json`);
  }

  private cargarCheckpoint(): CheckpointNeurona {
    const ruta = this.rutaCheckpoint();
    if (!fs.existsSync(ruta)) return { documentosCompletos: [] };
    return JSON.parse(fs.readFileSync(ruta, 'utf8'));
  }

  private guardarCheckpoint(cp: CheckpointNeurona): void {
    fs.writeFileSync(this.rutaCheckpoint(), JSON.stringify(cp, null, 2), 'utf8');
  }

  private registrarCandidatos(documento: string, candidatos: { pagina: number; fragmento: string; numero: string; unidadDetectada: string }[]): void {
    if (candidatos.length === 0) return;
    if (!fs.existsSync(CARPETA_LOGS)) fs.mkdirSync(CARPETA_LOGS, { recursive: true });
    const ruta = path.join(CARPETA_LOGS, `candidatos_${this.neuronId}.jsonl`);
    const lineas = candidatos.map(c => JSON.stringify({ documento, ...c })).join('\n') + '\n';
    fs.appendFileSync(ruta, lineas, 'utf8');
  }

  async ejecutar(opciones: { reprocesar?: boolean } = {}): Promise<void> {
    console.log(`\n🧠 ${this.neuronId} arrancando (carpeta ${this.numeroCarpeta})...`);
    const checkpoint = this.cargarCheckpoint();
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
      if (yaCompletoEnCheckpoint && !opciones.reprocesar) continue;
      if (opciones.reprocesar) {
        await borrarDocumento(archivo.id);
      } else if (!yaCompletoEnCheckpoint) {
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

    const offsetsPorPagina: number[] = [];
    let offsetAcumulado = 0;
    for (const p of paginas) {
      const textoCrudo = p.texto || '';
      offsetsPorPagina.push(offsetAcumulado);
      offsetAcumulado += textoCrudo.length + 1;
    }
    const textoCompletoDocumento = paginas.map(p => p.texto || '').join('\n');

    // ── ND: evidencia documental amplia ────────────────────────
    // ND NO interpreta valores/unidades. Esa responsabilidad queda
    // en el tramo NE + Neurona Central. Acá solo preservamos el texto
    // y la evidencia que ND encuentra, en una tabla propia de Turso.
    const hallazgosND: import('../memoria-nd/tipos').HallazgoND[] = [];
    for (const { pagina, texto } of paginas) {
      if (!texto || texto.trim().length < 20) continue;
      hallazgosND.push(...extraerNDCompleto(texto, pagina, archivo.nombre, this.neuronId));
    }
    for (const h of hallazgosND) {
      h.metadatos = { ...(h.metadatos || {}), documentoDriveId: archivo.id };
    }
    await guardarHallazgosND(hallazgosND);
    console.log(`      🧾 ND: ${hallazgosND.length} hallazgos documentales guardados en Turso`);

    const memoria = construirMemoriaTemporal(textoCompletoDocumento, materiales, archivo.nombre, archivo.id);
    console.log(`      🧠 Comprensión: idioma=${memoria.idioma}, tema principal=${memoria.temaPrincipal || '(sin determinar)'}, confianza=${memoria.nivelConfianzaComprension}, materiales relevantes=[${memoria.materialesRelevantes.join(', ') || 'ninguno'}]`);

    let paginaInicial = 0;
    if (checkpoint.documentoEnProgreso?.driveFileId === archivo.id) {
      paginaInicial = checkpoint.documentoEnProgreso.ultimaPaginaCompletada;
      console.log(`      ↩️  Reanudando desde la página ${paginaInicial + 1}`);
    }

    let capituloActual: string | null = null;
    let totalHallazgos = 0;

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

    const bloques = calcularBloques(memoria, textoCompletoDocumento.length);
    console.log(`      🧩 ${bloques.length} bloques de material detectados`);
    const ramMateriales = crearRAMMateriales(materiales) as any;
    const ramPropiedades = crearRAMPropiedades(PROPIEDADES) as any;
    const ramValores = crearRAMValores(UNIDADES) as any;
    const ramComponentes = crearRAMComponentes(componentes) as any;
    const ramNormas = crearRAMNormas() as any;
    const ramCondicionEnsayo = crearRAMCondicionEnsayo(INSTRUMENTOS) as any;
    const posicionYaCubierta = offsetsPorPagina[paginaInicial] ?? 0;
    function paginaDePosicion(posicion: number): number {
      let idx = 0;
      for (let i = 0; i < offsetsPorPagina.length; i++) {
        if (offsetsPorPagina[i] <= posicion) idx = i; else break;
      }
      return paginas[idx].pagina;
    }
    const catalogoMaterialesNeuronaCentral = await obtenerMateriales();
    const familiasNeuronaCentral = await obtenerFamilias();
    const nombreDeFamilia = (idFamilia: string | undefined | null): string | null => familiasNeuronaCentral.find(f => f.id === idFamilia)?.nombre ?? null;
    const contextoPorHipotesis = new Map<string, { resultado: ResultadoProcesamiento; pagina: number; capitulo: string | null; bloque: BloqueMaterial }>();
    const guardarLoteAcumulado = async () => {
      if (contextoPorHipotesis.size === 0) return;
      const todasLasHipotesis: Hipotesis[] = [];
      for (const { resultado } of contextoPorHipotesis.values()) if (resultado.hipotesis) todasLasHipotesis.push(resultado.hipotesis);
      const enrutado = enrutarResultados(todasLasHipotesis);
      const propiedadesParaGuardar: PropiedadExtraida[] = [];
      for (const h of enrutado.paraGuardar) {
        const ctx = contextoPorHipotesis.get(h.id);
        if (!ctx) continue;
        const propiedadExtraida = hipotesisAceptadaAPropiedadExtraida(ctx.resultado, {
          neuronaId: this.neuronId,
          documento: archivo.nombre,
          driveFileId: archivo.id,
          pagina: ctx.pagina,
          capitulo: ctx.capitulo,
          bloque: ctx.bloque,
          familiaNombre: nombreDeFamilia(ctx.resultado.material?.familia),
        });
        if (propiedadExtraida) propiedadesParaGuardar.push(propiedadExtraida);
      }
      if (propiedadesParaGuardar.length > 0) {
        await guardarLote(propiedadesParaGuardar);
        await guardarLotePropiedadesTurso(propiedadesParaGuardar);
      }
      const pendientesParaGuardar: HipotesisConContexto[] = [];
      for (const h of enrutado.paraRevision) {
        const ctx = contextoPorHipotesis.get(h.id);
        if (!ctx) continue;
        const item = hipotesisPendienteAContexto(ctx.resultado, {
          neuronaId: this.neuronId,
          documento: archivo.nombre,
          driveFileId: archivo.id,
          pagina: ctx.pagina,
          capitulo: ctx.capitulo,
        });
        if (item) pendientesParaGuardar.push(item);
      }
      if (pendientesParaGuardar.length > 0) await guardarLotePendientes(pendientesParaGuardar);
      for (const h of enrutado.descartados) console.log(`      ❌ Rechazado: ${h.motivos.join(' | ')}`);
      totalHallazgos += propiedadesParaGuardar.length;
      contextoPorHipotesis.clear();
    };
    for (const bloque of bloques) {
      if (bloque.fin <= posicionYaCubierta) continue;
      if (esBloqueDescartable(bloque)) {
        console.log(`      🚫 Bloque descartado (nodo "${bloque.tipoNodoDominante}"): ${bloque.capituloActivo ?? capituloActual ?? 'sin capítulo'}`);
        continue;
      }
      const textoBloque = textoCompletoDocumento.slice(bloque.inicio, bloque.fin);
      if (!textoBloque || textoBloque.trim().length < 20) continue;
      ramMateriales.activarDesdeTexto(textoBloque, bloque.inicio);
      ramPropiedades.activarDesdeTexto(textoBloque, bloque.inicio);
      ramValores.activarDesdeTexto(textoBloque, bloque.inicio);
      ramComponentes.activarDesdeTexto(textoBloque, bloque.inicio);
      ramNormas.activarDesdeTexto(textoBloque, bloque.inicio);
      ramCondicionEnsayo.activarDesdeTexto(textoBloque, bloque.inicio);
      const materialResuelto = ramMateriales.entregar();
      const hallazgosPropiedades = ramPropiedades.entregar();
      const hallazgosValores = ramValores.entregar();
      ramComponentes.entregar();
      ramNormas.entregar();
      ramCondicionEnsayo.entregar();
      const entradas = construirEntradasProcesamiento({
        documentoId: archivo.id,
        textoCompleto: textoCompletoDocumento,
        bloque,
        memoria,
        materialResuelto,
        hallazgosPropiedades,
        hallazgosValores,
        catalogoMateriales: catalogoMaterialesNeuronaCentral,
        offsetsPorPagina,
      });
      if (entradas.length === 0 && hallazgosPropiedades.length > 0) console.log(`      ⚠️  ${hallazgosPropiedades.length} propiedades detectadas sin material declarado para el bloque — se descartan sin evaluar`);
      const paginaDelBloque = paginaDePosicion(bloque.inicio);
      const capituloDelBloque = bloque.capituloActivo ?? capituloActual;
      let rechazadosDelBloque = 0;
      for (const entrada of entradas) {
        const resultado = procesarCandidato(entrada);
        if (!resultado.hipotesis) continue;
        if (resultado.hipotesis.estado === 'RECHAZADO') rechazadosDelBloque++;
        contextoPorHipotesis.set(resultado.hipotesis.id, { resultado, pagina: paginaDelBloque, capitulo: capituloDelBloque, bloque });
      }
      if (rechazadosDelBloque > 0) console.log(`      📊 ${rechazadosDelBloque}/${entradas.length} candidatos de este bloque quedaron rechazados`);
      if (contextoPorHipotesis.size >= 50) await guardarLoteAcumulado();
    }
    await guardarLoteAcumulado();
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
