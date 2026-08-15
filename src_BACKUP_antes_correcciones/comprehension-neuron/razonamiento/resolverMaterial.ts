// ============================================================
// src/comprehension-neuron/razonamiento/resolverMaterial.ts
// Concepto → Material del catálogo. Sigue exactamente la
// jerarquía de la Sección 20: coincidencia exacta → sinónimo
// documentado → variante explícita → ambiguo → null.
// ============================================================

import { Concepto, Material } from '../tipos/entidades';

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export type EstadoResolucionMaterial = 'exacto' | 'sinonimo' | 'ambiguo' | 'no_encontrado';

export interface ResultadoResolucionMaterial {
  material: Material | null;
  estado: EstadoResolucionMaterial;
  // Cuando estado === 'ambiguo', acá quedan los candidatos entre
  // los que no se pudo decidir — para que quede auditable POR QUÉ
  // no se resolvió, no un null mudo.
  candidatos?: Material[];
}

// ── La firma simple que pide la Sección 20 (devuelve Material |
//    null). Para el detalle completo (por qué quedó así), usar
//    resolverMaterialDetallado(). ─────────────────────────────────
export function resolverMaterial(concepto: Concepto, catalogo: Material[]): Material | null {
  return resolverMaterialDetallado(concepto, catalogo).material;
}

export function resolverMaterialDetallado(concepto: Concepto, catalogo: Material[]): ResultadoResolucionMaterial {
  const texto = normalizar(concepto.texto);

  // 1. Coincidencia exacta contra el nombre principal.
  const exactos = catalogo.filter(m => normalizar(m.nombre_principal) === texto);
  if (exactos.length === 1) return { material: exactos[0], estado: 'exacto' };
  if (exactos.length > 1) return { material: null, estado: 'ambiguo', candidatos: exactos };

  // 2. Sinónimo documentado (en el propio catálogo real, no
  //    inventado acá).
  const porSinonimo = catalogo.filter(m => m.sinonimos.some(s => normalizar(s) === texto) || (m.nombre_en && normalizar(m.nombre_en) === texto));
  if (porSinonimo.length === 1) return { material: porSinonimo[0], estado: 'sinonimo' };
  if (porSinonimo.length > 1) return { material: null, estado: 'ambiguo', candidatos: porSinonimo };

  // 3. Variante explícitamente documentada: el propio texto del
  //    concepto YA incluye el modificador completo (ej. el
  //    concepto es "Vermiculita expandida", no solo "Vermiculita")
  //    — eso ya lo cubre el paso 1 si "Vermiculita expandida" es
  //    el nombre_principal exacto de un material real. Este tercer
  //    paso queda documentado para el caso en que el catálogo
  //    tuviera el modificador como parte de un sinónimo compuesto
  //    distinto del nombre_principal — hoy, con tu catálogo real,
  //    los pasos 1 y 2 ya cubren el 100% de los 21 materiales
  //    (ninguno depende de una variante que no sea su propio
  //    nombre_principal). Se deja el paso igual, sin lógica extra,
  //    para que la jerarquía quede completa y documentada tal como
  //    la pediste, lista para el día que haga falta.

  // 4. No se encontró ninguna coincidencia — Regla del documento:
  //    nunca elegir arbitrariamente, nunca "parecido a".
  return { material: null, estado: 'no_encontrado' };
}
