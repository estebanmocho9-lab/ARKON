import { ALL_NEURONS } from '../index';
import { AINeuronProfile } from './types';

/**
 * Capa aditiva de agentes IA. No sustituye ni modifica ALL_NEURONS (N001–N100).
 * Cada perfil declara su núcleo, cables hacia propiedades medibles y subcables
 * hacia fórmulas/reglas que se recuperan de Supabase para cada análisis.
 */
const DEMO_SPECIALIZED_PROFILES: AINeuronProfile[] = [
  {
    id: 'AI-N-004', coreNeuronId: 'N-004', corePropertyName: 'absorcion_agua', name: 'Neurona agente de resistencia a la humedad', attribute: 'resistencia a la humedad',
    appliesTo: ['mdf', 'gypsum', 'concrete'],
    nucleus: 'Evalúa qué evidencia existe sobre absorción de agua y desempeño frente a humedad para el producto y estado solicitados. No deduce que “antihumedad” signifique impermeable.',
    methodGuidance: 'Prioriza ensayos del producto/panel terminado, distinguiendo absorción, permeabilidad al vapor y exposición líquida. Compara resultados solo si método, acondicionamiento, espesor y estado son compatibles.',
    evidenceTerms: ['humedad', 'absorción de agua', 'absorcion de agua', 'absorción', 'permeabilidad', 'difusión de agua', 'difusion de agua', 'vapor de agua', 'ángulo de contacto', 'angulo de contacto', 'impermeabilidad'],
    cables: [
      { propertyName: 'absorcion_agua', neuronId: 'N-004', orientation: 'direct', measures: 'Agua absorbida respecto de la masa seca; buscar valor, método y acondicionamiento.', searchTerms: ['absorción de agua', 'water absorption', 'water uptake', 'absorcion agua'], units: ['%', 'kg/kg', 'g/g'] },
      { propertyName: 'porosidad_total', neuronId: 'N-003', orientation: 'direct', measures: 'Fracción/porcentaje de poros y método de determinación.', searchTerms: ['porosidad total', 'total porosity', 'porosidad'], units: ['%', 'fracción', 'm3/m3'] },
      { propertyName: 'permeabilidad_intrinseca', neuronId: 'N-027', orientation: 'direct', measures: 'Transporte de fluido por la matriz, sin confundirlo con absorción.', searchTerms: ['permeabilidad intrínseca', 'permeabilidad al agua', 'intrinsic permeability'], units: ['m2', 'm²'] },
      { propertyName: 'difusion_agua', neuronId: 'N-029', orientation: 'direct', measures: 'Difusión de agua o vapor bajo las condiciones del ensayo.', searchTerms: ['difusión de agua', 'difusividad al vapor', 'water vapor diffusion'], units: ['m2/s', 'm²/s', 'kg/(m s)'] },
      { propertyName: 'angulo_contacto', neuronId: 'N-045', orientation: 'direct', measures: 'Mojabilidad superficial; no equivale por sí sola a impermeabilidad.', searchTerms: ['ángulo de contacto', 'contact angle'], units: ['°', 'grados'] },
      { propertyName: 'impermeabilidad', neuronId: 'N-54-INV', orientation: 'inverse', measures: 'Indicador inverso registrado por ARKON; debe derivarse con método definido.', searchTerms: ['impermeabilidad', 'waterproof', 'water resistance'], units: ['adimensional', '%'] },
    ],
    subCables: [
      { id: 'IAH', purpose: 'Cruce de absorción y porosidad para humedad; usar solo fórmula activa recuperada de Supabase.', requiredProperties: ['absorcion_agua', 'porosidad_total'] },
      { id: 'IPH', purpose: 'Cruce hidráulico; verificar propiedades y unidades antes de evaluar.', requiredProperties: ['permeabilidad_intrinseca', 'conductividad_hidraulica'] },
      { id: 'CAP', purpose: 'Relación de capacidad/absorción superficial; no extrapolar fuera de la definición de Supabase.', requiredProperties: ['absorcion_agua', 'angulo_contacto'] },
    ],
  },
  {
    id: 'AI-N-018', coreNeuronId: 'N-018', corePropertyName: 'dureza_mohs', name: 'Neurona agente de dureza superficial', attribute: 'dureza', appliesTo: ['mdf', 'gypsum', 'concrete'],
    nucleus: 'Evalúa evidencia de dureza superficial del panel, identificando exactamente la escala y el método de ensayo.',
    methodGuidance: 'No conviertas ni compares Mohs, Brinell, Vickers, Shore u otros métodos sin una conversión validada y compatible. No confundas dureza superficial con resistencia estructural.',
    evidenceTerms: ['dureza', 'hardness', 'mohs', 'brinell', 'vickers', 'shore', 'indentación', 'rayado'],
    cables: [
      { propertyName: 'dureza_mohs', neuronId: 'N-018', orientation: 'direct', measures: 'Dureza declarada y escala/método de medición.', searchTerms: ['dureza', 'hardness', 'mohs', 'brinell', 'vickers', 'shore', 'scratch resistance'], units: ['Mohs', 'HV', 'HB', 'Shore', 'adimensional'] },
      { propertyName: 'blandura', neuronId: 'N-68-INV', orientation: 'inverse', measures: 'Indicador inverso; conservar método y no inferirlo como dato experimental.', searchTerms: ['blandura', 'softness'], units: ['adimensional', 'escala'] },
    ],
    subCables: [
      { id: 'DUREZA-METODO', purpose: 'Validar comparabilidad entre ensayos de dureza.', requiredProperties: ['dureza_mohs'] },
    ],
  },
  {
    id: 'AI-N-002', coreNeuronId: 'N-002', corePropertyName: 'densidad_aparente', name: 'Neurona agente de peso y densidad', attribute: 'peso/densidad', appliesTo: ['mdf', 'gypsum', 'concrete'],
    nucleus: 'Evalúa densidad aparente/real y masa superficial solo cuando las mediciones y dimensiones necesarias están documentadas.',
    methodGuidance: 'El peso de una placa no se deduce solo de la densidad: requiere volumen o dimensiones/espesor. Distingue densidad aparente de densidad real y registra humedad del espécimen.',
    evidenceTerms: ['densidad aparente', 'densidad real', 'masa por área', 'peso por metro cuadrado', 'bulk density', 'apparent density', 'areal mass'],
    cables: [
      { propertyName: 'densidad_aparente', neuronId: 'N-002', orientation: 'direct', measures: 'Masa/volumen aparente, con poros y método indicados.', searchTerms: ['densidad aparente', 'bulk density', 'apparent density', 'densidad del panel'], units: ['kg/m3', 'kg/m³', 'g/cm3', 'g/cm³'] },
      { propertyName: 'densidad_real', neuronId: 'N-001', orientation: 'direct', measures: 'Densidad de la fase sólida, distinta de la densidad aparente.', searchTerms: ['densidad real', 'true density', 'particle density'], units: ['kg/m3', 'kg/m³', 'g/cm3', 'g/cm³'] },
      { propertyName: 'volumen_especifico_aparente', neuronId: 'N-52-INV', orientation: 'inverse', measures: 'Volumen específico aparente solo si su definición/escala coincide con la de ARKON.', searchTerms: ['volumen específico aparente', 'specific apparent volume'], units: ['m3/kg', 'm³/kg'] },
    ],
    subCables: [
      { id: 'DEN', purpose: 'Indicador de densidad/peso del material, sujeto a la fórmula activa de Supabase.', requiredProperties: ['densidad_aparente'] },
      { id: 'PESO-AREA', purpose: 'Masa superficial requiere densidad y espesor medido del producto.', requiredProperties: ['densidad_aparente', 'espesor'] },
    ],
  },
  {
    id: 'AI-N-021', coreNeuronId: 'N-021', corePropertyName: 'conductividad_termica', name: 'Neurona agente de aislamiento térmico y servicio', attribute: 'aislamiento térmico/frío-calor', appliesTo: ['mdf', 'gypsum', 'concrete'],
    nucleus: 'Evalúa conducción, almacenamiento y difusión del calor, además del rango térmico documentado del producto.',
    methodGuidance: 'Para resistencia térmica R se necesita conductividad y espesor de capa; registra humedad, temperatura, densidad y método. No infieras aislamiento solo por porosidad.',
    evidenceTerms: ['conductividad térmica', 'aislamiento térmico', 'calor específico', 'difusividad térmica', 'temperatura de servicio', 'thermal conductivity', 'thermal insulation'],
    cables: [
      { propertyName: 'conductividad_termica', neuronId: 'N-021', orientation: 'direct', measures: 'Conductividad térmica del material/producto.', searchTerms: ['conductividad térmica', 'thermal conductivity', 'lambda', 'λ'], units: ['W/(m K)', 'W/(m·K)', 'W/mK'] },
      { propertyName: 'calor_especifico', neuronId: 'N-022', orientation: 'direct', measures: 'Capacidad calorífica específica, con temperatura de ensayo.', searchTerms: ['calor específico', 'specific heat capacity'], units: ['J/(kg K)', 'J/(kg·K)', 'kJ/(kg K)'] },
      { propertyName: 'difusividad_termica', neuronId: 'N-026', orientation: 'direct', measures: 'Difusividad térmica, no intercambiable con conductividad.', searchTerms: ['difusividad térmica', 'thermal diffusivity'], units: ['m2/s', 'm²/s'] },
      { propertyName: 'temperatura_servicio', neuronId: 'N-024', orientation: 'direct', measures: 'Temperatura/rango de operación declarados para el producto.', searchTerms: ['temperatura de servicio', 'service temperature', 'operating temperature'], units: ['°C', 'K'] },
      { propertyName: 'resistividad_termica', neuronId: 'N-71-INV', orientation: 'inverse', measures: 'Propiedad inversa según la definición de ARKON; distinguir de R de una capa.', searchTerms: ['resistividad térmica', 'thermal resistivity'], units: ['m K/W', 'm·K/W'] },
      { propertyName: 'retardo_termico', neuronId: 'N-76-INV', orientation: 'inverse', measures: 'Retardo térmico bajo geometría y condiciones de ensayo documentadas.', searchTerms: ['retardo térmico', 'thermal lag', 'thermal delay'], units: ['h', 's'] },
    ],
    subCables: [
      { id: 'KTERM', purpose: 'Índice de aislamiento vinculado a conductividad según la regla/fórmula de Supabase.', requiredProperties: ['conductividad_termica'] },
      { id: 'DIFTERM', purpose: 'Cruce de difusividad térmica con el sentido y escala configurados.', requiredProperties: ['difusividad_termica'] },
      { id: 'R-CAPA', purpose: 'Resistencia térmica de una capa requiere espesor y conductividad.', requiredProperties: ['conductividad_termica', 'espesor'] },
    ],
  },
  {
    id: 'AI-N-013', coreNeuronId: 'N-013', corePropertyName: 'resistencia_flexion', name: 'Neurona agente de resistencia mecánica', attribute: 'resistencia del panel', appliesTo: ['mdf', 'gypsum', 'concrete'],
    nucleus: 'Evalúa resistencia a flexión del panel y la evidencia mecánica complementaria en compresión, tracción y módulo elástico.',
    methodGuidance: 'Prioriza ensayos del producto final con orientación, dimensiones, luz, carga, acondicionamiento y norma. No compara valores de probetas o métodos distintos como equivalentes.',
    evidenceTerms: ['resistencia a flexión', 'resistencia a compresión', 'resistencia a tracción', 'módulo de young', 'flexural strength', 'bending strength'],
    cables: [
      { propertyName: 'resistencia_flexion', neuronId: 'N-013', orientation: 'direct', measures: 'Resistencia a flexión/falla en ensayo identificado.', searchTerms: ['resistencia a flexión', 'flexural strength', 'bending strength', 'modulus of rupture'], units: ['MPa', 'N/mm2', 'N/mm²'] },
      { propertyName: 'resistencia_compresion', neuronId: 'N-011', orientation: 'direct', measures: 'Resistencia a compresión y geometría/método del espécimen.', searchTerms: ['resistencia a compresión', 'compressive strength'], units: ['MPa', 'N/mm2', 'N/mm²'] },
      { propertyName: 'resistencia_traccion', neuronId: 'N-012', orientation: 'direct', measures: 'Resistencia a tracción, incluyendo orientación del panel.', searchTerms: ['resistencia a tracción', 'tensile strength', 'internal bond'], units: ['MPa', 'N/mm2', 'N/mm²'] },
      { propertyName: 'modulo_young', neuronId: 'N-014', orientation: 'direct', measures: 'Rigidez elástica, que no es igual a resistencia última.', searchTerms: ['módulo de young', 'elastic modulus', 'modulus of elasticity', 'MOE'], units: ['MPa', 'GPa', 'N/mm2'] },
      { propertyName: 'resistencia_compresion', neuronId: 'N-62-INV', orientation: 'inverse', measures: 'Indicador inverso computado por ARKON, no una observación independiente.', searchTerms: ['resistencia a compresión', 'compressive strength'], units: ['MPa', 'N/mm2'] },
    ],
    subCables: [
      { id: 'IFM', purpose: 'Índice de fragilidad: evaluar solo con las variables requeridas presentes y la ecuación activa de Supabase.', requiredProperties: ['resistencia_traccion', 'resistencia_compresion'] },
      { id: 'IEM', purpose: 'Relación módulo/densidad; conservar unidades y normalización indicadas por Supabase.', requiredProperties: ['modulo_young', 'densidad_aparente'] },
      { id: 'FLEX-COMP', purpose: 'Relacionar flexión y deformación únicamente si existe método compatible.', requiredProperties: ['resistencia_flexion', 'modulo_young'] },
    ],
  },
  {
    id: 'AI-N-014', coreNeuronId: 'N-014', corePropertyName: 'modulo_young', name: 'Neurona agente de flexibilidad y deflexión', attribute: 'flexibilidad', appliesTo: ['mdf', 'gypsum', 'concrete'],
    nucleus: 'Evalúa deformación/deflexión del panel y su rigidez elástica sin confundir capacidad de flexión con resistencia a la rotura.',
    methodGuidance: 'Una afirmación de flexibilidad requiere ensayo de carga-deflexión o datos de módulo y geometría. Para paneles, la luz, espesor, orientación, apoyos y humedad son esenciales.',
    evidenceTerms: ['deflexión', 'deflectabilidad', 'flexibilidad', 'complacencia elástica', 'módulo de elasticidad', 'flexural stiffness', 'deflection'],
    cables: [
      { propertyName: 'deflectabilidad', neuronId: 'N-63-INV', orientation: 'inverse', measures: 'Deflexión/deformabilidad según magnitud y método configurados por ARKON.', searchTerms: ['deflectabilidad', 'deflexión', 'deflection', 'deformation'], units: ['mm', '%', 'mm/mm'] },
      { propertyName: 'complacencia_elastica', neuronId: 'N-64-INV', orientation: 'inverse', measures: 'Complacencia elástica; verificar definición y unidades.', searchTerms: ['complacencia elástica', 'elastic compliance', 'compliance'], units: ['1/Pa', 'Pa-1', 'GPa-1'] },
      { propertyName: 'modulo_young', neuronId: 'N-014', orientation: 'direct', measures: 'Módulo de elasticidad como indicador de rigidez.', searchTerms: ['módulo de young', 'elastic modulus', 'modulus of elasticity', 'MOE'], units: ['MPa', 'GPa', 'N/mm2'] },
      { propertyName: 'resistencia_flexion', neuronId: 'N-013', orientation: 'direct', measures: 'Resistencia a flexión, separada de la deflexión elástica.', searchTerms: ['resistencia a flexión', 'flexural strength', 'bending strength'], units: ['MPa', 'N/mm2'] },
    ],
    subCables: [
      { id: 'FLEX-ELASTICA', purpose: 'Conectar rigidez y deformación solo con fórmula activa y propiedades dimensionales suficientes.', requiredProperties: ['modulo_young', 'deflectabilidad'] },
      { id: 'GEOMETRIA-PANEL', purpose: 'Deflexión del panel requiere dimensiones, orientación, luz y esquema de carga.', requiredProperties: ['espesor', 'luz_ensayo', 'carga'] },
    ],
  },
];

function numericNeuronId(value: unknown): number {
  const match = String(value ?? '').match(/\d+/);
  return match ? Number(match[0]) : -1;
}

function normalizedTerms(values: unknown[]): string[] {
  return [...new Set(values.map(value => String(value ?? '').replace(/_/g, ' ').trim()).filter(value => value.length >= 3))].slice(0, 16);
}

function cableFromNeuron(neuron: any) {
  const related = Array.isArray(neuron.relatedProperties) ? neuron.relatedProperties : [];
  return {
    propertyName: String(neuron.propertyName),
    neuronId: String(neuron.neuronId),
    orientation: neuron.orientation as 'direct' | 'inverse',
    measures: String(neuron.descripcion ?? neuron.propertyName),
    searchTerms: normalizedTerms([neuron.propertyName, neuron.descripcion, neuron.group, ...related]),
    units: neuron.unidadReferencia ? [String(neuron.unidadReferencia)] : [],
  };
}

function genericDirectAgent(neuron: any): AINeuronProfile {
  const relatedProperties = Array.isArray(neuron.relatedProperties) ? neuron.relatedProperties.map(String) : [];
  const relatedDirect = relatedProperties
    .map((propertyName: string) => ALL_NEURONS.find((candidate: any) => candidate.orientation === 'direct' && candidate.propertyName === propertyName))
    .filter(Boolean) as any[];
  const inverseNumber = numericNeuronId(neuron.neuronId) + 50;
  const inversePair = ALL_NEURONS.find((candidate: any) => candidate.orientation === 'inverse' && numericNeuronId(candidate.neuronId) === inverseNumber) as any;
  const cableCandidates = [neuron, inversePair, ...relatedDirect].filter(Boolean);
  const cables = [...new Map(cableCandidates.map(candidate => [String(candidate.neuronId), cableFromNeuron(candidate)])).values()];
  const terms = normalizedTerms([neuron.propertyName, neuron.descripcion, neuron.group, ...relatedProperties, ...cables.flatMap(cable => cable.searchTerms)]);
  return {
    id: `AI-${neuron.neuronId}`,
    coreNeuronId: String(neuron.neuronId),
    corePropertyName: String(neuron.propertyName),
    name: `Neurona IA ${neuron.neuronId} · ${neuron.propertyName}`,
    attribute: String(neuron.propertyName),
    appliesTo: ['mdf', 'gypsum', 'concrete'],
    nucleus: `Magnitud central: ${neuron.propertyName}. ARKON la define como: ${neuron.descripcion}. Unidad de referencia: ${neuron.unidadReferencia}. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.`,
    methodGuidance: 'Exige fuente trazable, valor/unidad, método y condición/estado del espécimen cuando estén disponibles. No conviertas escalas ni inventes normalizaciones. Separa dato documental de cálculo ARKON y marca faltantes/contradicciones.',
    cables,
    subCables: [{ id: `SUPABASE-${neuron.propertyName}`, purpose: `Consultar reglas y fórmulas activas de Supabase relacionadas con ${neuron.propertyName}; comprobar entradas, unidades y dominio antes de razonar.`, requiredProperties: [String(neuron.propertyName), ...relatedProperties] }],
    evidenceTerms: terms,
  };
}

const specializedByNeuron = new Map(DEMO_SPECIALIZED_PROFILES.map(profile => [profile.coreNeuronId, profile]));
const directNeuronClasses = ALL_NEURONS.filter((neuron: any) => neuron.orientation === 'direct');

/** Exactly 50 AI agent profiles, one for each existing direct neuron N-001–N-050.
 * Six product-relevant agents are enriched with demo-specific measurement cables.
 * The rest remain available for explicit, targeted activation; they are not all
 * called on every product analysis.
 */
export const AI_NEURON_PROFILES: AINeuronProfile[] = directNeuronClasses.map((neuron: any) =>
  specializedByNeuron.get(String(neuron.neuronId)) ?? genericDirectAgent(neuron)
);

export const DEFAULT_DEMO_AI_NEURON_IDS = ['AI-N-004', 'AI-N-018', 'AI-N-002', 'AI-N-021', 'AI-N-013', 'AI-N-014'];
