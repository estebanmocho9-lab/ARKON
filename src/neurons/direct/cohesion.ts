// ============================================
// IMPULSO IA — NEURONA: COHESION
// Propiedad directa — Grupo: mecanico
// Inversa: friabilidad
// ============================================

import { Neurona } from '../../types';
import { obtenerRelaciones } from '../../core/relationEngine';
import { activarNeurona } from '../../core/neuronEngine';
import { inferirDesdeNeurona } from '../../core/inferenceEngine';

export const NEURONA_COHESION: Neurona = {
  id: '',
  nombre: 'cohesion',
  tipo: 'directa',
  grupo_fisico: 'mecanico',
  estado: 'Base',
  valor_activacion: 0,
  coherencia: 0,
  confianza: 0,
  relaciones: obtenerRelaciones('cohesion'),
  memoria: [],
  historial: [],
  experiencias: [],
  inferencias: [],
  compatibilidades: ['fibra_celulosa', 'fibra_vidrio', 'latex', 'resina_epoxi'],
  contradicciones: ['friabilidad'],
  conexiones_neuronales: [],
};

export function analizarCohesion(neurona: Neurona, valor: number, contexto: string) {
  const resultado = activarNeurona(neurona, valor, contexto);
  const inferencias = inferirDesdeNeurona(neurona);
  let interpretacion = '';
  const recomendaciones: string[] = [];

  if (valor >= 75) {
    interpretacion = `Cohesión MUY ALTA (${valor}/100) — estructura muy unida`;
    recomendaciones.push('Excelente resistencia mecánica y durabilidad');
    recomendaciones.push('Bajo riesgo de desintegración o fractura');
    recomendaciones.push('Evaluar si la rigidez resultante es aceptable');
  } else if (valor >= 50) {
    interpretacion = `Cohesión ALTA (${valor}/100) — estructura estable`;
    recomendaciones.push('Buen balance entre resistencia y flexibilidad');
    recomendaciones.push('Adecuado para la mayoría de aplicaciones');
  } else if (valor >= 25) {
    interpretacion = `Cohesión MODERADA (${valor}/100) — estructura con riesgo`;
    recomendaciones.push('Considerar agregar fibras o aglutinantes');
    recomendaciones.push('Monitorear comportamiento bajo carga');
  } else {
    interpretacion = `Cohesión BAJA (${valor}/100) — estructura frágil`;
    recomendaciones.push('⚠️ Riesgo alto de desintegración');
    recomendaciones.push('Agregar fibra de vidrio o celulosa urgente');
    recomendaciones.push('Revisar formulación completa');
  }

  return { resultado, interpretacion, recomendaciones };
}

export const COMPATIBILIDADES_COHESION = {
  alta: ['fibra_celulosa', 'fibra_vidrio', 'latex_acrilico', 'resina_epoxi'],
  media: ['cemento_portland', 'yeso', 'cal_hidratada'],
  baja: ['perlita_expandida', 'vermiculita'],
};
