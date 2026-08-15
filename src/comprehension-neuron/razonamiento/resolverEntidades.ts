// ============================================================
// src/comprehension-neuron/razonamiento/resolverEntidades.ts
// Construye un Concepto a partir del texto que realmente encontró
// una micro-neurona — nunca a partir de lo que "podría significar"
// mirando alrededor. Esta es la Regla Crítica de la Sección 16:
// si el documento dice "Vermiculita", el concepto es "Vermiculita",
// nunca "Vermiculita expandida", aunque ese material exista en el
// catálogo.
//
// Por qué esto YA funciona bien de entrada: ramMateriales.ts (que
// no se toca en esta Parte) matchea contra el TÉRMINO COMPLETO del
// diccionario (nombre_es/sinónimos), nunca palabra por palabra. Si
// el PDF dice "Vermiculita" y el diccionario tiene "Vermiculita" Y
// "Vermiculita Expandida" como dos entradas de tu catálogo real,
// la RAM matchea "Vermiculita" solo con el término que aparece
// literalmente — nunca "adivina" que sigue una palabra más. Esta
// función solo formaliza esa garantía al nivel de Concepto, para
// que quede explícita y auditable, no implícita en un detalle de
// implementación de otro archivo.
// ============================================================

import { Id, registroIds } from '../tipos/ids';
import { Palabra, Concepto } from '../tipos/entidades';

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function construirPalabra(textoOriginal: string): Palabra {
  const normalizado = normalizar(textoOriginal);
  return {
    id: registroIds.obtenerOAsignar('PAL', normalizado) as Id<'PAL'>,
    texto_original: textoOriginal,
    texto_normalizado: normalizado,
  };
}

// ── Función principal. Recibe EXACTAMENTE el texto que matcheó la
//    micro-neurona (ej. "Vermiculita", o "Vermiculita expandida"
//    si esa fue la frase completa que matcheó contra el
//    diccionario) — nunca un rango de texto más amplio "por las
//    dudas". Eso es lo que impide la ampliación indebida: esta
//    función JAMÁS mira texto fuera del span que ya vino resuelto. ─
export function resolverConcepto(textoEncontrado: string): Concepto {
  const texto = textoEncontrado.trim();
  const palabras = texto.split(/\s+/).map(construirPalabra);

  return {
    id: registroIds.obtenerOAsignar('CON', normalizar(texto)) as Id<'CON'>,
    palabras: palabras.map(p => p.id),
    texto,
    resuelveA: null, // lo completa resolverMaterial.ts / resolverPropiedad.ts, no este archivo
  };
}

// ── Sección 17: un concepto SÍ puede ampliarse, pero solo cuando
//    el modificador es parte del mismo span contiguo que matcheó
//    — nunca por estar "cerca" en la oración. Esta función es la
//    guardia explícita para ese caso: compara posición de dos
//    palabras y confirma que son estrictamente contiguas (no hay
//    ninguna otra palabra ni signo de puntuación fuerte entre
//    medio) antes de dejar que se combinen en un solo Concepto.
//    Ejemplo de uso: si en el futuro un extractor más flexible
//    encuentra "vermiculita" y, por separado, "expandida" cerca,
//    esta función es la que decide si ese "cerca" alcanza (Sección
//    19: "se expande" en una oración distinta NUNCA pasa esta
//    prueba, porque hay texto intermedio). ──────────────────────────
export function palabrasSonContiguas(textoCompleto: string, posicionA: number, longitudA: number, posicionB: number): boolean {
  if (posicionB <= posicionA) return false;
  const finA = posicionA + longitudA;
  const entreMedio = textoCompleto.slice(finA, posicionB);
  // Solo se permite espacio en blanco entre las dos palabras — ni
  // una coma, ni un punto, ni otra palabra. "Vermiculita expandida"
  // pasa. "Vermiculita, que se expande" no pasa (hay coma y "que
  // se" en el medio).
  return /^\s*$/.test(entreMedio) && entreMedio.length < 20;
}
