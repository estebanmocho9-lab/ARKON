// ============================================
// IMPULSO IA — NEURONA: ELASTICIDAD
// Propiedad directa — Grupo: mecanico
// Inversa: rigidez
// ============================================

import { Neurona } from '../../types';
import { obtenerRelaciones } from '../../core/relationEngine';
import { activarNeurona } from '../../core/neuronEngine';

export const NEURONA_ELASTICIDAD: Neurona = {
  id: '',
  nombre: 'elasticidad',
  tipo: 'directa',
  grupo_fisico: 'mecanico',
  estado: 'Base',
  valor_activacion: 0,
  coherencia: 0,
  confianza: 0,
  relaciones: obtenerRelaciones('elasticidad'),
  memoria: [],
  historial: [],
  experiencias: [],
  inferencias: [],
  compatibilidades: ['caucho', 'latex', 'fibra_elastica', 'polipropileno'],
  contradicciones: ['rigidez'],
  conexiones_neuronales: [],
};

export function analizarElasticidad(neurona: Neurona, valor: number, contexto: string) {
  const resultado = activarNeurona(neurona, valor, contexto);
  let interpretacion = '';
  const recomendaciones: string[] = [];

  if (valor >= 75) {
    interpretacion = `Elasticidad MUY ALTA (${valor}/100) — material muy flexible`;
    recomendaciones.push('✓ Excelente resistencia a impactos y vibraciones');
    recomendaciones.push('✓ Adecuado para juntas, sellos y membranas');
    recomendaciones.push('Verificar que no comprometa rigidez dimensional necesaria');
  } else if (valor >= 50) {
    interpretacion = `Elasticidad ALTA (${valor}/100) — material flexible`;
    recomendaciones.push('Buen balance para aplicaciones dinámicas');
    recomendaciones.push('Resistencia moderada a cargas de impacto');
  } else if (valor >= 25) {
    interpretacion = `Elasticidad MODERADA (${valor}/100) — material semirígido`;
    recomendaciones.push('Adecuado para aplicaciones estáticas con cargas leves');
  } else {
    interpretacion = `Elasticidad BAJA (${valor}/100) — material rígido`;
    recomendaciones.push('⚠️ Riesgo de fractura bajo cargas dinámicas');
    recomendaciones.push('Considerar fibras elásticas en la formulación');
    recomendaciones.push('Evaluar uso de plastificantes');
  }

  return { resultado, interpretacion, recomendaciones };
}
