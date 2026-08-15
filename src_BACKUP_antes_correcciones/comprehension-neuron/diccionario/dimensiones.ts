// ============================================================
// src/comprehension-neuron/diccionario/dimensiones.ts
// Catálogo de Dimensiones (DIM), en notación M L T Θ I N J (masa,
// longitud, tiempo, temperatura, corriente eléctrica, cantidad de
// sustancia, intensidad luminosa).
//
// SOLO están completas las 26 magnitudes COMUNES (compartidas por
// varias propiedades de tu catálogo real) — son física de manual,
// de bajo riesgo de error. Las ~155 magnitudes ultra-específicas
// que trae tu catálogo (m_seebeck_coefficient_thermopower,
// m_critical_current_density, etc.) NO tienen fórmula asignada acá
// a propósito: son propiedades de materiales avanzados donde una
// asignación apurada podría estar mal, y tu propia especificación
// dice "PENDIENTE antes que inventar" (Regla 21). Quedan con
// dimension: 'PENDIENTE_DEFINIR' hasta que las revisemos juntos,
// de a poco, priorizando las que realmente aparezcan en tus
// extracciones reales — no las 155 de una sentada.
// ============================================================

import { Id, registroIds } from '../tipos/ids';
import { Dimension, VectorDimension } from '../tipos/entidades';

const CERO: VectorDimension = { M: 0, L: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };
function v(parcial: Partial<VectorDimension>): VectorDimension {
  return { ...CERO, ...parcial };
}

// ── Fórmula dimensional real, para las magnitudes comunes de tu
//    catálogo. Clave = el mismo string de `magnitud` que ya usan
//    propiedades.ts y unidades.ts. `vector: null` en 'tasa' y 'cec'
//    a propósito — son magnitudes cuya dimensión física estándar
//    depende del contexto/convención de la disciplina, así que
//    tienen fórmula descriptiva pero NO vector comparable todavía
//    (se prefiere UNKNOWN a un vector adivinado). ──────────────────
const DIMENSIONES_CONOCIDAS: Record<string, { nombre: string; formula: string; vector: VectorDimension | null }> = {
  densidad: { nombre: 'Densidad', formula: 'M L⁻³', vector: v({ M: 1, L: -3 }) },
  volumen_especifico: { nombre: 'Volumen específico', formula: 'M⁻¹ L³', vector: v({ M: -1, L: 3 }) },
  area_especifica: { nombre: 'Área específica', formula: 'M⁻¹ L²', vector: v({ M: -1, L: 2 }) },
  longitud_micro: { nombre: 'Longitud', formula: 'L', vector: v({ L: 1 }) },
  angulo: { nombre: 'Ángulo', formula: 'adimensional', vector: v({}) },
  temperatura: { nombre: 'Temperatura', formula: 'Θ', vector: v({ Theta: 1 }) },
  ph: { nombre: 'pH', formula: 'adimensional', vector: v({}) },
  porcentaje: { nombre: 'Fracción / porcentaje', formula: 'adimensional', vector: v({}) },
  adimensional: { nombre: 'Adimensional', formula: 'adimensional', vector: v({}) },
  resistencia_mecanica: { nombre: 'Presión / esfuerzo mecánico', formula: 'M L⁻¹ T⁻²', vector: v({ M: 1, L: -1, T: -2 }) },
  modulo_elastico: { nombre: 'Módulo elástico', formula: 'M L⁻¹ T⁻²', vector: v({ M: 1, L: -1, T: -2 }) },
  dureza: { nombre: 'Dureza (escala convencional)', formula: 'adimensional (escala propia, no SI)', vector: v({}) },
  conductividad_termica: { nombre: 'Conductividad térmica', formula: 'M L T⁻³ Θ⁻¹', vector: v({ M: 1, L: 1, T: -3, Theta: -1 }) },
  difusividad_termica: { nombre: 'Difusividad térmica', formula: 'L² T⁻¹', vector: v({ L: 2, T: -1 }) },
  calor_especifico: { nombre: 'Calor específico', formula: 'L² T⁻² Θ⁻¹', vector: v({ L: 2, T: -2, Theta: -1 }) },
  expansion_termica: { nombre: 'Coeficiente de expansión térmica', formula: 'Θ⁻¹', vector: v({ Theta: -1 }) },
  energia_masica: { nombre: 'Energía específica (por masa)', formula: 'L² T⁻²', vector: v({ L: 2, T: -2 }) },
  energia_superficial: { nombre: 'Energía superficial / tensión superficial', formula: 'M T⁻²', vector: v({ M: 1, T: -2 }) },
  conductividad_electrica: { nombre: 'Conductividad eléctrica', formula: 'I² T³ M⁻¹ L⁻³', vector: v({ I: 2, T: 3, M: -1, L: -3 }) },
  potencial_electrico: { nombre: 'Potencial eléctrico', formula: 'M L² T⁻³ I⁻¹', vector: v({ M: 1, L: 2, T: -3, I: -1 }) },
  conductividad_hidraulica: { nombre: 'Conductividad hidráulica', formula: 'L T⁻¹', vector: v({ L: 1, T: -1 }) },
  permeabilidad: { nombre: 'Permeabilidad', formula: 'L²', vector: v({ L: 2 }) },
  difusion: { nombre: 'Coeficiente de difusión', formula: 'L² T⁻¹', vector: v({ L: 2, T: -1 }) },
  tasa: { nombre: 'Tasa / velocidad de proceso', formula: 'depende del contexto — revisar caso a caso', vector: null },
  cec: { nombre: 'Capacidad de intercambio catiónico', formula: 'convención propia de la disciplina', vector: null },
  huella_carbono: { nombre: 'Huella de carbono', formula: 'adimensional en la práctica (masa CO₂-eq / masa producto)', vector: v({}) },
};

let cache: Map<string, Dimension> | null = null;

function construirCache(): Map<string, Dimension> {
  const mapa = new Map<string, Dimension>();
  for (const [magnitud, info] of Object.entries(DIMENSIONES_CONOCIDAS)) {
    const id = registroIds.obtenerOAsignar('DIM', magnitud) as Id<'DIM'>;
    mapa.set(magnitud, { id, nombre: info.nombre, formula: info.formula, vector: info.vector });
  }
  return mapa;
}

// ── Lo que usa magnitudes.ts para cada magnitud real: si es una
//    de las 26 conocidas, devuelve el ID de su Dimension. Si es
//    una de las especializadas sin revisar, devuelve el literal
//    'PENDIENTE_DEFINIR' — NUNCA inventa una fórmula. ───────────────
export function obtenerDimensionPara(nombreMagnitud: string): Id<'DIM'> | 'PENDIENTE_DEFINIR' {
  if (!cache) cache = construirCache();
  return cache.get(nombreMagnitud)?.id ?? 'PENDIENTE_DEFINIR';
}

export function obtenerDimensiones(): Dimension[] {
  if (!cache) cache = construirCache();
  return [...cache.values()];
}

// ── Dos dimensiones son compatibles si tienen la misma fórmula.
//    Esto es lo que usa el validador dimensional (próximo lote)
//    para decidir si una unidad puede o no ir con una propiedad. ──
export function sonDimensionesCompatibles(a: Id<'DIM'>, b: Id<'DIM'>): boolean {
  if (a === b) return true;
  const dims = obtenerDimensiones();
  const fa = dims.find(d => d.id === a)?.formula;
  const fb = dims.find(d => d.id === b)?.formula;
  return !!fa && fa === fb;
}
