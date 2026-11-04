import { runAINeuronAgents, AINeuronAnalysisInput, AINeuronAnalysisResponse } from './agentEngine';

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
