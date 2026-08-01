// ============================================================
// src/extraction-neurons/base/extractorESP001.ts
// Extractores de las 10 categorías nuevas de ESP-001: Significado,
// Función, Factores que modifican el valor, Relaciones, Procesos,
// Aplicaciones, Ventajas, Limitaciones, Identidad extendida y
// Bibliografía.
//
// Archivo 100% nuevo. No modifica extractorAmpliado.ts: la función
// genérica de "aplicar patrones + buscar material más cercano" se
// repite acá (son ~15 líneas) en vez de tocar ese archivo, tal
// como se pidió.
// ============================================================

import {
  PATRONES_SIGNIFICADO,
  PATRONES_FUNCION,
  PATRONES_FACTORES,
  PATRONES_RELACIONES,
  PATRONES_PROCESOS,
  PATRONES_APLICACIONES,
  PATRONES_VENTAJAS,
  PATRONES_LIMITACIONES,
  PATRONES_IDENTIDAD_EXTENDIDA,
  PATRONES_BIBLIOGRAFIA,
} from '../diccionarios/patronesESP001';
import { PatronAmpliado } from '../diccionarios/patronesAmpliados';
import { materialMasCercano } from './extractorConocimiento';
import { EntradaMaterial } from './tipos';

// --------------------------------------------
// TIPOS DE RESULTADO (uno por categoría, mismo estilo que
// EspecificacionDiseno / ReaccionQuimica / etc. de extractorAmpliado.ts)
// --------------------------------------------

export interface SignificadoPropiedad { material: string; tipo: string; contenido: string; }
export interface FuncionPropiedad { material: string; tipo: string; contenido: string; }
export interface FactorModificador { material: string; tipo: string; contenido: string; }
export interface RelacionPropiedad { material: string; tipo: string; contenido: string; }
export interface ProcesoPropiedad { material: string; tipo: string; contenido: string; }
export interface AplicacionPropiedad { material: string; tipo: string; contenido: string; }
export interface VentajaPropiedad { material: string; tipo: string; contenido: string; }
export interface LimitacionPropiedad { material: string; tipo: string; contenido: string; }
export interface IdentidadExtendida { material: string; tipo: string; contenido: string; }
export interface CitaBibliografica { material: string; tipo: string; contenido: string; }

// --------------------------------------------
// FUNCION GENERICA: aplica una lista de patrones, busca el
// material mas cercano a cada match (misma logica que ya usaba
// extractorAmpliado.ts, repetida acá para no tocar ese archivo)
// --------------------------------------------

function extraerConPatrones(
  texto: string,
  patrones: PatronAmpliado[],
  materiales: EntradaMaterial[]
): { material: string; categoria: string; contenido: string }[] {
  const resultados: { material: string; categoria: string; contenido: string }[] = [];
  const textoNormalizado = texto.replace(/\s+/g, ' ');

  for (const patron of patrones) {
    const flags = patron.regex.flags.includes('g') ? patron.regex.flags : patron.regex.flags + 'g';
    const regexGlobal = new RegExp(patron.regex.source, flags);
    let match: RegExpExecArray | null;

    while ((match = regexGlobal.exec(textoNormalizado)) !== null) {
      const material = materialMasCercano(textoNormalizado, match.index, materiales);
      if (!material) continue;

      resultados.push({
        material,
        categoria: patron.categoria,
        contenido: match[0].trim().slice(0, 300),
      });
    }
  }

  return resultados;
}

// --------------------------------------------
// LAS 10 FUNCIONES DE EXTRACCIÓN
// --------------------------------------------

export function extraerSignificado(texto: string, materiales: EntradaMaterial[]): SignificadoPropiedad[] {
  return extraerConPatrones(texto, PATRONES_SIGNIFICADO, materiales).map(r => ({ material: r.material, tipo: r.categoria, contenido: r.contenido }));
}

export function extraerFuncion(texto: string, materiales: EntradaMaterial[]): FuncionPropiedad[] {
  return extraerConPatrones(texto, PATRONES_FUNCION, materiales).map(r => ({ material: r.material, tipo: r.categoria, contenido: r.contenido }));
}

export function extraerFactoresModificadores(texto: string, materiales: EntradaMaterial[]): FactorModificador[] {
  return extraerConPatrones(texto, PATRONES_FACTORES, materiales).map(r => ({ material: r.material, tipo: r.categoria, contenido: r.contenido }));
}

export function extraerRelaciones(texto: string, materiales: EntradaMaterial[]): RelacionPropiedad[] {
  return extraerConPatrones(texto, PATRONES_RELACIONES, materiales).map(r => ({ material: r.material, tipo: r.categoria, contenido: r.contenido }));
}

export function extraerProcesos(texto: string, materiales: EntradaMaterial[]): ProcesoPropiedad[] {
  return extraerConPatrones(texto, PATRONES_PROCESOS, materiales).map(r => ({ material: r.material, tipo: r.categoria, contenido: r.contenido }));
}

export function extraerAplicaciones(texto: string, materiales: EntradaMaterial[]): AplicacionPropiedad[] {
  return extraerConPatrones(texto, PATRONES_APLICACIONES, materiales).map(r => ({ material: r.material, tipo: r.categoria, contenido: r.contenido }));
}

export function extraerVentajas(texto: string, materiales: EntradaMaterial[]): VentajaPropiedad[] {
  return extraerConPatrones(texto, PATRONES_VENTAJAS, materiales).map(r => ({ material: r.material, tipo: r.categoria, contenido: r.contenido }));
}

export function extraerLimitaciones(texto: string, materiales: EntradaMaterial[]): LimitacionPropiedad[] {
  return extraerConPatrones(texto, PATRONES_LIMITACIONES, materiales).map(r => ({ material: r.material, tipo: r.categoria, contenido: r.contenido }));
}

export function extraerIdentidadExtendida(texto: string, materiales: EntradaMaterial[]): IdentidadExtendida[] {
  return extraerConPatrones(texto, PATRONES_IDENTIDAD_EXTENDIDA, materiales).map(r => ({ material: r.material, tipo: r.categoria, contenido: r.contenido }));
}

export function extraerBibliografia(texto: string, materiales: EntradaMaterial[]): CitaBibliografica[] {
  return extraerConPatrones(texto, PATRONES_BIBLIOGRAFIA, materiales).map(r => ({ material: r.material, tipo: r.categoria, contenido: r.contenido }));
}
