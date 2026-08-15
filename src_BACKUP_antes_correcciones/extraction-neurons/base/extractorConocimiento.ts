// ============================================================
// src/extraction-neurons/base/extractorConocimiento.ts
// SEGUNDO extractor, que corre AL LADO de motorExtraccion.ts
// (no lo reemplaza, no le saca nada). Este busca dos cosas que
// motorExtraccion.ts no busca:
//
//   1. Conocimiento conceptual de materiales (identidad, origen,
//      composicion, proposito, compatibilidad con motivo)
//   2. Reglas causales (aumenta/disminuye/provoca entre dos
//      propiedades conocidas)
//
// Misma filosofia que todo el sistema: regex + diccionario,
// nada de IA. Los resultados van a Turso, a las tablas
// conocimiento_material y reglas_extraidas, con estado
// 'pendiente' — no se usan para razonar hasta que se validen.
// ============================================================

import { PROPIEDADES } from '../diccionarios/propiedades';
import { CONECTORES, EntradaConector } from '../diccionarios/conectores';
import { PATRONES_CONCEPTUALES } from '../diccionarios/patronesConceptuales';
import { EntradaMaterial } from './tipos';

const VENTANA_REGLA = 200; // caracteres a cada lado del conector, para buscar las 2 propiedades

function escaparRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// --------------------------------------------
// RESULTADOS
// --------------------------------------------

export interface ConocimientoCandidato {
  material: string;
  tipo_conocimiento: 'identidad' | 'origen' | 'composicion' | 'proposito' | 'compatibilidad';
  contenido: string;
  porcentaje: number | null;
  mecanismo: string | null;
}

export interface ReglaCandidata {
  propiedad_causa: string;
  direccion_causa: 'aumenta' | 'disminuye' | null;
  propiedad_efecto: string;
  direccion_efecto: 'aumenta' | 'disminuye';
  condicion: string | null;
  confianza: number;
}

// --------------------------------------------
// Buscar el material mas cercano a una posicion del texto
// (reutiliza el mismo diccionario de materiales que ya usa
// motorExtraccion.ts, pasado como parametro)
// --------------------------------------------

export function materialMasCercano(
  texto: string,
  posicion: number,
  materiales: EntradaMaterial[]
): string | null {
  const inicio = Math.max(0, posicion - 300);
  const entorno = texto.substring(inicio, posicion + 100);

  let mejor: { nombre: string; distancia: number } | null = null;

  for (const entrada of materiales) {
    const terminos = [entrada.nombre_es, entrada.nombre_en, ...(entrada.sinonimos || [])];
    for (const termino of terminos) {
      if (!termino || termino.length < 3) continue;
      const regex = new RegExp(`\\b${escaparRegex(termino)}\\b`, 'gi');
      let m: RegExpExecArray | null;
      while ((m = regex.exec(entorno)) !== null) {
        const distancia = Math.abs(entorno.length - 100 - m.index);
        if (!mejor || distancia < mejor.distancia) {
          mejor = { nombre: entrada.nombre_es, distancia };
        }
      }
    }
  }

  return mejor ? mejor.nombre : null;
}

// --------------------------------------------
// EXTRAER CONOCIMIENTO CONCEPTUAL de una pagina
// --------------------------------------------

export function extraerConocimientoConceptual(
  texto: string,
  materiales: EntradaMaterial[]
): ConocimientoCandidato[] {
  const resultados: ConocimientoCandidato[] = [];
  const textoNormalizado = texto.replace(/\s+/g, ' ');

  for (const patron of PATRONES_CONCEPTUALES) {
    const regexGlobal = new RegExp(patron.regex.source, patron.regex.flags.includes('g') ? patron.regex.flags : patron.regex.flags + 'g');
    let match: RegExpExecArray | null;

    while ((match = regexGlobal.exec(textoNormalizado)) !== null) {
      const material = materialMasCercano(textoNormalizado, match.index, materiales);
      if (!material) continue; // sin material identificado, no vale la pena guardarlo

      const porcentajeMatch = match[1] ? parseFloat(match[1].replace(',', '.')) : null;

      resultados.push({
        material,
        tipo_conocimiento: patron.tipo,
        contenido: match[0].trim().slice(0, 300),
        porcentaje: porcentajeMatch,
        mecanismo: null, // se completa a mano en la revision, si el contexto lo sugiere
      });
    }
  }

  return resultados;
}

// --------------------------------------------
// EXTRAER REGLAS CAUSALES de una pagina
// Busca un conector, y dentro de la ventana alrededor, dos
// propiedades conocidas — una antes (causa) y una despues (efecto).
// --------------------------------------------

export function extraerReglasCausales(texto: string): ReglaCandidata[] {
  const resultados: ReglaCandidata[] = [];
  const textoNormalizado = texto.replace(/\s+/g, ' ');

  const conectoresCausales = CONECTORES.filter(
    (c) => c.tipo === 'causal_positivo' || c.tipo === 'causal_negativo' || c.tipo === 'causal_directo'
  );

  for (const conector of conectoresCausales) {
    const terminos = [conector.nombre_es, ...conector.sinonimos];

    for (const termino of terminos) {
      const regex = new RegExp(`\\b${escaparRegex(termino)}\\b`, 'gi');
      let match: RegExpExecArray | null;

      while ((match = regex.exec(textoNormalizado)) !== null) {
        const inicioVentana = Math.max(0, match.index - VENTANA_REGLA);
        const finVentana = Math.min(textoNormalizado.length, match.index + termino.length + VENTANA_REGLA);
        const antes = textoNormalizado.substring(inicioVentana, match.index);
        const despues = textoNormalizado.substring(match.index + termino.length, finVentana);

        const propiedadAntes = buscarPropiedadMasCercana(antes, true);
        const propiedadDespues = buscarPropiedadMasCercana(despues, false);

        if (!propiedadAntes || !propiedadDespues) continue;
        if (propiedadAntes === propiedadDespues) continue;

        const direccionEfecto: 'aumenta' | 'disminuye' =
          conector.tipo === 'causal_negativo' ? 'disminuye' : 'aumenta';

        const condicion = buscarCondicionPorcentaje(despues);

        resultados.push({
          propiedad_causa: propiedadAntes,
          direccion_causa: null, // se infiere de si la propia frase menciona "aumenta"/"a mayor" antes del conector; se deja para revision manual si no es obvio
          propiedad_efecto: propiedadDespues,
          direccion_efecto: direccionEfecto,
          condicion,
          confianza: 0.6, // confianza baja de entrada a proposito: el lenguaje causal es ambiguo, se sube al validar
        });
      }
    }
  }

  return resultados;
}

// -- Busca la propiedad conocida mas cercana al borde del fragmento --
function buscarPropiedadMasCercana(fragmento: string, buscarDesdeElFinal: boolean): string | null {
  let mejor: { nombre: string; distancia: number } | null = null;

  for (const propiedad of PROPIEDADES) {
    const terminos = [propiedad.nombre_es, propiedad.nombre_en, ...propiedad.sinonimos];
    for (const termino of terminos) {
      if (!termino) continue;
      const regex = new RegExp(`\\b${escaparRegex(termino)}\\b`, 'gi');
      let m: RegExpExecArray | null;
      while ((m = regex.exec(fragmento)) !== null) {
        const distancia = buscarDesdeElFinal
          ? fragmento.length - m.index
          : m.index;
        if (!mejor || distancia < mejor.distancia) {
          mejor = { nombre: propiedad.id, distancia };
        }
      }
    }
  }

  return mejor ? mejor.nombre : null;
}

// -- Busca un porcentaje/umbral cerca del conector, para la condicion --
function buscarCondicionPorcentaje(fragmento: string): string | null {
  const patron = /(?:hasta\s+(?:un\s+)?|por\s+encima\s+de\s+|por\s+debajo\s+de\s+)(\d{1,3}(?:[.,]\d+)?)\s*%/i;
  const match = patron.exec(fragmento);
  return match ? match[0].trim() : null;
}
