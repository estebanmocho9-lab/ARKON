// ============================================
// IMPULSO IA — GUARDAR MEMORIA
// ============================================

import { v4 as uuidv4 } from 'uuid';
import { Neurona, MemoriaNeuronal } from '../types';
import { supabase } from '../supabase/client';

// --------------------------------------------
// GUARDAR MEMORIA COMPLETA DE UNA NEURONA
// --------------------------------------------

export async function saveMemory(
  neurona: Neurona,
  producto: string,
  contexto: string,
  soluciones: string[] = [],
  resultados: string[] = [],
  mejoras: string[] = []
): Promise<MemoriaNeuronal> {

  const memoria: MemoriaNeuronal = {
    id: uuidv4(),
    neurona_id: neurona.id,
    producto,
    propiedad: neurona.nombre,
    contexto,
    activaciones: neurona.historial.length,
    coherencia: neurona.coherencia,
    relaciones_detectadas: neurona.relaciones,
    soluciones_aplicadas: soluciones,
    resultados_obtenidos: resultados,
    mejoras_logradas: mejoras,
    contradicciones: neurona.contradicciones,
    patrones_repetidos: detectarPatrones(neurona),
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
    console.log(`✅ Memoria guardada — neurona: "${neurona.nombre}", producto: "${producto}"`);
  }

  neurona.memoria.push(memoria);
  return memoria;
}

// --------------------------------------------
// GUARDAR MEMORIA DE MÚLTIPLES NEURONAS
// --------------------------------------------

export async function saveMemoryRed(
  neuronas: Neurona[],
  producto: string,
  contexto: string
): Promise<void> {
  console.log(`\n💾 Guardando memoria de ${neuronas.length} neuronas para "${producto}"...\n`);

  for (const neurona of neuronas) {
    if (neurona.valor_activacion > 0) {
      await saveMemory(neurona, producto, contexto);
    }
  }

  console.log(`✅ Memoria completa guardada para "${producto}"\n`);
}

// --------------------------------------------
// DETECTAR PATRONES LOCALES DE LA NEURONA
// --------------------------------------------

function detectarPatrones(neurona: Neurona): string[] {
  const patrones: string[] = [];

  const expConfirmadas = neurona.experiencias.filter(
    (exp) => exp.confirmaciones >= 3
  );

  expConfirmadas.forEach((exp) => {
    patrones.push(
      `${exp.material}: ${exp.descripcion} (${exp.confirmaciones}x confirmado)`
    );
  });

  return patrones;
}

// --------------------------------------------
// GUARDAR RESULTADO FINAL EN MEMORIA
// --------------------------------------------

export async function saveResultado(
  producto: string,
  problema: string,
  causas: string[],
  soluciones: string[],
  confianza: number
): Promise<void> {
  const { error } = await supabase.from('resultados').insert({
    id: uuidv4(),
    producto,
    problema_detectado: problema,
    causas_fisicas: causas,
    soluciones_propuestas: soluciones,
    compatibilidades: [],
    mejoras: [],
    confianza_general: confianza,
    fecha: new Date().toISOString(),
  });

  if (error) {
    console.error('❌ Error guardando resultado:', error.message);
  } else {
    console.log(`✅ Resultado guardado para "${producto}" — confianza: ${(confianza * 100).toFixed(1)}%`);
  }
}