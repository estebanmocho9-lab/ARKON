// ============================================
// IMPULSO IA — MOTOR NEURONAL BASE
// ============================================

import { v4 as uuidv4 } from 'uuid';
import {
  Neurona,
  TipoNeurona,
  GrupoFisico,
  EstadoFuncional,
  ResultadoActivacion,
  Inferencia,
} from '../types';
import { supabase } from '../supabase/client';

// --------------------------------------------
// CREAR NEURONA NUEVA
// --------------------------------------------

export function crearNeurona(
  nombre: string,
  tipo: TipoNeurona,
  grupo: GrupoFisico,
  conexiones: string[] = []
): Neurona {
  return {
    id: uuidv4(),
    nombre,
    tipo,
    grupo_fisico: grupo,
    estado: 'Base',
    valor_activacion: 0,
    coherencia: 0,
    confianza: 0,
    relaciones: [],
    memoria: [],
    historial: [],
    experiencias: [],
    inferencias: [],
    compatibilidades: [],
    contradicciones: [],
    conexiones_neuronales: conexiones,
  };
}

// --------------------------------------------
// ACTIVAR NEURONA
// --------------------------------------------

export function activarNeurona(
  neurona: Neurona,
  valor: number,
  contexto: string
): ResultadoActivacion {

  // Normalizar valor entre 0 y 100
  const valorNormalizado = Math.min(100, Math.max(0, valor));

  // Calcular coherencia basada en historial
  const coherencia = calcularCoherencia(neurona, valorNormalizado);

  // Detectar consecuencias según el valor
  const consecuencias = detectarConsecuencias(neurona, valorNormalizado);

  // Detectar oportunidades
  const oportunidades = detectarOportunidades(neurona, valorNormalizado);

  // Generar inferencias
  const inferencias = generarInferencias(neurona, valorNormalizado, contexto);

  // Actualizar estado de la neurona
  neurona.valor_activacion = valorNormalizado;
  neurona.coherencia = coherencia;
  neurona.historial.push(
    `[${new Date().toISOString()}] Activada con valor ${valorNormalizado} — contexto: ${contexto}`
  );

  return {
    neurona_id: neurona.id,
    valor: valorNormalizado,
    coherencia,
    consecuencias,
    oportunidades,
    neuronas_activadas: neurona.conexiones_neuronales,
    inferencias,
  };
}

// --------------------------------------------
// CALCULAR COHERENCIA
// --------------------------------------------

function calcularCoherencia(neurona: Neurona, valorActual: number): number {
  if (neurona.experiencias.length === 0) return 0.5;

  const confirmaciones = neurona.experiencias.reduce(
    (acc, exp) => acc + exp.confirmaciones, 0
  );

  const coherenciaBase = Math.min(1, confirmaciones / 10);
  return coherenciaBase;
}

// --------------------------------------------
// DETECTAR CONSECUENCIAS
// --------------------------------------------

function detectarConsecuencias(neurona: Neurona, valor: number): string[] {
  const consecuencias: string[] = [];

  if (valor > 75) {
    consecuencias.push(`${neurona.nombre} en nivel alto — revisar propiedades inversas`);
    consecuencias.push(`Posible impacto en propiedades relacionadas: ${neurona.relaciones.join(', ')}`);
  } else if (valor > 50) {
    consecuencias.push(`${neurona.nombre} en nivel moderado — sistema estable`);
  } else if (valor > 25) {
    consecuencias.push(`${neurona.nombre} en nivel bajo — verificar compatibilidades`);
  } else {
    consecuencias.push(`${neurona.nombre} en nivel crítico — requiere atención`);
  }

  return consecuencias;
}

// --------------------------------------------
// DETECTAR OPORTUNIDADES
// --------------------------------------------

function detectarOportunidades(neurona: Neurona, valor: number): string[] {
  const oportunidades: string[] = [];

  if (valor > 70) {
    oportunidades.push(`Alta ${neurona.nombre} puede aprovecharse para aplicaciones especializadas`);
  }

  if (neurona.compatibilidades.length > 0) {
    oportunidades.push(`Compatibilidades detectadas con: ${neurona.compatibilidades.join(', ')}`);
  }

  return oportunidades;
}

// --------------------------------------------
// GENERAR INFERENCIAS
// --------------------------------------------

function generarInferencias(
  neurona: Neurona,
  valor: number,
  contexto: string
): Inferencia[] {
  const inferencias: Inferencia[] = [];

  if (neurona.experiencias.length > 0) {
    const expRelevantes = neurona.experiencias.filter(
      (exp) => exp.confirmaciones >= 3
    );

    expRelevantes.forEach((exp) => {
      inferencias.push({
        id: uuidv4(),
        descripcion: `Basado en ${exp.confirmaciones} experiencias: ${exp.descripcion}`,
        confianza: Math.min(1, exp.confirmaciones / 10),
        propiedades_involucradas: [neurona.nombre],
        consecuencias: [exp.resultado],
        oportunidades: [],
        fecha: new Date().toISOString(),
      });
    });
  }

  return inferencias;
}

// --------------------------------------------
// GUARDAR NEURONA EN SUPABASE
// --------------------------------------------

export async function guardarNeurona(neurona: Neurona): Promise<void> {
  const { error } = await supabase.from('neuronas').upsert({
    id: neurona.id,
    nombre: neurona.nombre,
    tipo: neurona.tipo,
    grupo_fisico: neurona.grupo_fisico,
    estado: neurona.estado,
    valor_activacion: neurona.valor_activacion,
    coherencia: neurona.coherencia,
    confianza: neurona.confianza,
    relaciones: neurona.relaciones,
    compatibilidades: neurona.compatibilidades,
    contradicciones: neurona.contradicciones,
    conexiones_neuronales: neurona.conexiones_neuronales,
    historial: neurona.historial,
    actualizado_en: new Date().toISOString(),
  });

  if (error) {
    console.error('❌ Error guardando neurona:', error.message);
  } else {
    console.log(`✅ Neurona "${neurona.nombre}" guardada en Supabase`);
  }
}

// --------------------------------------------
// CARGAR NEURONA DESDE SUPABASE
// --------------------------------------------

export async function cargarNeurona(id: string): Promise<Neurona | null> {
  const { data, error } = await supabase
    .from('neuronas')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('❌ Error cargando neurona:', error?.message);
    return null;
  }

  return data as Neurona;
}