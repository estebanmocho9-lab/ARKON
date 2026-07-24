// ============================================
// IMPULSO IA — NEURONA: DENSIDAD
// Propiedad directa — Grupo: estructural
// ============================================

import { Neurona } from '../../types';
import { obtenerRelaciones } from '../../core/relationEngine';
import { activarNeurona } from '../../core/neuronEngine';

export const NEURONA_DENSIDAD: Neurona = {
  id: '',
  nombre: 'densidad',
  tipo: 'directa',
  grupo_fisico: 'estructural',
  estado: 'Base',
  valor_activacion: 0,
  coherencia: 0,
  confianza: 0,
  relaciones: obtenerRelaciones('densidad'),
  memoria: [],
  historial: [],
  experiencias: [],
  inferencias: [],
  compatibilidades: ['cemento_portland', 'aridos_pesados', 'barita'],
  contradicciones: [],
  conexiones_neuronales: [],
};

export function analizarDensidad(neurona: Neurona, valor: number, contexto: string) {
  const resultado = activarNeurona(neurona, valor, contexto);
  let interpretacion = '';
  const recomendaciones: string[] = [];

  if (valor >= 75) {
    interpretacion = `Densidad MUY ALTA (${valor}/100) — material muy pesado`;
    recomendaciones.push('Alta resistencia mecánica esperada');
    recomendaciones.push('Evaluar impacto en peso total de la estructura');
    recomendaciones.push('Considerar perlita o vermiculita para reducir densidad');
  } else if (valor >= 50) {
    interpretacion = `Densidad ALTA (${valor}/100) — material pesado`;
    recomendaciones.push('Buen balance resistencia/peso para construcción');
  } else if (valor >= 25) {
    interpretacion = `Densidad MODERADA (${valor}/100) — material liviano`;
    recomendaciones.push('Adecuado para paneles y placas livianas');
    recomendaciones.push('Verificar resistencia mecánica suficiente');
  } else {
    interpretacion = `Densidad BAJA (${valor}/100) — material muy liviano`;
    recomendaciones.push('✓ Excelente para aplicaciones donde el peso es crítico');
    recomendaciones.push('✓ Alta aislación térmica probable');
    recomendaciones.push('Verificar cohesión — materiales muy livianos pueden ser frágiles');
  }

  return { resultado, interpretacion, recomendaciones };
}