// ============================================================
// src/core/activationEngine.ts
// LÓGICA CLAVE: neuronas sin datos se ignoran, no bloquean el cálculo.
// Los vectores se leen DIRECTAMENTE desde NORMALIZACION de Google Sheets.
// ============================================================

import { ALL_NEURONS, NEURON_MAP, NeuronOutput, NeuronInput } from '../neurons/index';
import { EstadoMaterial } from '../neurons/base/tipos';
import { getVectorFromSheet } from '../sheets/syncData';

const CONTEXTOS_ACTIVACION: Record<string, string[]> = {
  absorcion: ['absorption','porosity','permeability','diffusion','surface','chemical','pore'],
  humedad: ['absorption','porosity','permeability','diffusion','surface','chemical','pore'],
  fragilidad: ['mechanical','elasticity','density','porosity','pore'],
  aislamiento_termico: ['thermal','thermal_limits','density','diffusion','porosity'],
  termico: ['thermal','thermal_limits','density','diffusion','porosity'],
  quimico: ['chemical','composition','electrical','surface'],
  resistencia_estructural: ['mechanical','elasticity','density','composition'],
  estructural: ['mechanical','elasticity','density','composition'],
  sustentabilidad: ['environmental','density','composition'],
  sostenibilidad: ['environmental','density','composition'],
  peso: ['density','porosity','mechanical'],
  general: [],
};

const UMBRAL_CONFIANZA_MINIMO = 0.15;
const ESTADOS_LOGICOS = new Set<EstadoMaterial>(['E01', 'E02', 'E03']);

/**
 * NORMALIZACION tiene una columna Estado propia (por ejemplo Polvo,
 * Componente, Fraguado). Ese estado se usa para seleccionar la fila del
 * vector. NeuronInput, en cambio, usa el estado lógico E01/E02/E03.
 * Si el gateway no recibe un estado lógico, mantenemos E01 sin inventar
 * una conversión entre las dos taxonomías.
 */
function normalizarEstadoNeural(estado?: string): EstadoMaterial {
  return estado && ESTADOS_LOGICOS.has(estado as EstadoMaterial)
    ? estado as EstadoMaterial
    : 'E01';
}

export interface ActivationResult {
  materialId: string; estado?: string; neuronasActivadas: NeuronOutput[];
  neuronasConDatos: number; neuronasSinDatos: number; totalNeuronas: number;
  coberturaPorc: number; confianzaPromedio: number; propiedadesConDatos: number;
  propiedadesPendientes: string[]; esResultadoParcial: boolean; timestamp: string;
}

export async function activarNeuronas(materialId: string, contexto = 'general', estado?: string): Promise<ActivationResult> {
  console.log(`\n🧠 Activando neuronas — ${materialId} | contexto: ${contexto}${estado ? ` | estado: ${estado}` : ''}`);

  // FUENTE ÚNICA: Google Sheets / NORMALIZACION.
  const vector = await getVectorFromSheet(materialId, estado);
  if (!vector) {
    return {
      materialId, estado, neuronasActivadas: [], neuronasConDatos: 0, neuronasSinDatos: 0,
      totalNeuronas: 0, coberturaPorc: 0, confianzaPromedio: 0, propiedadesConDatos: 0,
      propiedadesPendientes: [], esResultadoParcial: false, timestamp: new Date().toISOString()
    };
  }

  const gruposActivos = CONTEXTOS_ACTIVACION[contexto] ?? [];
  const neuronasParaActivar = gruposActivos.length === 0 ? ALL_NEURONS : ALL_NEURONS.filter(n => gruposActivos.includes(n.group));
  const resultados: NeuronOutput[] = [];
  const propiedadesPendientes: string[] = [];
  let neuronasConDatos = 0;
  let neuronasSinDatos = 0;

  for (const neurona of neuronasParaActivar) {
    const prop = neurona.propertyName;
    const valorNormalizado = vector[prop];
    if (valorNormalizado === null || valorNormalizado === undefined) {
      neuronasSinDatos++;
      propiedadesPendientes.push(prop);
      continue;
    }

    const contextoNeural: Record<string, number> = {};
    for (const propRel of neurona.relatedProperties) {
      const val = vector[propRel];
      if (val !== null && val !== undefined) contextoNeural[propRel] = val as number;
    }

    const input: NeuronInput = {
      materialId,
      estado: normalizarEstadoNeural(estado),
      valorDirecto: valorNormalizado as number,
      contexto: contextoNeural
    };

    try {
      resultados.push(await neurona.process(input));
      neuronasConDatos++;
    } catch (err) {
      console.error(`⚠️ Neurona ${neurona.neuronId} (${prop}) falló:`, err);
      neuronasSinDatos++;
      propiedadesPendientes.push(`${prop} [error]`);
    }
  }

  const totalNeuronas = neuronasParaActivar.length;
  const coberturaPorc = totalNeuronas > 0 ? neuronasConDatos / totalNeuronas * 100 : 0;
  const confianzaPromedio = resultados.length > 0 ? resultados.reduce((sum, n) => sum + (n.confianza ?? 0), 0) / resultados.length : 0;
  const esResultadoParcial = neuronasSinDatos > 0 && neuronasConDatos > 0;
  const simbolo = coberturaPorc >= 70 ? '✅' : coberturaPorc >= 30 ? '⚠️' : '🔴';

  console.log(`${simbolo} Neuronas activadas: ${neuronasConDatos}/${totalNeuronas} (${coberturaPorc.toFixed(0)}%)`);
  if (neuronasSinDatos > 0) console.log(`   ⏭️ Ignoradas por falta de datos: ${neuronasSinDatos}`);
  if (coberturaPorc < UMBRAL_CONFIANZA_MINIMO * 100) console.log(`   ⚠️ Cobertura muy baja (${coberturaPorc.toFixed(0)}%)`);

  return {
    materialId, estado, neuronasActivadas: resultados, neuronasConDatos, neuronasSinDatos,
    totalNeuronas, coberturaPorc, confianzaPromedio, propiedadesConDatos: neuronasConDatos,
    propiedadesPendientes, esResultadoParcial, timestamp: new Date().toISOString()
  };
}

export function calcularIndicadorCruzado(activaciones: NeuronOutput[], propiedadesRequeridas: string[], nombre: string): { valor: number; cobertura: number; propFaltantes: string[] } {
  const disponibles = activaciones.filter(a => propiedadesRequeridas.includes(a.propertyName));
  const faltantes = propiedadesRequeridas.filter(p => !activaciones.some(a => a.propertyName === p));
  if (!disponibles.length) return { valor: 0, cobertura: 0, propFaltantes: faltantes };
  const sumaConfianza = disponibles.reduce((s, n) => s + (n.confianza ?? 1), 0);
  const valorPonderado = disponibles.reduce((s, n) => s + n.valorCompuesto * (n.confianza ?? 1), 0) / sumaConfianza;
  const cobertura = disponibles.length / propiedadesRequeridas.length * 100;
  if (faltantes.length) console.log(`📊 ${nombre}: ${disponibles.length}/${propiedadesRequeridas.length} propiedades; faltantes: ${faltantes.join(', ')}`);
  return { valor: Math.round(valorPonderado * 10) / 10, cobertura, propFaltantes: faltantes };
}