
// ============================================
// IMPULSO IA — NEURONA: ABSORCION
// Propiedad directa — Grupo: hidrico
// Inversa: hidrofobicidad
// ============================================

import { Neurona } from '../../types';
import { obtenerRelaciones } from '../../core/relationEngine';
import { activarNeurona } from '../../core/neuronEngine';
import { inferirDesdeNeurona } from '../../core/inferenceEngine';

export const NEURONA_ABSORCION: Neurona = {
  id: '',
  nombre: 'absorcion',
  tipo: 'directa',
  grupo_fisico: 'hidrico',
  estado: 'Base',
  valor_activacion: 0,
  coherencia: 0,
  confianza: 0,
  relaciones: obtenerRelaciones('absorcion'),
  memoria: [],
  historial: [],
  experiencias: [],
  inferencias: [],
  compatibilidades: ['silicona', 'resina_acrilica', 'parafina', 'cera_carnauba'],
  contradicciones: ['hidrofobicidad'],
  conexiones_neuronales: [],
};

export function analizarAbsorcion(neurona: Neurona, valor: number, contexto: string) {
  const resultado = activarNeurona(neurona, valor, contexto);
  const inferencias = inferirDesdeNeurona(neurona);
  let interpretacion = '';
  const recomendaciones: string[] = [];

  if (valor >= 75) {
    interpretacion = `Absorción MUY ALTA (${valor}/100) — material muy absorbente`;
    recomendaciones.push('⚠️ Riesgo de degradación en ambientes húmedos');
    recomendaciones.push('Aplicar tratamiento hidrofóbico superficial');
    recomendaciones.push('Considerar barrera de vapor en la aplicación');
    recomendaciones.push('Evaluar uso como material absorbente intencional');
  } else if (valor >= 50) {
    interpretacion = `Absorción ALTA (${valor}/100) — absorbe moderadamente`;
    recomendaciones.push('Monitorear en zonas con humedad frecuente');
    recomendaciones.push('Considerar sellado superficial');
  } else if (valor >= 25) {
    interpretacion = `Absorción MODERADA (${valor}/100) — comportamiento controlado`;
    recomendaciones.push('Adecuado para interiores secos');
    recomendaciones.push('Buen balance para aplicaciones estándar');
  } else {
    interpretacion = `Absorción BAJA (${valor}/100) — material resistente al agua`;
    recomendaciones.push('✓ Excelente para zonas húmedas o exteriores');
    recomendaciones.push('✓ Alta durabilidad frente a agua');
  }

  return { resultado, interpretacion, recomendaciones };
}

export const COMPATIBILIDADES_ABSORCION = {
  reductores: ['silicona_liquida', 'resina_acrilica', 'parafina', 'estearato_calcio'],
  potenciadores: ['perlita_expandida', 'vermiculita', 'celulosa'],
};

