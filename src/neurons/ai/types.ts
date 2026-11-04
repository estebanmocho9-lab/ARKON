export type AIProductFamily = 'mdf' | 'gypsum' | 'concrete' | 'general';
export type AIEvidenceDecision = 'supported' | 'conflicting' | 'rejected' | 'insufficient_evidence';
export type AIStateMatch = 'matches' | 'mismatch' | 'unknown';

export interface AINeuronCable {
  propertyName: string;
  neuronId: string;
  orientation: 'direct' | 'inverse';
  measures: string;
  searchTerms: string[];
  units: string[];
}

export interface AINeuronSubCable {
  id: string;
  purpose: string;
  requiredProperties: string[];
}

export interface AINeuronSourceMetadata {
  group: string;
  definition: string;
  referenceUnit: string;
  physicalRange: { min: number | null; max: number | null };
  relatedProperties: string[];
}

export interface AINeuronProfile {
  id: string;
  coreNeuronId: string;
  corePropertyName: string;
  name: string;
  attribute: string;
  appliesTo: AIProductFamily[];
  nucleus: string;
  methodGuidance: string;
  cables: AINeuronCable[];
  subCables: AINeuronSubCable[];
  evidenceTerms: string[];
  sourceNeuron?: AINeuronSourceMetadata;
}

export interface TursoEvidenceCandidate {
  id: string;
  table: string;
  material: string | null;
  property: string | null;
  document: string | null;
  page: number | null;
  excerpt: string;
  rawValue: string | number | null;
  unit: string | null;
  condition: string | null;
  method: string | null;
  sourceType: string | null;
  confidence: number | null;
}

export interface LlamaEvidenceAssessment {
  decision: AIEvidenceDecision;
  stateMatch: AIStateMatch;
  selectedEvidenceIds: string[];
  extractedValue: number | null;
  extractedUnit: string | null;
  confidence: number;
  rationale: string;
  missingInformation: string[];
  requiresPhysicalValidation: boolean;
}

export type AINeuronRunStatus =
  | 'analyzed'
  | 'needs_review'
  | 'no_evidence'
  | 'turso_not_configured'
  | 'llama_not_configured'
  | 'unauthorized'
  | 'error';

export interface AINeuronRunResult {
  agentId: string;
  name: string;
  attribute: string;
  status: AINeuronRunStatus;
  nucleus: string;
  connectedNeuronIds: string[];
  selectedState: string | null;
  evidence: TursoEvidenceCandidate[];
  assessment: LlamaEvidenceAssessment | null;
  message?: string;
}
