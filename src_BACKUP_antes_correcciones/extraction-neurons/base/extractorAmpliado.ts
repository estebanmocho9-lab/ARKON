// ============================================================
// src/extraction-neurons/base/extractorAmpliado.ts
// Extractores de las 5 categorias nuevas: especificaciones de
// diseno, reacciones quimicas, hallazgos experimentales, datos
// de mercado, y tablas comparativas.
//
// Reutiliza materialMasCercano de extractorConocimiento.ts para
// no duplicar esa logica.
// ============================================================

import {
  PATRONES_DISENO,
  PATRONES_QUIMICA,
  PATRONES_EXPERIMENTALES,
  PATRONES_MERCADO,
  PatronAmpliado,
} from '../diccionarios/patronesAmpliados';
import { materialMasCercano } from './extractorConocimiento';
import { EntradaMaterial } from './tipos';
import { PROPIEDADES } from '../diccionarios/propiedades';

// --------------------------------------------
// TIPOS DE RESULTADO
// --------------------------------------------

export interface EspecificacionDiseno {
  material: string;
  tipo_especificacion: string;
  contenido: string;
}

export interface ReaccionQuimica {
  material: string;
  tipo_reaccion: string;
  contenido: string;
}

export interface HallazgoExperimental {
  material: string;
  tipo_hallazgo: string;
  contenido: string;
}

export interface DatoMercado {
  material: string;
  tipo_dato: string;
  contenido: string;
}

export interface TablaComparativa {
  texto_tabla: string;
  materiales_mencionados: string[];
  propiedades_mencionadas: string[];
}

// --------------------------------------------
// FUNCION GENERICA: aplica una lista de patrones,
// busca el material mas cercano a cada match
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
// LAS 4 FUNCIONES NARRATIVAS
// --------------------------------------------

export function extraerEspecificacionesDiseno(
  texto: string,
  materiales: EntradaMaterial[]
): EspecificacionDiseno[] {
  return extraerConPatrones(texto, PATRONES_DISENO, materiales).map((r) => ({
    material: r.material,
    tipo_especificacion: r.categoria,
    contenido: r.contenido,
  }));
}

export function extraerReaccionesQuimicas(
  texto: string,
  materiales: EntradaMaterial[]
): ReaccionQuimica[] {
  return extraerConPatrones(texto, PATRONES_QUIMICA, materiales).map((r) => ({
    material: r.material,
    tipo_reaccion: r.categoria,
    contenido: r.contenido,
  }));
}

export function extraerHallazgosExperimentales(
  texto: string,
  materiales: EntradaMaterial[]
): HallazgoExperimental[] {
  return extraerConPatrones(texto, PATRONES_EXPERIMENTALES, materiales).map((r) => ({
    material: r.material,
    tipo_hallazgo: r.categoria,
    contenido: r.contenido,
  }));
}

export function extraerDatosMercado(
  texto: string,
  materiales: EntradaMaterial[]
): DatoMercado[] {
  return extraerConPatrones(texto, PATRONES_MERCADO, materiales).map((r) => ({
    material: r.material,
    tipo_dato: r.categoria,
    contenido: r.contenido,
  }));
}

// --------------------------------------------
// TABLAS COMPARATIVAS — logica distinta: no busca un patron de
// frase, busca ZONAS del texto con muchos numeros juntos y 2+
// materiales o 2+ propiedades mencionadas ahi — eso sugiere una
// tabla con datos comparativos. No se intenta parsear celda por
// celda (eso queda para revision manual), solo se guarda el
// bloque entero como candidato.
// --------------------------------------------

export function extraerTablasComparativas(
  texto: string,
  materiales: EntradaMaterial[]
): TablaComparativa[] {
  const resultados: TablaComparativa[] = [];
  const textoNormalizado = texto.replace(/\s+/g, ' ');

  // Dividir en bloques de ~400 caracteres para evaluar densidad de numeros
  const TAMANO_BLOQUE = 400;
  for (let i = 0; i < textoNormalizado.length; i += TAMANO_BLOQUE) {
    const bloque = textoNormalizado.substring(i, i + TAMANO_BLOQUE);

    const numerosEnBloque = (bloque.match(/\d+([.,]\d+)?/g) || []).length;
    if (numerosEnBloque < 6) continue; // poca densidad numerica, no parece tabla

    const materialesEncontrados = new Set<string>();
    for (const m of materiales) {
      const terminos = [m.nombre_es, m.nombre_en, ...(m.sinonimos || [])];
      for (const t of terminos) {
        if (t && t.length > 2 && bloque.toLowerCase().includes(t.toLowerCase())) {
          materialesEncontrados.add(m.nombre_es);
        }
      }
    }

    const propiedadesEncontradas = new Set<string>();
    for (const p of PROPIEDADES) {
      const terminos = [p.nombre_es, p.nombre_en, ...p.sinonimos];
      for (const t of terminos) {
        if (t && bloque.toLowerCase().includes(t.toLowerCase())) {
          propiedadesEncontradas.add(p.nombre_es);
        }
      }
    }

    if (materialesEncontrados.size >= 2 || propiedadesEncontradas.size >= 2) {
      resultados.push({
        texto_tabla: bloque.trim(),
        materiales_mencionados: [...materialesEncontrados],
        propiedades_mencionadas: [...propiedadesEncontradas],
      });
    }
  }

  return resultados;
}
