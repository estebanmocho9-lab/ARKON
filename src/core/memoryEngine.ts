// ============================================
// IMPULSO IA — MOTOR DE MEMORIA NEURONAL
// ============================================

import { v4 as uuidv4 } from 'uuid';
import { MemoriaNeuronal, Experiencia, Neurona } from '../types';
import { supabase } from '../supabase/client';

// --------------------------------------------
// GUARDAR MEMORIA EN SUPABASE
// --------------------------------------------

export async function guardarMemoria(
  neurona: Neurona,
  producto: string,
  contexto: string
): Promise<void> {
  const memoria: MemoriaNeuronal = {
    id: uuidv4(),
    neurona_id: neurona.id,
    producto,
    propiedad: neurona.nombre,
    contexto,
    activaciones: neurona.historial.length,
    coherencia: neurona.coherencia,
    relaciones_detectadas: neurona.relaciones,
    soluciones_aplicadas: [],
    resultados_obtenidos: [],
    mejoras_logradas: [],
    contradicciones: neurona.contradicciones,
    patrones_repetidos: [],
    fecha: new Date().toISOString(),
  };

  const { error } = await supabase.from('memorias').insert({
    id: memoria.id,
    neurona_id: memoria.neurona_id,
    producto: memoria.producto,
    propiedad: memoria.propiedad,
    contexto: memoria.contexto,
    activaciones: memoria.activaciones,
    coherencia: memoria.coherencia,
    relaciones_detectadas: memoria.relaciones_detectadas,
    soluciones_aplicadas: memoria.soluciones_aplicadas,
    resultados_obtenidos: memoria.resultados_obtenidos,
    mejoras_logradas: memoria.mejoras_logradas,
    contradicciones: memoria.contradicciones,
    patrones_repetidos: memoria.patrones_repetidos,
    fecha: memoria.fecha,
  });

  if (error) {
    console.error('❌ Error guardando memoria:', error.message);
  } else {
    console.log(`✅ Memoria guardada — neurona: ${neurona.nombre}, producto: ${producto}`);
  }

  // Agregar a memoria local de la neurona
  neurona.memoria.push(memoria);
}

// --------------------------------------------
// CARGAR MEMORIAS DE UNA NEURONA
// --------------------------------------------

export async function cargarMemorias(
  neurona_id: string
): Promise<MemoriaNeuronal[]> {
  const { data, error } = await supabase
    .from('memorias')
    .select('*')
    .eq('neurona_id', neurona_id)
    .order('fecha', { ascending: false });

  if (error) {
    console.error('❌ Error cargando memorias:', error.message);
    return [];
  }

  return data as MemoriaNeuronal[];
}

// --------------------------------------------
// GUARDAR EXPERIENCIA
// --------------------------------------------

export async function guardarExperiencia(
  neurona: Neurona,
  descripcion: string,
  material: string,
  resultado: string
): Promise<void> {
  // Verificar si ya existe una experiencia similar
  const existente = neurona.experiencias.find(
    (exp) => exp.descripcion === descripcion && exp.material === material
  );

  if (existente) {
    // Incrementar confirmaciones
    existente.confirmaciones += 1;
    console.log(`🔄 Experiencia confirmada x${existente.confirmaciones}: ${descripcion}`);

    await supabase
      .from('experiencias')
      .update({ confirmaciones: existente.confirmaciones })
      .eq('id', existente.id);

    return;
  }

  // Crear experiencia nueva
  const experiencia: Experiencia = {
    id: uuidv4(),
    descripcion,
    propiedad: neurona.nombre,
    material,
    resultado,
    confirmaciones: 1,
    fecha: new Date().toISOString(),
  };

  const { error } = await supabase.from('experiencias').insert({
    id: experiencia.id,
    neurona_id: neurona.id,
    descripcion: experiencia.descripcion,
    propiedad: experiencia.propiedad,
    material: experiencia.material,
    resultado: experiencia.resultado,
    confirmaciones: experiencia.confirmaciones,
    fecha: experiencia.fecha,
  });

  if (error) {
    console.error('❌ Error guardando experiencia:', error.message);
  } else {
    console.log(`✅ Nueva experiencia registrada: ${descripcion}`);
  }

  neurona.experiencias.push(experiencia);
}

// --------------------------------------------
// CARGAR EXPERIENCIAS DE UNA NEURONA
// --------------------------------------------

export async function cargarExperiencias(
  neurona_id: string
): Promise<Experiencia[]> {
  const { data, error } = await supabase
    .from('experiencias')
    .select('*')
    .eq('neurona_id', neurona_id)
    .order('confirmaciones', { ascending: false });

  if (error) {
    console.error('❌ Error cargando experiencias:', error.message);
    return [];
  }

  return data as Experiencia[];
}

// --------------------------------------------
// DETECTAR PATRONES EN MEMORIA
// --------------------------------------------

export function detectarPatrones(memorias: MemoriaNeuronal[]): string[] {
  const patrones: string[] = [];
  const conteo: Record<string, number> = {};

  memorias.forEach((mem) => {
    mem.relaciones_detectadas.forEach((rel) => {
      conteo[rel] = (conteo[rel] || 0) + 1;
    });
  });

  Object.entries(conteo).forEach(([relacion, veces]) => {
    if (veces >= 3) {
      patrones.push(`Patrón repetido (${veces}x): ${relacion}`);
    }
  });

  return patrones;
}