// ============================================================
// src/comprehension-neuron/razonamiento/asociarUnidad.ts
// Decide si un valor tiene unidad EXPLICITA, CONTEXTUAL, AUSENTE,
// o NO_RECONOCIDA — el EstadoUnidad que ya definió la Parte 2 en
// validadorDimensional.ts (se reusa desde ahí, no se duplica el
// tipo).
//
// Sección 28, muy importante: esta función NUNCA decide a qué
// material pertenece el valor — eso es asociarValor.ts. Acá solo
// se resuelve la unidad.
//
// FIX (ambigüedad de símbolo repetido entre magnitudes): en
// diccionarios/unidades.ts el mismo símbolo de texto ("%", "°C",
// "MPa", "GPa", "m2/s"... hasta 18 casos con "Adimensional") existe
// como entidad UNI distinta para cada magnitud que lo usa — es
// intencional (Regla 6: cada combinación símbolo+magnitud es una
// entidad propia). El problema era que buscarUnidadPorTexto elegía
// SIEMPRE la primera coincidencia del array, sin importar a qué
// propiedad se le estaba buscando la unidad — así un candidato de
// "%" para una propiedad de magnitud "porcentaje" podía terminar
// resuelto contra "%::area_especifica" o cualquier otra que
// apareciera antes en el catálogo, y el validador dimensional lo
// rechazaba como incompatible aunque el dato fuera correcto. Ahora
// se le pasa el listado de magnitudes válidas de la propiedad
// (Propiedad.magnitudes) y, si hay más de una unidad que matchea el
// mismo texto, se prioriza la que ya pertenece a esa propiedad.
// ============================================================

import { Unidad } from '../tipos/entidades';
import { Id } from '../tipos/ids';
import { EstadoUnidad } from '../validacion/validadorDimensional';

export interface ResultadoAsociacionUnidad {
  unidad: Unidad | null;
  estado: EstadoUnidad;
}

function normalizar(t: string): string {
  return t.trim().toLowerCase();
}

// ── Devuelve TODAS las unidades cuyo texto matchea (antes se
//    devolvía solo la primera con .find()) — necesario para poder
//    desambiguar después por magnitud. ─────────────────────────────
function buscarUnidadesPorTexto(texto: string, unidades: Unidad[]): Unidad[] {
  const t = normalizar(texto);
  return unidades.filter(u => normalizar(u.simbolo) === t || u.variantes_texto.some(v => normalizar(v) === t));
}

// ── De las candidatas que matchean el mismo texto, prioriza la que
//    pertenece a una magnitud válida para la propiedad que se está
//    evaluando. Si ninguna candidata coincide con esas magnitudes
//    (o no se pasó la lista), cae al comportamiento viejo: la
//    primera — pero ahora es un fallback consciente, no el único
//    camino. ──────────────────────────────────────────────────────
function elegirUnidad(candidatas: Unidad[], magnitudesPropiedad: Id<'MAG'>[] | undefined): Unidad | null {
  if (candidatas.length === 0) return null;
  if (candidatas.length === 1) return candidatas[0];
  if (magnitudesPropiedad && magnitudesPropiedad.length > 0) {
    const match = candidatas.find(u => magnitudesPropiedad.includes(u.magnitud));
    if (match) return match;
  }
  return candidatas[0];
}

// ── Caso EXPLICITA: hay un texto de unidad pegado directamente al
//    valor (ej. lo que ya detectó ramValores.ts para el valor
//    puntual). Caso CONTEXTUAL: no hay unidad pegada, pero SÍ hay
//    un encabezado de columna/sección con una unidad reconocible
//    (Sección 27, ejemplo "Densidad aparente (kg/m³)"). ────────────
export function asociarUnidad(
  textoUnidadExplicita: string | null,
  textoEncabezadoContextual: string | null,
  unidades: Unidad[],
  magnitudesPropiedad?: Id<'MAG'>[]
): ResultadoAsociacionUnidad {
  if (textoUnidadExplicita) {
    const candidatas = buscarUnidadesPorTexto(textoUnidadExplicita, unidades);
    const unidad = elegirUnidad(candidatas, magnitudesPropiedad);
    if (unidad) return { unidad, estado: 'EXPLICITA' };
    return { unidad: null, estado: 'NO_RECONOCIDA' };
  }

  if (textoEncabezadoContextual) {
    // El encabezado suele traer la unidad entre paréntesis: "Densidad
    // aparente (kg/m³)" — se busca cualquier fragmento del
    // encabezado que matchee una unidad conocida, sin asumir que
    // TODO el encabezado es la unidad.
    const match = textoEncabezadoContextual.match(/\(([^)]+)\)/);
    const candidato = match ? match[1] : textoEncabezadoContextual;
    const candidatas = buscarUnidadesPorTexto(candidato, unidades);
    const unidad = elegirUnidad(candidatas, magnitudesPropiedad);
    if (unidad) return { unidad, estado: 'CONTEXTUAL' };
    return { unidad: null, estado: 'AUSENTE' };
  }

  return { unidad: null, estado: 'AUSENTE' };
}