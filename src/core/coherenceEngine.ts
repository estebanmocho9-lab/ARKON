// ============================================
// IMPULSO IA — MOTOR DE COHERENCIA FÍSICA
// ============================================

import { Neurona, ResultadoActivacion } from '../types';

// --------------------------------------------
// RANGOS FÍSICOS ESPERADOS POR PROPIEDAD
// Define valores normales para cada propiedad
// --------------------------------------------

const RANGOS_ESPERADOS: Record<string, { min: number; max: number }> = {
  porosidad:             { min: 0,  max: 100 },
  compacidad:            { min: 0,  max: 100 },
  absorcion:             { min: 0,  max: 100 },
  cohesion:              { min: 0,  max: 100 },
  densidad:              { min: 0,  max: 100 },
  elasticidad:           { min: 0,  max: 100 },
  rigidez:               { min: 0,  max: 100 },
  dureza:                { min: 0,  max: 100 },
  fragilidad:            { min: 0,  max: 100 },
  humedad:               { min: 0,  max: 100 },
  capilaridad:           { min: 0,  max: 100 },
  hidrofobicidad:        { min: 0,  max: 100 },
  microfisuracion:       { min: 0,  max: 100 },
  peso:                  { min: 0,  max: 100 },
  flexion:               { min: 0,  max: 100 },
  resistencia_mecanica:  { min: 0,  max: 100 },
  absorcion_acustica:    { min: 0,  max: 100 },
  conductividad_termica: { min: 0,  max: 100 },
  aislamiento_termico:   { min: 0,  max: 100 },
  corrosion:             { min: 0,  max: 100 },
  resistencia_quimica:   { min: 0,  max: 100 },
  friabilidad:           { min: 0,  max: 100 },
};

// --------------------------------------------
// VALIDAR COHERENCIA DE UNA NEURONA
// --------------------------------------------

export function validarCoherencia(neurona: Neurona): {
  coherente: boolean;
  puntaje: number;
  observaciones: string[];
} {
  const observaciones: string[] = [];
  let puntaje = 1.0;

  const nombre = neurona.nombre.toLowerCase().replace(/ /g, '_');
  const rango = RANGOS_ESPERADOS[nombre];

  // Verificar que el valor esté en rango
  if (rango) {
    if (neurona.valor_activacion < rango.min || neurona.valor_activacion > rango.max) {
      observaciones.push(
        `⚠️ Valor fuera de rango: ${neurona.valor_activacion} (esperado ${rango.min}–${rango.max})`
      );
      puntaje -= 0.3;
    }
  }

  // Verificar coherencia con experiencias
  if (neurona.experiencias.length > 0) {
    const confianzaPromedio =
      neurona.experiencias.reduce((acc, exp) => acc + exp.confirmaciones, 0) /
      neurona.experiencias.length;

    if (confianzaPromedio >= 5) {
      observaciones.push(`✅ Alta confianza por experiencias acumuladas`);
      puntaje = Math.min(1, puntaje + 0.2);
    }
  }

  // Verificar contradicciones internas
  if (neurona.contradicciones.length > 0) {
    observaciones.push(
      `⚠️ Contradicciones detectadas: ${neurona.contradicciones.join(', ')}`
    );
    puntaje -= 0.2 * neurona.contradicciones.length;
  }

  // Verificar historial de activaciones
  if (neurona.historial.length > 10) {
    observaciones.push(`✅ Neurona con historial amplio — mayor confiabilidad`);
    puntaje = Math.min(1, puntaje + 0.1);
  }

  puntaje = Math.max(0, Math.min(1, puntaje));

  return {
    coherente: puntaje >= 0.6,
    puntaje,
    observaciones,
  };
}

// --------------------------------------------
// VALIDAR COHERENCIA DE TODA LA RED
// --------------------------------------------

export function validarRedCompleta(neuronas: Neurona[]): {
  coherencia_global: number;
  neuronas_coherentes: number;
  neuronas_incoherentes: number;
  reporte: Record<string, { puntaje: number; observaciones: string[] }>;
} {
  const reporte: Record<string, { puntaje: number; observaciones: string[] }> = {};
  let sumaCoherencia = 0;
  let coherentes = 0;
  let incoherentes = 0;

  neuronas.forEach((neurona) => {
    const resultado = validarCoherencia(neurona);
    reporte[neurona.nombre] = {
      puntaje: resultado.puntaje,
      observaciones: resultado.observaciones,
    };

    sumaCoherencia += resultado.puntaje;

    if (resultado.coherente) {
      coherentes++;
    } else {
      incoherentes++;
    }

    neurona.coherencia = resultado.puntaje;
  });

  const coherencia_global =
    neuronas.length > 0 ? sumaCoherencia / neuronas.length : 0;

  console.log(`\n📊 COHERENCIA GLOBAL DE LA RED: ${(coherencia_global * 100).toFixed(1)}%`);
  console.log(`✅ Neuronas coherentes: ${coherentes}`);
  console.log(`⚠️  Neuronas incoherentes: ${incoherentes}\n`);

  return {
    coherencia_global,
    neuronas_coherentes: coherentes,
    neuronas_incoherentes: incoherentes,
    reporte,
  };
}

// --------------------------------------------
// DETECTAR INCONSISTENCIAS FÍSICAS
// --------------------------------------------

export function detectarInconsistencias(
  resultados: ResultadoActivacion[]
): string[] {
  const inconsistencias: string[] = [];

  resultados.forEach((resultado) => {
    if (resultado.coherencia < 0.4) {
      inconsistencias.push(
        `⚠️ Baja coherencia en neurona ${resultado.neurona_id}: ${(resultado.coherencia * 100).toFixed(1)}%`
      );
    }

    if (resultado.valor > 90) {
      inconsistencias.push(
        `⚠️ Valor extremo detectado en neurona ${resultado.neurona_id}: ${resultado.valor}`
      );
    }
  });

  return inconsistencias;
}