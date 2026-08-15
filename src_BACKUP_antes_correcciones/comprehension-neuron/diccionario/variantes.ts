// ============================================================
// src/comprehension-neuron/diccionario/variantes.ts
// Registro de Variantes (VAR). Esta es la pieza que agregaste vos
// mismo a la especificación: separar el término base del
// modificador, para que "Vermiculita" y "Vermiculita Expandida"
// nunca se traten como si fueran lo mismo sin evidencia.
//
// Se genera automáticamente detectando, en el nombre de cada uno
// de tus 21 materiales reales, si tiene un MODIFICADOR conocido
// (Expandida, Molido/Molida, Triturado, Activado, Hidráulica...).
// Si lo tiene, se registra la Variante: término base + modificador
// + a qué MAT corresponde la forma completa.
//
// Uso concreto: si un PDF dice solo "vermiculita" (sin
// "expandida"), el validador semántico (próximo lote) va a
// encontrar que "vermiculita" es un término base con una variante
// registrada, y por Regla 2 de tu documento ("nunca convertir un
// concepto en otro más específico sin evidencia contextual") NO
// debe resolverlo automáticamente a MAT-Vermiculita-Expandida —
// tiene que quedar como concepto sin resolver, o resolver a un
// nivel más genérico si existiera.
// ============================================================

import { obtenerMateriales } from './materiales';
import { Id, registroIds } from '../tipos/ids';
import { Variante } from '../tipos/entidades';

// ── Modificadores conocidos, en español. Lista corta y explícita
//    a propósito — un modificador mal detectado generaría una
//    Variante falsa, así que se prefiere una lista chica y
//    correcta antes que una heurística amplia y ruidosa. ──────────
const MODIFICADORES_CONOCIDOS = [
  'expandida', 'expandido',
  'molida', 'molido',
  'triturado', 'triturada',
  'activado', 'activada',
  'hidráulica', 'hidraulica',
  'industrial',
];

let cache: Variante[] | null = null;

export async function obtenerVariantes(): Promise<Variante[]> {
  if (cache) return cache;
  const materiales = await obtenerMateriales();
  const variantes: Variante[] = [];

  for (const material of materiales) {
    const palabras = material.nombre_principal.toLowerCase().split(/\s+/);
    const modificadorEncontrado = palabras.find(p => MODIFICADORES_CONOCIDOS.includes(p));
    if (!modificadorEncontrado) continue;

    const terminoBase = palabras.filter(p => p !== modificadorEncontrado).join(' ');
    const claveVariante = `${terminoBase}+${modificadorEncontrado}`;

    variantes.push({
      id: registroIds.obtenerOAsignar('VAR', claveVariante) as Id<'VAR'>,
      terminoBase,
      modificador: modificadorEncontrado,
      materialResultante: material.id,
    });
  }

  cache = variantes;
  return variantes;
}

// ── ¿Este término base tiene alguna variante registrada? Si la
//    tiene, el validador semántico sabe que NO puede resolver el
//    término base directo a un material sin más evidencia. ────────
export async function tieneVariantesConocidas(terminoBase: string): Promise<Variante[]> {
  const variantes = await obtenerVariantes();
  const t = terminoBase.trim().toLowerCase();
  return variantes.filter(v => v.terminoBase === t);
}
