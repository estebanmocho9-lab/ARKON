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
// ============================================================

import { Unidad } from '../tipos/entidades';
import { EstadoUnidad } from '../validacion/validadorDimensional';

export interface ResultadoAsociacionUnidad {
  unidad: Unidad | null;
  estado: EstadoUnidad;
}

function normalizar(t: string): string {
  return t.trim().toLowerCase();
}

function buscarUnidadPorTexto(texto: string, unidades: Unidad[]): Unidad | null {
  const t = normalizar(texto);
  return unidades.find(u => normalizar(u.simbolo) === t || u.variantes_texto.some(v => normalizar(v) === t)) ?? null;
}

// ── Caso EXPLICITA: hay un texto de unidad pegado directamente al
//    valor (ej. lo que ya detectó ramValores.ts para el valor
//    puntual). Caso CONTEXTUAL: no hay unidad pegada, pero SÍ hay
//    un encabezado de columna/sección con una unidad reconocible
//    (Sección 27, ejemplo "Densidad aparente (kg/m³)"). ────────────
export function asociarUnidad(textoUnidadExplicita: string | null, textoEncabezadoContextual: string | null, unidades: Unidad[]): ResultadoAsociacionUnidad {
  if (textoUnidadExplicita) {
    const unidad = buscarUnidadPorTexto(textoUnidadExplicita, unidades);
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
    const unidad = buscarUnidadPorTexto(candidato, unidades);
    if (unidad) return { unidad, estado: 'CONTEXTUAL' };
    return { unidad: null, estado: 'AUSENTE' };
  }

  return { unidad: null, estado: 'AUSENTE' };
}
