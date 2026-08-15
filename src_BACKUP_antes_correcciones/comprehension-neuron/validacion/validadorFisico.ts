// ============================================================
// src/comprehension-neuron/validacion/validadorFisico.ts
// Compara un número contra un rango físico plausible — SOLO si
// ese rango está confirmado en restriccionesFisicas.ts. Como ese
// catálogo arranca vacío a propósito, este validador hoy siempre
// va a devolver UNKNOWN — eso es lo correcto, no un bug: significa
// "todavía no tenemos con qué confirmar ni descartar por física".
// ============================================================

import { obtenerRestriccion } from '../conocimiento/restriccionesFisicas';
import { ResultadoValidacion, EstadoValidacion, crearResultado } from './resultadoValidacion';

export function validarFisico(propiedadId: string, numero: number, materialId?: string): EstadoValidacion {
  return validarFisicoDetallado(propiedadId, numero, materialId).estado;
}

export function validarFisicoDetallado(propiedadId: string, numero: number, materialId?: string): ResultadoValidacion {
  const restriccion = obtenerRestriccion(propiedadId, materialId);
  const datosEvaluados = { propiedad: propiedadId, valor: String(numero) };

  if (!restriccion) {
    return crearResultado(
      'UNKNOWN',
      'RESTRICCION_FISICA',
      `No hay un rango físico confirmado para esta propiedad todavía — no se puede afirmar ni descartar por este camino.`,
      datosEvaluados
    );
  }

  const { minimoPlausible, maximoPlausible, fuente } = restriccion;
  const dentroDeMinimo = minimoPlausible === undefined || numero >= minimoPlausible;
  const dentroDeMaximo = maximoPlausible === undefined || numero <= maximoPlausible;

  if (dentroDeMinimo && dentroDeMaximo) {
    return crearResultado('PASS', 'RESTRICCION_FISICA', `${numero} está dentro del rango plausible según ${fuente}.`, datosEvaluados, fuente);
  }
  return crearResultado('FAIL', 'RESTRICCION_FISICA', `${numero} está fuera del rango plausible (${minimoPlausible ?? '−∞'} a ${maximoPlausible ?? '+∞'}) según ${fuente}.`, datosEvaluados, fuente);
}
