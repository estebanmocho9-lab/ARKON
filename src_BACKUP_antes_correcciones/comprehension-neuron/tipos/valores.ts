// ============================================================
// src/comprehension-neuron/tipos/valores.ts
// VAL — un valor encontrado en el texto. Deliberadamente NO sabe
// a qué propiedad ni a qué material pertenece — eso lo decide una
// Relación (relaciones.ts), después de la validación. Acá solo se
// guarda qué es el número, tal como lo dijiste: "no le damos al
// valor un significado por sí solo".
// ============================================================

import { Id } from './ids';

export interface Valor {
  id: Id<'VAL'>;
  texto_original: string; // "120 kg/m³", tal cual apareció
  numero: number;
  // Unidad tal como se detectó (puede ser null si el número
  // apareció sin unidad reconocible al lado).
  unidad: Id<'UNI'> | null;

  valor_minimo: number | null;
  valor_maximo: number | null;
  incertidumbre: number | null; // el "±0.5" de "20 ± 0.5 MPa", si lo hay
  operador: '=' | '<' | '>' | '<=' | '>=' | '~' | null; // "menor a 5%" → operador '<'
  aproximacion: boolean; // true si el texto dice "aprox.", "~", "cerca de"...

  // Conversión: el valor SIEMPRE se guarda en su unidad original.
  // La normalización (Regla 20 de tu documento) es un campo
  // aparte, nunca reemplaza al original.
  normalizado: {
    numero: number;
    unidad: Id<'UNI'>;
  } | null;

  posicionAbsoluta: number;
}
