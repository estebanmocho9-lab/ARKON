import { AgenticNeuron } from './agenticNeuron';
import { DEFAULT_DEMO_AI_NEURON_IDS, DIRECT_AI_NEURONS } from './neurons';
import { requestLlamaAssessment, LlamaNotConfiguredError } from './llamaClient';
import { searchTursoEvidence } from './tursoEvidence';
import { supabase } from '../../supabase/client';
import {
  AIEvidenceDecision, AINeuronProfile, AINeuronRunResult, AIProductFamily,
  AIStateMatch, LlamaEvidenceAssessment, TursoEvidenceCandidate,
} from './types';

export interface AINeuronAnalysisInput {
  productName: string;
  productId?: string | number | null;
  materialId?: string | null;
  materialName?: string | null;
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
  return 'general';
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
    general: [],
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
  const stateName = input.stateName?.trim() || ({
    E01: 'comercial inicial',
    E02: 'fraguado seco',
    E03: 'degradado',
  } as Record<string, string>)[stateCode ?? ''] || null;
  const search = await searchTursoEvidence(family, input.materialName?.trim() || input.productName, profile, input.materialId ?? null, stateName);
  if (!search.configured) {
    return { agentId: profile.id, name: profile.name, attribute: profile.attribute, status: 'turso_not_configured', nucleus: profile.nucleus, connectedNeuronIds: profile.cables.map(c => c.neuronId), selectedState: stateCode, evidence: [], assessment: null, message: search.warnings[0] };
  }
  if (!search.evidence.length) return noEvidenceResult(profile, family, stateCode, 'Turso está configurado, pero esta consulta no encontró fragmentos trazables del producto/propiedades solicitados; no se solicitó a Llama que rellene el dato.');

  const usableRules = relevantContextRows(input.scientificContext?.rules, profile);
  const usableFormulas = relevantContextRows(input.scientificContext?.formulas, profile);
  const usableCrosses = relevantContextRows(input.scientificContext?.scientificCrosses, profile);
  const usableTriz = relevantContextRows(input.scientificContext?.triz, profile);
  const payload = {
    product: { name: boundedText(input.productName, 160), materialName: boundedText(input.materialName || '', 160) || null, id: input.productId ?? null, materialId: input.materialId ?? null, family, knownAliases: candidateFamilies()[family] },
    requestedState: { code: stateCode, name: boundedText(stateName, 100) || null, explicitlyProvided: Boolean(stateCode || stateName) },
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

function normalizeNeuronKey(value: string): string {
  return value.trim().toLowerCase().replace(/^ai-/, '').replace(/-inv$/, '').replace(/_/g, '');
}

/** Resolve a requested root plus every direct-neuron dependency in its cables/subcables. */
function selectConnectedNeurons(requestedIds: string[] | undefined, family: AIProductFamily): AgenticNeuron[] {
  const byId = new Map<string, AgenticNeuron>();
  const byProperty = new Map<string, AgenticNeuron>();
  for (const neuron of DIRECT_AI_NEURONS) {
    byId.set(normalizeNeuronKey(neuron.id), neuron);
    byId.set(normalizeNeuronKey(neuron.sourceNeuronId), neuron);
    byProperty.set(neuron.propertyName.toLowerCase(), neuron);
  }
  // The demo defaults to six purpose-built agents; callers may request others explicitly.
  const roots = requestedIds?.length ? requestedIds.slice(0, 12) : DEFAULT_DEMO_AI_NEURON_IDS;
  const selected = new Map<string, AgenticNeuron>();
  const queue: AgenticNeuron[] = [];
  for (const raw of roots) {
    const key = normalizeNeuronKey(raw);
    const neuron = byId.get(key) ?? byProperty.get(raw.toLowerCase());
    if (neuron && (family === 'general' || neuron.profile.appliesTo.includes(family))) queue.push(neuron);
  }
  while (queue.length) {
    const neuron = queue.shift()!;
    if (selected.has(neuron.id)) continue;
    selected.set(neuron.id, neuron);
    const dependencies = [
      ...neuron.profile.cables.filter(c => c.orientation === 'direct').map(c => c.neuronId),
      ...neuron.profile.subCables.flatMap(c => c.requiredProperties),
    ];
    for (const dependency of dependencies) {
      const key = normalizeNeuronKey(dependency);
      const connected = byId.get(key) ?? byProperty.get(dependency.toLowerCase());
      if (connected && (family === 'general' || connected.profile.appliesTo.includes(family)) && !selected.has(connected.id)) queue.push(connected);
    }
  }
  // Hard cap: no request can fan out to more than twelve Llama agents.
  return [...selected.values()].slice(0, 12);
}

export async function runAINeuronAgents(input: AINeuronAnalysisInput): Promise<AINeuronAnalysisResponse> {
  let materialName = input.materialName?.trim() || '';
  if (!materialName && input.materialId) {
    const { data } = await supabase.from('catalogo_materiales')
      .select('nombre').eq('id_material', input.materialId).maybeSingle();
    materialName = String(data?.nombre ?? '').trim();
  }
  const resolvedInput = { ...input, materialName: materialName || null };
  const family = input.family || detectProductFamily(input.productName) || (materialName ? detectProductFamily(materialName) : null) || 'general';
  const requested = resolvedInput.neuronIds?.map(id => String(id).trim()).filter(Boolean);
  const neurons = selectConnectedNeurons(requested, family);
  if (!neurons.length) {
    return {
      enabled: true, provider: 'Cloudflare Workers AI', model: MODEL, productFamily: family,
      product: boundedText(resolvedInput.productName, 160),
      state: { code: resolvedInput.stateCode ?? null, name: resolvedInput.stateName ?? null, explicitlyProvided: Boolean(resolvedInput.stateCode || resolvedInput.stateName) },
      readOnly: true, writesToSupabase: false, availableDirectAgentCount: DIRECT_AI_NEURONS.length,
      activeAgentIds: [], message: 'No se encontró una neurona raíz válida ni sus conexiones para la solicitud.', agents: [],
    };
  }
  const agents: AINeuronRunResult[] = [];
  // Bounded concurrency prevents a 50-neuron network from flooding the Llama provider.
  const concurrency = 4;
  for (let index = 0; index < neurons.length; index += concurrency) {
    const batch = neurons.slice(index, index + concurrency);
    agents.push(...await Promise.all(batch.map(neuron => runProfile(neuron, resolvedInput, family))));
  }
  return {
    enabled: true, provider: 'Cloudflare Workers AI', model: MODEL, productFamily: family,
    product: boundedText(input.productName, 160),
    state: { code: input.stateCode ?? null, name: input.stateName ?? null, explicitlyProvided: Boolean(input.stateCode || input.stateName) },
    readOnly: true, writesToSupabase: false,
    availableDirectAgentCount: DIRECT_AI_NEURONS.length,
    activeAgentIds: neurons.map(neuron => neuron.id), agents,
  };
}
