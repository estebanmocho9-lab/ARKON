// ============================================
// IMPULSO IA — NEURONA: POROSIDAD
// Propiedad directa — Grupo: estructural
// Inversa: compacidad
// ============================================

import { Neurona, ResultadoActivacion } from '../../types';
import { activarNeurona } from '../../core/neuronEngine';
import { inferirDesdeNeurona } from '../../core/inferenceEngine';
import { obtenerRelaciones } from '../../core/relationEngine';

// --------------------------------------------
// DEFINICIÓN DE LA NEURONA
// --------------------------------------------

export const NEURONA_POROSIDAD: Neurona = {
  id: '',
  nombre: 'porosidad',
  tipo: 'directa',
  grupo_fisico: 'estructural',
  estado: 'Base',
  valor_activacion: 0,
  coherencia: 0,
  confianza: 0,
  relaciones: obtenerRelaciones('porosidad'),
  memoria: [],
  historial: [],
  experiencias: [],
  inferencias: [],
  compatibilidades: [
    'perlita_expandida',
    'vermiculita',
    'fibra_de_vidrio',
    'espuma_poliuretano',
  ],
  contradicciones: ['compacidad'],
  conexiones_neuronales: [],
};

// --------------------------------------------
// COMPORTAMIENTO ESPECÍFICO DE POROSIDAD
// --------------------------------------------

export function analizarPorosidad(
  neurona: Neurona,
  valor: number,
  contexto: string
): {
  resultado: ResultadoActivacion;
  interpretacion: string;
  recomendaciones: string[];
} {
  const resultado = activarNeurona(neurona, valor, contexto);
  const inferencias = inferirDesdeNeurona(neurona);

  let interpretacion = '';
  const recomendaciones: string[] = [];

  // Interpretación contextual — la propiedad es NEUTRAL
  // Su significado depende del producto

  if (valor >= 75) {
    interpretacion = `Porosidad MUY ALTA (${valor}/100) — estructura abierta`;
    recomendaciones.push('Considerar perlita expandida o vermiculita para mantener ligereza');
    recomendaciones.push('Aplicar tratamiento hidrofóbico para controlar absorción');
    recomendaciones.push('Evaluar uso como aislante térmico o acústico');
    recomendaciones.push('Revisar cohesión — alta porosidad puede reducir resistencia mecánica');

  } else if (valor >= 50) {
    interpretacion = `Porosidad ALTA (${valor}/100) — estructura semiabierta`;
    recomendaciones.push('Balance adecuado para la mayoría de aplicaciones constructivas');
    recomendaciones.push('Monitorear absorción en ambientes húmedos');
    recomendaciones.push('Evaluar si se necesita mayor densificación');

  } else if (valor >= 25) {
    interpretacion = `Porosidad MODERADA (${valor}/100) — estructura semicerrada`;
    recomendaciones.push('Buena resistencia mecánica esperada');
    recomendaciones.push('Baja absorción de agua — adecuado para zonas húmedas');
    recomendaciones.push('Puede requerir aditivos para mejorar aislación térmica');

  } else {
    interpretacion = `Porosidad BAJA (${valor}/100) — estructura cerrada`;
    recomendaciones.push('Alta densidad y resistencia mecánica');
    recomendaciones.push('Mínima absorción de agua');
    recomendaciones.push('Peso elevado — evaluar si es aceptable para la aplicación');
    recomendaciones.push('Poca capacidad de aislación térmica y acústica');
  }

  // Consecuencias en propiedades relacionadas
  if (valor > 60) {
    recomendaciones.push('⚡ Activando neuronas relacionadas: absorcion, humedad, peso, cohesion');
  }

  return { resultado, interpretacion, recomendaciones };
}

// --------------------------------------------
// DETECTAR OPORTUNIDADES POR POROSIDAD
// --------------------------------------------

export function detectarOportunidadesPorosidad(valor: number): string[] {
  const oportunidades: string[] = [];

  if (valor > 70) {
    oportunidades.push('✓ Aislante térmico — baja conductividad por aire atrapado');
    oportunidades.push('✓ Absorbente acústico — estructura porosa amortigua sonido');
    oportunidades.push('✓ Material filtrante — estructura abierta permite flujo controlado');
    oportunidades.push('✓ Material liviano — reducción de peso en estructuras');
  }

  if (valor > 50 && valor <= 70) {
    oportunidades.push('✓ Balance óptimo resistencia/peso para paneles');
    oportunidades.push('✓ Adecuado para morteros y revoques livianos');
  }

  if (valor < 25) {
    oportunidades.push('✓ Alta impermeabilidad — ideal para contenedores o tanques');
    oportunidades.push('✓ Resistencia a compresión elevada');
  }

  return oportunidades;
}

// --------------------------------------------
// COMPATIBILIDADES CONOCIDAS
// --------------------------------------------

export const COMPATIBILIDADES_POROSIDAD = {
  alta: [
    'perlita_expandida',    // aumenta porosidad, reduce peso
    'vermiculita',          // alta porosidad, aislación térmica
    'fibra_de_vidrio',      // refuerza sin reducir porosidad
    'microsfereas_huecas',  // mantiene porosidad, reduce peso
  ],
  media: [
    'yeso',                 // porosidad moderada
    'cemento_portland',     // reduce porosidad al fraguar
    'cal_hidratada',        // porosidad controlada
  ],
  baja: [
    'resinas_epoxi',        // sella poros
    'silicatos',            // densifica estructura
    'polimeros_acrilicos',  // reduce absorción
  ],
};





