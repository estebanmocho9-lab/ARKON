import { AgenticNeuron } from './agenticNeuron';
import { DIRECT_AI_NEURONS, DEFAULT_DEMO_AI_NEURON_IDS } from './neurons';
import { requestLlamaAssessment, LlamaNotConfiguredError } from './llamaClient';
import { searchTursoEvidence } from './tursoEvidence';
import {
  AIEvidenceDecision, AINeuronProfile, AINeuronRunResult, AIProductFamily,
  AIStateMatch, LlamaEvidenceAssessment, TursoEvidenceCandidate,
} from './types';

export interface AINeuronAnalysisInput {
  productName: string;
  productId?: string | number | null;
  materialId?: string | null;
  family?: AIProductFamily | null;
  neuronIds?: string[];
  stateCode?: string | null;
  stateName?: string | null;
  currentProperties?: Record<string, unknown>;
  scientificContext?: {
    rules?: unknown[];
    formulas?: unknown[];
    scientificCrosses?: unknown[];
    triz?: unknown[];
  };
}

export interface AINeuronAnalysisResponse {
  enabled: true;
  provider: 'Cloudflare Workers AI';
  model: string;
  productFamily: AIProductFamily | null;
  product: string;
  state: { code: string | null; name: string | null; explicitlyProvided: boolean };
  readOnly: true;
  writesToSupabase: false;
  availableDirectAgentCount: number;
  activeAgentIds: string[];
  message?: string;
  agents: AINeuronRunResult[];
}

const ALLOWED_DECISIONS = new Set<AIEvidenceDecision>(['supported', 'conflicting', 'rejected', 'insufficient_evidence']);
const ALLOWED_STATES = new Set<AIStateMatch>(['matches', 'mismatch', 'unknown']);
const MODEL = process.env.CLOUDFLARE_MODEL?.trim() || '@cf/meta/llama-3.2-3b-instruct';

export function detectProductFamily(name: string): AIProductFamily | null {
  const normalized = String(name ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (/\bmdf\b|medium density (fibre|fiber)board|tablero.{0,35}densidad media|mueble.{0,20}mdf/.test(normalized)) return 'mdf';
  if (/yeso|gypsum|plasterboard|drywall|placa.{0,35}antihumedad/.test(normalized)) return 'gypsum';
  if (/hormigon|concrete|bloque.{0,20}cemento|masonry unit/.test(normalized)) return 'concrete';
  return null;
}

function parseModelJson(text: string): Record<string, any> | null {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try {
    const parsed = JSON.parse(cleaned);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start < 0 || end <= start) return null;
    try {
      const parsed = JSON.parse(cleaned.slice(start, end + 1));
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch { return null; }
  }
}

function boundedText(value: unknown, max = 700): string {
  return String(value ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
}

function safeContextRows(value: unknown): unknown[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 12).map((item) => {
    if (!item || typeof item !== 'object') return boundedText(item, 500);
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(item as Record<string, unknown>).slice(0, 18)) {
      if (/token|secret|password|credential|api.?key/i.test(key)) continue;
      out[key] = typeof entry === 'string' ? boundedText(entry, 700) : entry;
    }
    return out;
  });
}

function relevantContextRows(value: unknown, profile: AINeuronProfile): unknown[] {
  if (!Array.isArray(value)) return [];
  const terms = [...profile.cables.map(c => c.propertyName), ...profile.subCables.flatMap(c => [c.id, c.purpose, ...c.requiredProperties])]
    .map(term => term.toLowerCase()).filter(term => term.length >= 3);
  const matching = value.filter(item => {
    let serialized = '';
    try { serialized = JSON.stringify(item).toLowerCase(); } catch { return false; }
    return terms.some(term => serialized.includes(term));
  });
  return safeContextRows(matching.slice(0, 10));
}

function relevantCurrentProperties(value: Record<string, unknown> | undefined, profile: AINeuronProfile): Record<string, unknown> {
  if (!value || typeof value !== 'object') return {};
  const selected: Record<string, unknown> = {};
  for (const cable of profile.cables) {
    if (Object.prototype.hasOwnProperty.call(value, cable.propertyName)) selected[cable.propertyName] = value[cable.propertyName];
  }
  return selected;
}

function makeSystemPrompt(neuron: AgenticNeuron): string {
  return neuron.buildSystemInstruction();
}

function normalizeAssessment(raw: Record<string, any>, evidence: TursoEvidenceCandidate[]): LlamaEvidenceAssessment {
  const validIds = new Set(evidence.map(item => item.id));
  const selectedEvidenceIds = Array.isArray(raw.selectedEvidenceIds)
    ? [...new Set(raw.selectedEvidenceIds.filter((id: unknown): id is string => typeof id === 'string' && validIds.has(id)))].slice(0, 8)
    : [];
  let decision: AIEvidenceDecision = ALLOWED_DECISIONS.has(raw.decision) ? raw.decision : 'insufficient_evidence';
  const stateMatch: AIStateMatch = ALLOWED_STATES.has(raw.stateMatch) ? raw.stateMatch : 'unknown';
  if ((decision === 'supported' || decision === 'rejected' || decision === 'conflicting') && selectedEvidenceIds.length === 0) {
    decision = 'insufficient_evidence';
  }
  const numeric = raw.extractedValue === null || raw.extractedValue === undefined ? null : Number(raw.extractedValue);
  const numericEvidence = numeric !== null && Number.isFinite(numeric)
    ? selectedEvidenceIds.map(id => evidence.find(item => item.id === id)).find(candidate => {
      const candidateValue = Number(candidate?.rawValue);
      const candidateUnit = String(candidate?.unit ?? '').trim().toLowerCase();
      return Number.isFinite(candidateValue) && candidateValue === numeric && (!raw.extractedUnit || candidateUnit === String(raw.extractedUnit).trim().toLowerCase());
    })
    : undefined;
  const invalidReportedValue = numeric !== null && !numericEvidence;
  if (invalidReportedValue && decision === 'supported') decision = 'insufficient_evidence';
  const confidence = Number(raw.confidence);
  return {
    decision,
    stateMatch,
    selectedEvidenceIds,
    extractedValue: numericEvidence ? numeric : null,
    extractedUnit: numericEvidence?.unit ?? null,
    confidence: Number.isFinite(confidence) ? Math.max(0, Math.min(1, confidence)) : 0,
    rationale: invalidReportedValue ? 'Se descartó el valor numérico indicado por Llama porque no coincide exactamente con el valor/unidad de una fuente citada.' : boundedText(raw.rationale, 900),
    missingInformation: Array.isArray(raw.missingInformation) ? raw.missingInformation.slice(0, 12).map((x: unknown) => boundedText(x, 180)).filter(Boolean) : [],
    requiresPhysicalValidation: true,
  };
}

function candidateFamilies(): Record<AIProductFamily, string[]> {
  return {
    mdf: ['MDF', 'tablero MDF', 'tablero de fibras de densidad media', 'medium density fibreboard', 'medium density fiberboard'],
    gypsum: ['yeso', 'placa de yeso', 'placa antihumedad', 'gypsum board', 'moisture resistant gypsum board', 'plasterboard'],
    concrete: ['hormigón', 'hormigon', 'bloque de hormigón', 'bloque de concreto', 'concrete block', 'concrete masonry unit'],
  };
}

function noEvidenceResult(profile: AINeuronProfile, family: AIProductFamily, stateCode: string | null, message: string): AINeuronRunResult {
  return {
    agentId: profile.id,
    name: profile.name,
    attribute: profile.attribute,
    status: 'no_evidence',
    nucleus: profile.nucleus,
    connectedNeuronIds: profile.cables.map(cable => cable.neuronId),
    selectedState: stateCode,
    evidence: [],
    assessment: {
      decision: 'insufficient_evidence', stateMatch: 'unknown', selectedEvidenceIds: [],
      extractedValue: null, extractedUnit: null, confidence: 0, rationale: message,
      missingInformation: [`Fragmento verificable de Turso para ${family} y estado/ensayo correspondiente`],
      requiresPhysicalValidation: true,
    },
    message,
  };
}

async function runProfile(neuron: AgenticNeuron, input: AINeuronAnalysisInput, family: AIProductFamily): Promise<AINeuronRunResult> {
  const profile = neuron.profile;
  const stateCode = boundedText(input.stateCode, 32) || null;
  const search = await searchTursoEvidence(family, input.productName, profile);
  if (!search.configured) {
    return { agentId: profile.id, name: profile.name, attribute: profile.attribute, status: 'turso_not_configured', nucleus: profile.nucleus, connectedNeuronIds: profile.cables.map(c => c.neuronId), selectedState: stateCode, evidence: [], assessment: null, message: search.warnings[0] };
  }
  if (!search.evidence.length) return noEvidenceResult(profile, family, stateCode, 'Turso está configurado, pero esta consulta no encontró fragmentos trazables del producto/propiedades solicitados; no se solicitó a Llama que rellene el dato.');

  const usableRules = relevantContextRows(input.scientificContext?.rules, profile);
  const usableFormulas = relevantContextRows(input.scientificContext?.formulas, profile);
  const usableCrosses = relevantContextRows(input.scientificContext?.scientificCrosses, profile);
  const usableTriz = relevantContextRows(input.scientificContext?.triz, profile);
  const payload = {
    product: { name: boundedText(input.productName, 160), id: input.productId ?? null, materialId: input.materialId ?? null, family, knownAliases: candidateFamilies()[family] },
    requestedState: { code: stateCode, name: boundedText(input.stateName, 100) || null, explicitlyProvided: Boolean(stateCode || input.stateName) },
    neuron: {
      id: profile.id, attribute: profile.attribute, nucleus: profile.nucleus,
      sourceNeuron: profile.sourceNeuron ?? null,
      methodGuidance: profile.methodGuidance,
      cables: profile.cables.map(({ propertyName, neuronId, orientation, measures, units }) => ({ propertyName, neuronId, orientation, measures, units })),
      subCables: profile.subCables,
      evidenceTerms: profile.evidenceTerms,
    },
    currentNormalizedProperties: relevantCurrentProperties(input.currentProperties, profile),
    supabaseScientificContext: { rules: usableRules, formulas: usableFormulas, crosses: usableCrosses, triz: usableTriz },
    evidence: search.evidence.map(({ id, table, material, property, document, page, excerpt, rawValue, unit, condition, method, sourceType, confidence }) => ({ id, table, material, property, document, page, excerpt, rawValue, unit, condition, method, sourceType, confidence })),
  };

  try {
      const modelText = await requestLlamaAssessment(makeSystemPrompt(neuron), payload);
    const parsed = parseModelJson(modelText);
    if (!parsed) {
      return { agentId: profile.id, name: profile.name, attribute: profile.attribute, status: 'error', nucleus: profile.nucleus, connectedNeuronIds: profile.cables.map(c => c.neuronId), selectedState: stateCode, evidence: search.evidence, assessment: null, message: 'Llama respondió, pero el resultado no cumplió el formato JSON esperado.' };
    }
    const assessment = normalizeAssessment(parsed, search.evidence);
    const status = assessment.decision === 'insufficient_evidence' || assessment.stateMatch !== 'matches' ? 'needs_review' : 'analyzed';
    return { agentId: profile.id, name: profile.name, attribute: profile.attribute, status, nucleus: profile.nucleus, connectedNeuronIds: profile.cables.map(c => c.neuronId), selectedState: stateCode, evidence: search.evidence, assessment };
  } catch (error: any) {
    if (error instanceof LlamaNotConfiguredError) {
      return { agentId: profile.id, name: profile.name, attribute: profile.attribute, status: 'llama_not_configured', nucleus: profile.nucleus, connectedNeuronIds: profile.cables.map(c => c.neuronId), selectedState: stateCode, evidence: search.evidence, assessment: null, message: error.message };
    }
    return { agentId: profile.id, name: profile.name, attribute: profile.attribute, status: 'error', nucleus: profile.nucleus, connectedNeuronIds: profile.cables.map(c => c.neuronId), selectedState: stateCode, evidence: search.evidence, assessment: null, message: error?.message || 'Falló el análisis del agente.' };
  }
}

export async function runAINeuronAgents(input: AINeuronAnalysisInput): Promise<AINeuronAnalysisResponse> {
  const family = input.family || detectProductFamily(input.productName);
  if (!family) {
    return {
      enabled: true, provider: 'Cloudflare Workers AI', model: MODEL, productFamily: null,
      product: boundedText(input.productName, 160), state: { code: input.stateCode ?? null, name: input.stateName ?? null, explicitlyProvided: Boolean(input.stateCode || input.stateName) },
      readOnly: true, writesToSupabase: false, availableDirectAgentCount: DIRECT_AI_NEURONS.length, activeAgentIds: [],
      message: 'Producto fuera de las familias piloto habilitadas: MDF, yeso o bloque de hormigón.', agents: [],
    };
  }
  const requested = input.neuronIds?.map(id => String(id).trim()).filter(Boolean);
  const selectedIds = requested?.length ? requested : DEFAULT_DEMO_AI_NEURON_IDS;
  const selected = new Set(selectedIds);
  const neurons = DIRECT_AI_NEURONS
    .filter(neuron => neuron.profile.appliesTo.includes(family) && (selected.has(neuron.id) || selected.has(neuron.sourceNeuronId)))
    .slice(0, 12);
  const agents = await Promise.all(neurons.map(neuron => runProfile(neuron, input, family)));
  return {
    enabled: true, provider: 'Cloudflare Workers AI', model: MODEL, productFamily: family,
    product: boundedText(input.productName, 160),
    state: { code: input.stateCode ?? null, name: input.stateName ?? null, explicitlyProvided: Boolean(input.stateCode || input.stateName) },
    readOnly: true, writesToSupabase: false,
    availableDirectAgentCount: DIRECT_AI_NEURONS.length,
    activeAgentIds: neurons.map(neuron => neuron.id), agents,
  };
}
