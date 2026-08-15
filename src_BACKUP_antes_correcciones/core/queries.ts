// ============================================
// IMPULSO IA — CONSULTAS A SUPABASE
// ============================================

import { supabase } from '../supabase/client';
import { Neurona, MemoriaNeuronal, Experiencia, Inferencia, ResultadoAnalisis } from '../types';

// --------------------------------------------
// NEURONAS
// --------------------------------------------

export async function obtenerTodasLasNeuronas(): Promise<Neurona[]> {
  const { data, error } = await supabase
    .from('neuronas')
    .select('*')
    .order('nombre', { ascending: true });

  if (error) {
    console.error('❌ Error obteniendo neuronas:', error.message);
    return [];
  }

  return data as Neurona[];
}

export async function obtenerNeuronaPorNombre(nombre: string): Promise<Neurona | null> {
  const { data, error } = await supabase
    .from('neuronas')
    .select('*')
    .eq('nombre', nombre)
    .single();

  if (error) {
    console.error('❌ Error obteniendo neurona:', error.message);
    return null;
  }

  return data as Neurona;
}

export async function actualizarEstadoNeurona(
  id: string,
  estado: string,
  valor_activacion: number,
  coherencia: number,
  confianza: number
): Promise<void> {
  const { error } = await supabase
    .from('neuronas')
    .update({
      estado,
      valor_activacion,
      coherencia,
      confianza,
      actualizado_en: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('❌ Error actualizando neurona:', error.message);
  }
}

// --------------------------------------------
// MEMORIAS
// --------------------------------------------

export async function obtenerMemoriasPorProducto(
  producto: string
): Promise<MemoriaNeuronal[]> {
  const { data, error } = await supabase
    .from('memorias')
    .select('*')
    .eq('producto', producto)
    .order('fecha', { ascending: false });

  if (error) {
    console.error('❌ Error obteniendo memorias:', error.message);
    return [];
  }

  return data as MemoriaNeuronal[];
}

export async function obtenerMemoriasPorNeurona(
  neurona_id: string
): Promise<MemoriaNeuronal[]> {
  const { data, error } = await supabase
    .from('memorias')
    .select('*')
    .eq('neurona_id', neurona_id)
    .order('fecha', { ascending: false });

  if (error) {
    console.error('❌ Error obteniendo memorias:', error.message);
    return [];
  }

  return data as MemoriaNeuronal[];
}

// --------------------------------------------
// EXPERIENCIAS
// --------------------------------------------

export async function obtenerExperienciasPorMaterial(
  material: string
): Promise<Experiencia[]> {
  const { data, error } = await supabase
    .from('experiencias')
    .select('*')
    .eq('material', material)
    .order('confirmaciones', { ascending: false });

  if (error) {
    console.error('❌ Error obteniendo experiencias:', error.message);
    return [];
  }

  return data as Experiencia[];
}

export async function obtenerExperienciasConfirmadas(
  minConfirmaciones: number = 3
): Promise<Experiencia[]> {
  const { data, error } = await supabase
    .from('experiencias')
    .select('*')
    .gte('confirmaciones', minConfirmaciones)
    .order('confirmaciones', { ascending: false });

  if (error) {
    console.error('❌ Error obteniendo experiencias confirmadas:', error.message);
    return [];
  }

  return data as Experiencia[];
}

// --------------------------------------------
// INFERENCIAS
// --------------------------------------------

export async function obtenerInferenciasConfiables(
  minConfianza: number = 0.7
): Promise<Inferencia[]> {
  const { data, error } = await supabase
    .from('inferencias')
    .select('*')
    .gte('confianza', minConfianza)
    .order('confianza', { ascending: false });

  if (error) {
    console.error('❌ Error obteniendo inferencias:', error.message);
    return [];
  }

  return data as Inferencia[];
}

// --------------------------------------------
// RESULTADOS
// --------------------------------------------

export async function obtenerResultadosPorProducto(
  producto: string
): Promise<ResultadoAnalisis[]> {
  const { data, error } = await supabase
    .from('resultados')
    .select('*')
    .eq('producto', producto)
    .order('fecha', { ascending: false });

  if (error) {
    console.error('❌ Error obteniendo resultados:', error.message);
    return [];
  }

  return data as ResultadoAnalisis[];
}

export async function obtenerUltimosResultados(
  limite: number = 10
): Promise<ResultadoAnalisis[]> {
  const { data, error } = await supabase
    .from('resultados')
    .select('*')
    .order('fecha', { ascending: false })
    .limit(limite);

  if (error) {
    console.error('❌ Error obteniendo últimos resultados:', error.message);
    return [];
  }

  return data as ResultadoAnalisis[];
}