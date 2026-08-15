// ============================================================
// src/comprehension-neuron/validacion/validadorDocumental.ts
// Confirma que la relación es documentalmente plausible — no solo
// que "están en el mismo bloque". Sección 3 del documento: la
// confianza del bloque es una señal secundaria, nunca la prueba.
//
// Nota de nomenclatura: donde el documento de la Parte 4 dice
// `Relacion` como parámetro, acá se usa `Hipotesis` — es el mismo
// concepto ("relación candidata, todavía no validada") que ya
// existía desde la Parte 1/3 con ese nombre. No se duplica un tipo
// nuevo (Sección 25: reusar en vez de crear con nombre similar).
// ============================================================

import { Evidencia } from '../tipos/evidencias';
import { Hipotesis } from '../tipos/hipotesis';
import { Material, Propiedad } from '../tipos/entidades';
import { Valor } from '../tipos/valores';
import { BloqueMaterial, esBloqueDescartable } from '../../extraction-neurons/comprension/gestorBloques';
import { ResultadoValidacion, EstadoValidacion, crearResultado } from './resultadoValidacion';

function normalizar(t: string): string {
  return t
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function apareceEnFragmento(termino: string, fragmento: string): boolean {
  return normalizar(fragmento).includes(normalizar(termino));
}

export function validarDocumental(
  hipotesis: Hipotesis,
  evidencia: Evidencia,
  bloque: BloqueMaterial | null,
  material: Material | null,
  propiedad: Propiedad,
  valor: Valor,
  fuerzaSenalMaterial: 'Fuerte' | 'Media' | 'Débil' | 'Ninguna' | null
): EstadoValidacion {
  return validarDocumentalDetallado(hipotesis, evidencia, bloque, material, propiedad, valor, fuerzaSenalMaterial).estado;
}

export function validarDocumentalDetallado(
  hipotesis: Hipotesis,
  evidencia: Evidencia,
  bloque: BloqueMaterial | null,
  material: Material | null,
  propiedad: Propiedad,
  valor: Valor,
  fuerzaSenalMaterial: 'Fuerte' | 'Media' | 'Débil' | 'Ninguna' | null
): ResultadoValidacion {
  const datosEvaluados = { propiedad: propiedad.id, valor: valor.texto_original };

  // 4.1 — Existe evidencia real, con fragmento.
  if (!evidencia.fragmentoTexto || evidencia.fragmentoTexto.trim().length === 0) {
    return crearResultado('FAIL', 'DOCUMENTAL', 'No hay fragmento de texto real que respalde esta relación.', datosEvaluados);
  }

  // El bloque es de tipo estructural (índice/bibliografía/
  // referencias) → nunca es documentalmente plausible, sin
  // importar qué tan cerca estén las palabras (reusa
  // esBloqueDescartable, ya construido y probado en el sistema
  // existente — no se reimplementa el criterio).
  if (bloque && esBloqueDescartable(bloque)) {
    return crearResultado('FAIL', 'DOCUMENTAL', `El bloque es de tipo "${bloque.tipoNodoDominante}" — nunca es una fuente válida de datos.`, datosEvaluados);
  }

  // 4.2 — El material pertenece a este BLOQUE, según lo que ya
  // calculó ramMateriales.ts para todo el bloque (título de
  // sección, repetición, herencia) — no se vuelve a buscar el
  // nombre del material como texto suelto en un fragmento chico,
  // porque el material casi siempre se menciona una sola vez, lejos
  // del valor puntual, y esa búsqueda de texto fallaba por eso.
  if (material) {
    if (fuerzaSenalMaterial === 'Débil') {
      return crearResultado(
        'UNKNOWN',
        'DOCUMENTAL',
        `El material "${material.nombre_principal}" tiene señal Débil en este bloque (heredado, sin evidencia propia) — no hay evidencia suficiente para aceptar ni para rechazar, queda pendiente de revisión.`,
        datosEvaluados
      );
    }
    if (fuerzaSenalMaterial === 'Ninguna' || fuerzaSenalMaterial === null) {
      return crearResultado(
        'UNKNOWN',
        'DOCUMENTAL',
        `No se pudo determinar con qué fuerza el material "${material.nombre_principal}" corresponde a este bloque.`,
        datosEvaluados
      );
    }
    // 'Fuerte' o 'Media': el material sí pertenece al bloque,
    // continúa con el resto de las validaciones (4.3 y 4.4).
  }

  // 4.3 — La propiedad aparece realmente en la evidencia, no solo
  // "fue encontrada antes en el documento".
  const propiedadEnFragmento =
    apareceEnFragmento(propiedad.nombre_principal, evidencia.fragmentoTexto) || propiedad.sinonimos.some(s => apareceEnFragmento(s, evidencia.fragmentoTexto));
  if (!propiedadEnFragmento) {
    return crearResultado('FAIL', 'DOCUMENTAL', `"${propiedad.nombre_principal}" no aparece en el fragmento de evidencia.`, datosEvaluados);
  }

  // 4.4 — El valor aparece realmente en la evidencia.
  if (!apareceEnFragmento(valor.texto_original, evidencia.fragmentoTexto)) {
    return crearResultado('FAIL', 'DOCUMENTAL', `El valor "${valor.texto_original}" no aparece en el fragmento de evidencia.`, datosEvaluados);
  }

  // Si no hay bloque para evaluar señales adicionales (fila/tabla/
  // encabezado ya las evaluó asociarValor.ts antes de llegar acá),
  // pero todo lo anterior pasó, se acepta como documentalmente
  // plausible.
  return crearResultado('PASS', 'DOCUMENTAL', 'Material, propiedad y valor aparecen todos en el mismo fragmento de evidencia, en un bloque no estructural.', datosEvaluados);
}
