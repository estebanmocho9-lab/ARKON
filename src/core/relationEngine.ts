// ============================================
// IMPULSO IA — MOTOR DE RELACIONES NEURONALES
// ============================================

import { Neurona, ResultadoActivacion } from '../types';

// --------------------------------------------
// MAPA DE RELACIONES FÍSICAS
// Define qué neuronas se conectan con cuáles
// --------------------------------------------

export const MAPA_RELACIONES: Record<string, string[]> = {
  porosidad: ['absorcion', 'humedad', 'peso', 'cohesion', 'aislamiento_termico', 'absorcion_acustica', 'microfisuracion'],
  compacidad: ['densidad', 'dureza', 'cohesion', 'resistencia_mecanica'],
  absorcion: ['porosidad', 'humedad', 'capilaridad', 'hidrofobicidad'],
  cohesion: ['friabilidad', 'resistencia_mecanica', 'dureza', 'porosidad'],
  densidad: ['peso', 'compacidad', 'resistencia_mecanica', 'aislamiento_termico'],
  elasticidad: ['rigidez', 'flexion', 'deformacion', 'resistencia_mecanica'],
  rigidez: ['elasticidad', 'fragilidad', 'dureza', 'flexion'],
  conductividad_termica: ['aislamiento_termico', 'densidad', 'porosidad'],
  aislamiento_termico: ['conductividad_termica', 'porosidad', 'densidad'],
  dureza: ['cohesion', 'rigidez', 'resistencia_mecanica', 'fragilidad'],
  fragilidad: ['dureza', 'elasticidad', 'cohesion', 'microfisuracion'],
  humedad: ['absorcion', 'porosidad', 'capilaridad', 'corrosion'],
  capilaridad: ['humedad', 'absorcion', 'porosidad'],
  hidrofobicidad: ['absorcion', 'humedad', 'capilaridad'],
  microfisuracion: ['porosidad', 'fragilidad', 'cohesion', 'elasticidad'],
  peso: ['densidad', 'porosidad', 'aislamiento_termico'],
  flexion: ['elasticidad', 'rigidez', 'resistencia_mecanica'],
  resistencia_mecanica: ['cohesion', 'densidad', 'dureza', 'elasticidad'],
  absorcion_acustica: ['porosidad', 'densidad', 'elasticidad'],
  corrosion: ['humedad', 'porosidad', 'resistencia_quimica'],
  resistencia_quimica: ['corrosion', 'hidrofobicidad'],
  friabilidad: ['cohesion', 'dureza', 'fragilidad'],
};

// --------------------------------------------
// OBTENER RELACIONES DE UNA NEURONA
// --------------------------------------------

export function obtenerRelaciones(nombreNeurona: string): string[] {
  const nombre = nombreNeurona.toLowerCase().replace(/ /g, '_');
  return MAPA_RELACIONES[nombre] || [];
}

// --------------------------------------------
// CONECTAR NEURONAS
// --------------------------------------------

export function conectarNeuronas(
  neurona: Neurona,
  todasLasNeuronas: Neurona[]
): Neurona[] {
  const relacionesEsperadas = obtenerRelaciones(neurona.nombre);

  const neuronasConectadas = todasLasNeuronas.filter((n) =>
    relacionesEsperadas.includes(n.nombre.toLowerCase().replace(/ /g, '_'))
  );

  // Agregar IDs de conexiones a la neurona
  neurona.conexiones_neuronales = neuronasConectadas.map((n) => n.id);

  console.log(
    `🔗 Neurona "${neurona.nombre}" conectada con: ${neuronasConectadas.map((n) => n.nombre).join(', ') || 'ninguna aún'}`
  );

  return neuronasConectadas;
}

// --------------------------------------------
// PROPAGAR ACTIVACIÓN A NEURONAS CONECTADAS
// --------------------------------------------

export function propagarActivacion(
  neurona: Neurona,
  resultado: ResultadoActivacion,
  todasLasNeuronas: Neurona[]
): Neurona[] {
  const neuronasActivadas: Neurona[] = [];

  resultado.neuronas_activadas.forEach((id) => {
    const neuronaCconectada = todasLasNeuronas.find((n) => n.id === id);
    if (neuronaCconectada) {
      // Activación propagada con valor reducido (efecto de cascada)
      const valorPropagado = resultado.valor * 0.6;
      neuronaCconectada.valor_activacion = valorPropagado;
      neuronaCconectada.historial.push(
        `[${new Date().toISOString()}] Activación propagada desde "${neurona.nombre}" con valor ${valorPropagado.toFixed(2)}`
      );
      neuronasActivadas.push(neuronaCconectada);
    }
  });

  if (neuronasActivadas.length > 0) {
    console.log(
      `⚡ Activación propagada a: ${neuronasActivadas.map((n) => n.nombre).join(', ')}`
    );
  }

  return neuronasActivadas;
}

// --------------------------------------------
// DETECTAR CONTRADICCIONES FÍSICAS
// --------------------------------------------

export function detectarContradicciones(
  neurona: Neurona,
  todasLasNeuronas: Neurona[]
): string[] {
  const contradicciones: string[] = [];

  // Pares contradictorios conocidos
  const PARES_CONTRADICTORIOS: Record<string, string> = {
    porosidad: 'compacidad',
    compacidad: 'porosidad',
    absorcion: 'hidrofobicidad',
    hidrofobicidad: 'absorcion',
    elasticidad: 'rigidez',
    rigidez: 'elasticidad',
    conductividad_termica: 'aislamiento_termico',
    aislamiento_termico: 'conductividad_termica',
    cohesion: 'friabilidad',
    friabilidad: 'cohesion',
  };

  const nombreNormalizado = neurona.nombre.toLowerCase().replace(/ /g, '_');
  const opuesto = PARES_CONTRADICTORIOS[nombreNormalizado];

  if (opuesto) {
    const neuronaOpuesta = todasLasNeuronas.find(
      (n) => n.nombre.toLowerCase().replace(/ /g, '_') === opuesto
    );

    if (neuronaOpuesta && neuronaOpuesta.valor_activacion > 60 && neurona.valor_activacion > 60) {
      contradicciones.push(
        `⚠️ Contradicción física: "${neurona.nombre}" (${neurona.valor_activacion}) y "${neuronaOpuesta.nombre}" (${neuronaOpuesta.valor_activacion}) ambas en nivel alto`
      );
    }
  }

  return contradicciones;
}

// --------------------------------------------
// ANALIZAR RED COMPLETA
// --------------------------------------------

export function analizarRed(todasLasNeuronas: Neurona[]): {
  conexiones_totales: number;
  neuronas_activas: number;
  contradicciones: string[];
} {
  let conexiones_totales = 0;
  let neuronas_activas = 0;
  const contradicciones: string[] = [];

  todasLasNeuronas.forEach((neurona) => {
    conexiones_totales += neurona.conexiones_neuronales.length;
    if (neurona.valor_activacion > 0) neuronas_activas++;

    const contr = detectarContradicciones(neurona, todasLasNeuronas);
    contradicciones.push(...contr);
  });

  return {
    conexiones_totales,
    neuronas_activas,
    contradicciones,
  };
}