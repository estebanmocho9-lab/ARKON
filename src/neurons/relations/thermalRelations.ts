// ============================================
// IMPULSO IA — RELACIONES: TÉRMICAS
// ============================================

import { Neurona } from '../../types';

export const RELACIONES_TERMICAS = [
  {
    neurona_origen: 'conductividad_termica',
    neurona_destino: 'aislamiento_termico',
    tipo_relacion: 'contradice',
    peso: 1.0,
    descripcion: 'Conductividad y aislamiento térmico son propiedades opuestas',
  },
  {
    neurona_origen: 'porosidad',
    neurona_destino: 'aislamiento_termico',
    tipo_relacion: 'amplifica',
    peso: 0.85,
    descripcion: 'Mayor porosidad mejora aislación térmica por aire atrapado',
  },
  {
    neurona_origen: 'densidad',
    neurona_destino: 'conductividad_termica',
    tipo_relacion: 'amplifica',
    peso: 0.8,
    descripcion: 'Mayor densidad incrementa conductividad térmica',
  },
  {
    neurona_origen: 'humedad',
    neurona_destino: 'conductividad_termica',
    tipo_relacion: 'amplifica',
    peso: 0.75,
    descripcion: 'Agua en poros incrementa conductividad térmica del material',
  },
];

export function analizarComportamientoTermico(
  neuronas: Neurona[]
): string[] {
  const analisis: string[] = [];

  const neurPorosidad = neuronas.find((n) => n.nombre === 'porosidad');
  const neurDensidad = neuronas.find((n) => n.nombre === 'densidad');
  const neurHumedad = neuronas.find((n) => n.nombre === 'humedad');

  if (neurPorosidad && neurPorosidad.valor_activacion > 60) {
    analisis.push('✓ Alta porosidad favorece aislación térmica');
  }

  if (neurDensidad && neurDensidad.valor_activacion > 70) {
    analisis.push('⚠️ Alta densidad puede incrementar conductividad térmica');
  }

  if (neurHumedad && neurHumedad.valor_activacion > 50) {
    analisis.push('⚠️ Humedad elevada deteriora aislación térmica');
  }

  return analisis;
}
