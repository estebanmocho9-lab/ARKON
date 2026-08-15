// ============================================================
// src/comprehension-neuron/validacion/validadorEvidencia.ts
// Sección 12 del documento. Distinto de validadorDocumental.ts:
// documental confirma que la ASOCIACIÓN es plausible (misma fila,
// mismo bloque, texto presente); este confirma la INTEGRIDAD
// REFERENCIAL — que material/propiedad/valor/unidad, si la
// Hipótesis dice que existen, de verdad resuelven a un objeto
// real, no un ID que apunta a nada.
// ============================================================

import { Evidencia } from '../tipos/evidencias';
import { Hipotesis } from '../tipos/hipotesis';
import { Material, Unidad } from '../tipos/entidades';
import { Valor } from '../tipos/valores';
import { ResultadoValidacion, EstadoValidacion, crearResultado } from './resultadoValidacion';

export function validarEvidencia(hipotesis: Hipotesis, evidencia: Evidencia, material: Material | null, valor: Valor | null, unidad: Unidad | null): EstadoValidacion {
  return validarEvidenciaDetallado(hipotesis, evidencia, material, valor, unidad).estado;
}

export function validarEvidenciaDetallado(hipotesis: Hipotesis, evidencia: Evidencia, material: Material | null, valor: Valor | null, unidad: Unidad | null): ResultadoValidacion {
  const datosEvaluados = { valor: valor?.texto_original };

  if (!evidencia.coordenada.documento) {
    return crearResultado('FAIL', 'INTEGRIDAD_EVIDENCIA', 'La evidencia no tiene documento asociado.', datosEvaluados);
  }
  if (!evidencia.coordenada.pagina && !evidencia.coordenada.bloque) {
    return crearResultado('FAIL', 'INTEGRIDAD_EVIDENCIA', 'La evidencia no tiene página ni bloque — no se puede ubicar dentro del documento.', datosEvaluados);
  }
  if (!evidencia.fragmentoTexto || evidencia.fragmentoTexto.trim().length === 0) {
    return crearResultado('FAIL', 'INTEGRIDAD_EVIDENCIA', 'La evidencia no tiene fragmento de texto original.', datosEvaluados);
  }

  // Referencia colgada: la Hipótesis dice que hay un material
  // (hipotesis.material !== null) pero no se pudo resolver ningún
  // objeto Material real para ese ID.
  if (hipotesis.material && !material) {
    return crearResultado('FAIL', 'INTEGRIDAD_EVIDENCIA', `La hipótesis referencia un material (${hipotesis.material}) que no resuelve a ningún objeto real.`, datosEvaluados);
  }
  if (hipotesis.valor && !valor) {
    return crearResultado('FAIL', 'INTEGRIDAD_EVIDENCIA', `La hipótesis referencia un valor (${hipotesis.valor}) que no resuelve a ningún objeto real.`, datosEvaluados);
  }
  if (hipotesis.unidad && !unidad) {
    return crearResultado('FAIL', 'INTEGRIDAD_EVIDENCIA', `La hipótesis referencia una unidad (${hipotesis.unidad}) que no resuelve a ningún objeto real.`, datosEvaluados);
  }

  return crearResultado('PASS', 'INTEGRIDAD_EVIDENCIA', 'Todas las referencias de la hipótesis resuelven a objetos reales, con documento, ubicación y fragmento de texto.', datosEvaluados);
}
