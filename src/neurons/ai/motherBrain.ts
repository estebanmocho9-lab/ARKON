import { runAINeuronAgents, AINeuronAnalysisInput, AINeuronAnalysisResponse } from './agentEngine';
import { DIRECT_AI_NEURONS } from './neurons';
import { LlamaTursoDataProvider } from './llamaTursoDataProvider';
import type { NeuronOutput, EstadoMaterial } from '../base/tipos';
import { supabase } from '../../supabase/client';
import { requestLlamaAssessment } from './llamaClient';

/**
 * Shared Llama mother brain. It is invoked on each authorized ARKON analysis,
 * selects the requested direct AI-neurons, and coordinates their Turso/Supabase
 * evidence retrieval and per-neuron Llama instructions. Credentials stay here
 * on the server; neither a neuron nor the model receives database credentials.
 */
export class LlamaMotherBrain {
  /**
   * Direct communication test between the mother brain and Cloudflare Workers AI.
   * This deliberately does not access Turso, Supabase, or any neuron.
   */
  async testLlamaConnection(): Promise<{ connected: true; provider: 'Cloudflare Workers AI'; model: string; response: string }> {
    const model = process.env.CLOUDFLARE_MODEL?.trim() || '@cf/meta/llama-3.2-3b-instruct';
    const response = await requestLlamaAssessment(
      'Eres Llama, conectado directamente al cerebro madre de ARKON. Esta es únicamente una prueba de comunicación. No consultes bases de datos ni ejecutes cálculos. Confirma brevemente que recibiste el mensaje del cerebro madre.',
      { type: 'brain_llama_connection_test', source: 'ARKON mother brain', instruction: 'Confirmar recepción del mensaje.' },
    );
    return { connected: true, provider: 'Cloudflare Workers AI', model, response };
  }

  async analyze(input: AINeuronAnalysisInput): Promise<AINeuronAnalysisResponse> {
    return runAINeuronAgents(input);
  }
}

export const llamaMotherBrain = new LlamaMotherBrain();

export function analyzeWithLlamaMotherBrain(input: AINeuronAnalysisInput): Promise<AINeuronAnalysisResponse> {
  return llamaMotherBrain.analyze(input);
}


export interface AINeuronCalculationInput {
  productName: string;
  materialId: string;
  stateCode?: string | null;
  stateName?: string | null;
  neuronIds?: string[];
}

export interface AINeuronCalculationResponse {
  mode: 'original-scientific-engine-with-llama-turso-provider';
  materialId: string;
  state: EstadoMaterial;
  requestedNeuronIds: string[];
  results: NeuronOutput[];
}

/**
 * Executes the original scientific NeuronBase calculation through each AI clone.
 * The clone forwards execution to its source neuron; only the data provider changes.
 * Formula dependencies continue through the original NEURON_MAP and inherit the
 * same provider through NeuronInput.
 */
export async function runAINeuronCalculations(input: AINeuronCalculationInput): Promise<AINeuronCalculationResponse> {
  if (input.stateCode !== 'E01' && input.stateCode !== 'E02' && input.stateCode !== 'E03') {
    throw new Error('Debe indicarse explícitamente E01, E02 o E03; no se asigna un estado material por defecto.');
  }
  const state: EstadoMaterial = input.stateCode;
  const normalize = (value: string) => value.trim().toLowerCase().replace(/^ai-/, '').replace(/-inv$/, '').replace(/[_-]/g, '');
  const byId = new Map<string, typeof DIRECT_AI_NEURONS[number]>();
  const byProperty = new Map<string, typeof DIRECT_AI_NEURONS[number]>();
  for (const neuron of DIRECT_AI_NEURONS) {
    byId.set(normalize(neuron.id), neuron);
    byId.set(normalize(neuron.sourceNeuronId), neuron);
    byProperty.set(normalize(neuron.propertyName), neuron);
  }
  // A named property activates its connected network; no filter means all 50 direct neurons.
  const roots = input.neuronIds?.length ? input.neuronIds : DIRECT_AI_NEURONS.map(neuron => neuron.id);
  const selected = new Map<string, typeof DIRECT_AI_NEURONS[number]>();
  const queue = roots.map(raw => byId.get(normalize(raw)) ?? byProperty.get(normalize(raw))).filter(
    (neuron): neuron is typeof DIRECT_AI_NEURONS[number] => Boolean(neuron),
  );
  while (queue.length) {
    const neuron = queue.shift()!;
    if (selected.has(neuron.id)) continue;
    selected.set(neuron.id, neuron);
    const dependencies = [
      ...neuron.profile.cables.filter(cable => cable.orientation === 'direct').map(cable => cable.neuronId),
      ...(neuron.profile.sourceNeuron?.relatedProperties ?? []),
      ...neuron.profile.subCables.flatMap(cable => cable.requiredProperties),
    ];
    for (const dependency of dependencies) {
      const connected = byId.get(normalize(dependency)) ?? byProperty.get(normalize(dependency));
      if (connected && !selected.has(connected.id)) queue.push(connected);
    }
  }
  const unique = [...selected.values()];
  if (!unique.length) throw new Error('No se reconocieron neuronas directas solicitadas.');
  const { data: material } = await supabase.from('catalogo_materiales')
    .select('nombre, nombre_en, sinonimos').eq('id_material', input.materialId).maybeSingle();
  const materialName = String(material?.nombre ?? input.productName).trim();
  const provider = new LlamaTursoDataProvider(input.materialId, materialName, state, input.stateName);
  const results: NeuronOutput[] = [];
  for (const neuron of unique) {
    const result = await neuron.process({
      materialId: input.materialId,
      estado: state,
      dataProvider: provider,
      persistMemory: false,
    });
    results.push(result);
  }
  return {
    mode: 'original-scientific-engine-with-llama-turso-provider',
    materialId: input.materialId,
    state,
    requestedNeuronIds: unique.map(n => n.id),
    results,
  };
}
