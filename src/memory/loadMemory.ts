// ============================================
// IMPULSO IA — CARGAR MEMORIA
// ============================================

import { MemoriaNeuronal, Experiencia, ResultadoAnalisis } from '../types';
import { supabase } from '../supabase/client';

// --------------------------------------------
// CARGAR MEMORIA DE UNA NEURONA
// --------------------------------------------

export async function loadMemory(
  neurona_id: string
): Promise<MemoriaNeuronal[]> {
  const { data, error } = await supabase
    .from('memorias')
    .select('*')
    .eq('neurona_id', neurona_id)
    .order('fecha', { ascending: false });

  if (error) {
    console.error('❌ Error cargando memoria:', error.message);
    return [];
  }

  console.log(`📂 Memoria cargada — ${data.length} registros encontrados`);
  return data as MemoriaNeuronal[];
}

// --------------------------------------------
// CARGAR MEMORIA POR PRODUCTO
// --------------------------------------------

export async function loadMemoryByProducto(
  producto: string
): Promise<MemoriaNeuronal[]> {
  const { data, error } = await supabase
    .from('memorias')
    .select('*')
    .eq('producto', producto)
    .order('fecha', { ascending: false });

  if (error) {
    console.error('❌ Error cargando memoria por producto:', error.message);
    return [];
  }

  console.log(`📂 Memoria cargada para "${producto}" — ${data.length} registros`);
  return data as MemoriaNeuronal[];
}

// --------------------------------------------
// CARGAR EXPERIENCIAS DE UNA NEURONA
// --------------------------------------------

export async function loadExperiencias(
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

  console.log(`📂 Experiencias cargadas — ${data.length} registros`);
  return data as Experiencia[];
}

// --------------------------------------------
// CARGAR EXPERIENCIAS MÁS CONFIRMADAS
// --------------------------------------------

export async function loadExperienciasTop(
  limite: number = 10
): Promise<Experiencia[]> {
  const { data, error } = await supabase
    .from('experiencias')
    .select('*')
    .order('confirmaciones', { ascending: false })
    .limit(limite);

  if (error) {
    console.error('❌ Error cargando experiencias top:', error.message);
    return [];
  }

  console.log(`📂 Top ${limite} experiencias cargadas`);
  return data as Experiencia[];
}

// --------------------------------------------
// CARGAR ÚLTIMOS RESULTADOS
// --------------------------------------------

export async function loadUltimosResultados(
  limite: number = 10
): Promise<ResultadoAnalisis[]> {
  const { data, error } = await supabase
    .from('resultados')
    .select('*')
    .order('fecha', { ascending: false })
    .limit(limite);

  if (error) {
    console.error('❌ Error cargando resultados:', error.message);
    return [];
  }

  console.log(`📂 Últimos ${limite} resultados cargados`);
  return data as ResultadoAnalisis[];
}

// --------------------------------------------
// CARGAR RESULTADO POR PRODUCTO
// --------------------------------------------

export async function loadResultadosPorProducto(
  producto: string
): Promise<ResultadoAnalisis[]> {
  const { data, error } = await supabase
    .from('resultados')
    .select('*')
    .eq('producto', producto)
    .order('fecha', { ascending: false });

  if (error) {
    console.error('❌ Error cargando resultados por producto:', error.message);
    return [];
  }

  console.log(`📂 Resultados cargados para "${producto}" — ${data.length} registros`);
  return data as ResultadoAnalisis[];
}

// --------------------------------------------
// CARGAR MEMORIA COMPLETA DEL SISTEMA
// --------------------------------------------

export async function loadMemoriaCompleta(): Promise<{
  memorias: MemoriaNeuronal[];
  experiencias: Experiencia[];
  resultados: ResultadoAnalisis[];
}> {
  console.log('\n📂 Cargando memoria completa del sistema...\n');

  const [memorias, experiencias, resultados] = await Promise.all([
    supabase.from('memorias').select('*').order('fecha', { ascending: false }),
    supabase.from('experiencias').select('*').order('confirmaciones', { ascending: false }),
    supabase.from('resultados').select('*').order('fecha', { ascending: false }),
  ]);

  console.log(`  Memorias: ${memorias.data?.length || 0}`);
  console.log(`  Experiencias: ${experiencias.data?.length || 0}`);
  console.log(`  Resultados: ${resultados.data?.length || 0}\n`);

  return {
    memorias: (memorias.data || []) as MemoriaNeuronal[],
    experiencias: (experiencias.data || []) as Experiencia[],
    resultados: (resultados.data || []) as ResultadoAnalisis[],
  };
}