// ============================================================
// src/comprehension-neuron/diccionario/unidades.ts
// Registro de Unidades (UNI). Envuelve diccionarios/unidades.ts
// (187 unidades reales, sin tocarlo) y cada una queda vinculada a
// su Magnitud — lo que permite, más adelante, el chequeo de
// compatibilidad dimensional (Regla 6 de tu documento).
// ============================================================

import { UNIDADES } from '../../extraction-neurons/diccionarios/unidades';
import { Id, registroIds } from '../tipos/ids';
import { Unidad } from '../tipos/entidades';
import { obtenerMagnitudPorNombre } from './magnitudes';

// ── Factor multiplicativo hacia la unidad base de la magnitud
//    (Parte 2). Clave = "símbolo::magnitud", igual que la clave de
//    registro. Solo se completan las conversiones que son
//    multiplicación simple y confirmadas — NADA de temperatura acá
//    (°C↔K es afín, se maneja aparte, nunca con un factor). La
//    unidad base de cada magnitud es la que tiene factor 1. ────────
const FACTORES_CONOCIDOS: Record<string, number> = {
  // densidad — base: kg/m3
  'kg/m3::densidad': 1,
  'g/cm3::densidad': 1000, // 1 g/cm³ = 1000 kg/m³

  // resistencia_mecanica — base: kPa (para que MPa/GPa/Pa den enteros redondos hacia abajo también)
  'kPa::resistencia_mecanica': 1,
  'MPa::resistencia_mecanica': 1000,

  // modulo_elastico — base: GPa
  'GPa::modulo_elastico': 1,

  // porcentaje — base: %
  '%::porcentaje': 1,

  // longitud_micro — base: nm
  'nm::longitud_micro': 1,
  'µm::longitud_micro': 1000,
  'mm::longitud_micro': 1000000,

  // area_especifica — base: m2/g
  'm2/g::area_especifica': 1,

  // volumen_especifico — base: cm3/g
  'cm3/g::volumen_especifico': 1,
};

let cache: Unidad[] | null = null;

export function obtenerUnidades(): Unidad[] {
  if (cache) return cache;
  cache = UNIDADES.map(u => {
    const magnitud = obtenerMagnitudPorNombre(u.magnitud);
    if (!magnitud) {
      // Esto solo pasaría si una unidad referencia una magnitud que
      // ninguna propiedad usa — señal de un typo en el diccionario
      // de origen, no algo para tapar en silencio.
      throw new Error(
        `Unidad "${u.unidad}" referencia la magnitud "${u.magnitud}", que ninguna propiedad de propiedades.ts declara. Revisar diccionarios/unidades.ts.`
      );
    }
    // Clave compuesta símbolo+magnitud: el mismo símbolo ("%", "MPa",
    // "°C"...) se reutiliza legítimamente en varias magnitudes
    // distintas de tu catálogo real — cada combinación es una
    // entidad UNI propia, no la misma repetida.
    const claveCompuesta = `${u.unidad}::${u.magnitud}`;
    return {
      id: registroIds.obtenerOAsignar('UNI', claveCompuesta) as Id<'UNI'>,
      simbolo: u.unidad,
      variantes_texto: u.variantes_texto,
      magnitud: magnitud.id,
      factorAUnidadBase: FACTORES_CONOCIDOS[claveCompuesta] ?? null,
    };
  });
  return cache;
}

export function obtenerUnidadPorId(id: Id<'UNI'>): Unidad | null {
  return obtenerUnidades().find(u => u.id === id) ?? null;
}

export function obtenerUnidadesDeMagnitud(magnitud: Id<'MAG'>): Unidad[] {
  return obtenerUnidades().filter(u => u.magnitud === magnitud);
}

// ── ¿Esta unidad concreta es válida para esta propiedad? Esto es
//    lo que directamente resuelve el caso "AASHTO T 358" que
//    encontramos: "T" no pertenece a ninguna magnitud de
//    "Resistividad superficial", así que esta función devuelve
//    false y el validador de unidades (próximo lote) descarta el
//    emparejamiento. ────────────────────────────────────────────
export function unidadEsCompatibleConPropiedad(unidad: Id<'UNI'>, magnitudesPropiedad: Id<'MAG'>[]): boolean {
  const u = obtenerUnidadPorId(unidad);
  if (!u) return false;
  return magnitudesPropiedad.includes(u.magnitud);
}
