import type { NeuronDataProvider, NeuronDataVector, EstadoMaterial } from '../base/tipos';
import { DIRECT_AI_NEURONS } from './neurons';
import { searchTursoEvidence } from './tursoEvidence';
import { requestLlamaAssessment } from './llamaClient';
import type { AINeuronProfile, AIProductFamily } from './types';
import { supabase } from '../../supabase/client';

function parseJson(raw: string): Record<string, unknown> | null {
  const cleaned = raw.trim().replace(/^\x60\x60\x60(?:json)?\s*/i, '').replace(/\s*\x60\x60\x60$/, '');
  try {
    const value = JSON.parse(cleaned);
    return value && typeof value === 'object' ? value as Record<string, unknown> : null;
  } catch { return null; }
}

function isExplicitArkonNormalizedUnit(unit: string | null): boolean {
  return Boolean(unit && /0\s*[-–]\s*100/i.test(unit));
}

function profileFor(propertyName: string): AINeuronProfile {
  const known = DIRECT_AI_NEURONS.find(n => n.propertyName === propertyName)?.profile;
  if (known) return known;
  return {
    id: `AI-LOOKUP-${propertyName}`, coreNeuronId: 'LOOKUP', corePropertyName: propertyName,
    name: `Solicitud de dato ${propertyName}`, attribute: propertyName, appliesTo: ['general'],
    nucleus: `Recuperar el dato exacto de ${propertyName}; no calcular ni convertir escalas.`,
    methodGuidance: 'Conservar unidad, método, condición y procedencia. No inferir equivalencias.',
    cables: [{ propertyName, neuronId: 'LOOKUP', orientation: 'direct', measures: propertyName, searchTerms: [propertyName], units: [] }],
    subCables: [], evidenceTerms: [propertyName],
  };
}

/**
 * Broker de lectura: la neurona solicita una propiedad concreta; el cerebro
 * consulta Turso y Llama identifica un fragmento exacto. No calcula ni convierte
 * valores físicos a la escala normalizada 0–100.
 */
export class LlamaTursoDataProvider implements NeuronDataProvider {
  private readonly cache = new Map<string, number | null>();
  private readonly vectorCache = new Map<string, NeuronDataVector>();
  private readonly materialNames = new Map<string, string>();
  private readonly family: AIProductFamily;

  constructor(
    private readonly materialId: string,
    private readonly materialName: string,
    private readonly state: EstadoMaterial,
    private readonly stateName?: string | null,
  ) {
    const normalized = materialName.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '');
    this.family = /\\bmdf\\b|medium density (fibre|fiber)board/.test(normalized)
      ? 'mdf'
      : /yeso|gypsum|plasterboard|drywall/.test(normalized)
        ? 'gypsum'
        : /hormigon|concrete/.test(normalized)
          ? 'concrete'
          : 'general';
  }

  private key(materialId: string, propertyName: string, state: EstadoMaterial): string {
    return `${materialId.toUpperCase()}|${propertyName.toLowerCase()}|${state}`;
  }

  async getNormalizedValue(materialId: string, propertyName: string, estado: EstadoMaterial): Promise<number | null> {
    const key = this.key(materialId, propertyName, estado);
    if (this.cache.has(key)) return this.cache.get(key) ?? null;
    let materialName = this.materialNames.get(materialId.toUpperCase());
    if (!materialName) {
      if (materialId.toUpperCase() === this.materialId.toUpperCase()) {
        materialName = this.materialName;
      } else {
        const { data } = await supabase.from('catalogo_materiales')
          .select('nombre').eq('id_material', materialId).maybeSingle();
        materialName = String(data?.nombre ?? '').trim();
      }
      if (!materialName) {
        this.cache.set(key, null);
        return null;
      }
      this.materialNames.set(materialId.toUpperCase(), materialName);
    }

    const profile = profileFor(propertyName);
    const search = await searchTursoEvidence(
      this.family, materialName, profile, materialId, (materialId.toUpperCase() === this.materialId.toUpperCase() && estado === this.state ? this.stateName : null) || (estado === 'E01' ? 'comercial inicial' : estado === 'E02' ? 'fraguado seco' : 'degradado'),
    );
    if (!search.configured || search.evidence.length === 0) {
      this.cache.set(key, null);
      return null;
    }

    const payload = {
      task: 'Seleccionar un dato ya normalizado por ARKON. No calcular, estimar ni convertir unidades.',
      required: { materialId, materialName, propertyName, state: estado, normalizedScale: '0-100' },
      candidates: search.evidence.map(item => ({
        id: item.id, material: item.material, property: item.property, rawValue: item.rawValue,
        unit: item.unit, condition: item.condition, method: item.method, document: item.document,
        page: item.page, excerpt: item.excerpt,
      })),
      responseSchema: { evidenceId: 'ID exacto de candidato', value: 'número exacto de rawValue', unit: 'unidad exacta', normalizedScale: '0-100 solo si la fuente lo declara explícitamente; de lo contrario null' },
    };
    const answer = await requestLlamaAssessment(
      'Actúas como intermediario de recuperación documental de ARKON. Elige un candidato solo si coincide exactamente con material, propiedad y estado, y la fuente declara explícitamente que el valor ya está normalizado en escala ARKON 0–100. No conviertas porcentajes físicos ni valores de laboratorio. Si no existe coincidencia inequívoca, responde evidenceId=null, value=null, unit=null, normalizedScale=null. Devuelve únicamente JSON.',
      payload,
    );
    const parsed = parseJson(answer);
    const candidate = search.evidence.find(item => item.id === parsed?.evidenceId);
    const value = Number(parsed?.value);
    const exactCandidateValue = candidate?.rawValue === null || candidate?.rawValue === undefined
      ? NaN : Number(candidate.rawValue);
    const normalizeLabel = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
    const candidateMaterial = normalizeLabel(candidate?.material ?? '');
    const requestedMaterial = normalizeLabel(materialName);
    const materialMatches = Boolean(candidateMaterial && requestedMaterial &&
      (candidateMaterial === requestedMaterial || candidateMaterial.includes(requestedMaterial) || requestedMaterial.includes(candidateMaterial)));
    const candidateProperty = normalizeLabel(candidate?.property ?? '');
    const expectedProperties = [propertyName, ...profile.evidenceTerms].map(normalizeLabel);
    const propertyMatches = Boolean(candidateProperty && expectedProperties.some(term => term && (candidateProperty === term || candidateProperty.includes(term) || term.includes(candidateProperty))));
    const valid = Boolean(
      candidate && materialMatches && propertyMatches &&
      Number.isFinite(value) &&
      value === exactCandidateValue &&
      value >= 0 && value <= 100 &&
      typeof parsed?.unit === 'string' &&
      parsed.unit.trim().toLowerCase() === String(candidate.unit ?? '').trim().toLowerCase() &&
      parsed?.normalizedScale === '0-100' &&
      isExplicitArkonNormalizedUnit(candidate.unit),
    );
    const normalized = valid ? value : null;
    this.cache.set(key, normalized);
    if (normalized !== null) {
      const vectorKey = `${materialId.toUpperCase()}|${estado}`;
      const current: NeuronDataVector = this.vectorCache.get(vectorKey) ?? { materialId, estado, propiedades: {} };
      current.propiedades[propertyName] = normalized;
      this.vectorCache.set(vectorKey, current);
    }
    return normalized;
  }

  async getMaterialVector(materialId: string, estado: EstadoMaterial): Promise<NeuronDataVector | null> {
    return this.vectorCache.get(`${materialId.toUpperCase()}|${estado}`) ?? null;
  }
}
