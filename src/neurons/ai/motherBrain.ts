import { runAINeuronAgents, AINeuronAnalysisInput, AINeuronAnalysisResponse } from './agentEngine';
import { DIRECT_AI_NEURONS } from './neurons';
import { LlamaTursoDataProvider } from './llamaTursoDataProvider';
import type { NeuronOutput, EstadoMaterial } from '../base/tipos';
import { supabase } from '../../supabase/client';

/**
 * Shared Llama mother brain. It is invoked on each authorized ARKON analysis,
 * selects the requested direct AI-neurons, and coordinates their Turso/Supabase
 * evidence retrieval and per-neuron Llama instructions. Credentials stay here
 * on the server; neither a neuron nor the model receives database credentials.
 */
export class LlamaMotherBrain {
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
  const state: EstadoMaterial =
    input.stateCode === 'E02' || input.stateCode === 'E03' ? input.stateCode : 'E01';
  const normalize = (value: string) => value.trim().toLowerCase().replace(/^ai-/, '').replace(/_/g, '-');
  const requested = input.neuronIds?.length ? input.neuronIds : DIRECT_AI_NEURONS.map(n => n.id);
  const selected = requested.map(raw => {
    const key = normalize(raw);
    return DIRECT_AI_NEURONS.find(n =>
      normalize(n.id) === key ||
      normalize(n.sourceNeuronId) === key ||
      n.propertyName.toLowerCase() === raw.trim().toLowerCase()
    );
  }).filter((neuron): neuron is typeof DIRECT_AI_NEURONS[number] => Boolean(neuron));
  const unique = [...new Map(selected.map(neuron => [neuron.id, neuron])).values()];
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
