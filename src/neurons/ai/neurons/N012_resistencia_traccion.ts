import { AgenticNeuron } from "../agenticNeuron";
import type { AINeuronProfile } from "../types";

/** AI clone of direct ARKON neuron N-012; validates its original class at construction. */
const definition: AINeuronProfile = {
  "id": "AI-N-012",
  "coreNeuronId": "N-012",
  "corePropertyName": "resistencia_traccion",
  "name": "Neurona IA N-012 · resistencia_traccion",
  "attribute": "resistencia_traccion",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: resistencia_traccion. ARKON la define como: Tensión máxima de tracción antes de la falla. Unidad de referencia: MPa. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente resistencia_traccion, propiedad del grupo mechanical, definida en el registro ARKON como “Tensión máxima de tracción antes de la falla”. Conserva la unidad de referencia MPa y ten el rango físico de referencia 0 a 100 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (resistencia_compresion, modulo_young, cohesion) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
    {
      "propertyName": "resistencia_traccion",
      "neuronId": "N-012",
      "orientation": "direct",
      "measures": "Tensión máxima de tracción antes de la falla",
      "searchTerms": [
        "resistencia traccion",
        "Tensión máxima de tracción antes de la falla",
        "mechanical",
        "resistencia compresion",
        "modulo young",
        "cohesion"
      ],
      "units": [
        "MPa"
      ]
    },
    {
      "propertyName": "resistencia_compresion_inv",
      "neuronId": "N-62-INV",
      "orientation": "inverse",
      "measures": "Resistencia a compresión inversa — fragilidad ante impacto",
      "searchTerms": [
        "resistencia compresion inv",
        "Resistencia a compresión inversa — fragilidad ante impacto",
        "mechanical",
        "resistencia traccion inv",
        "complacencia elastica"
      ],
      "units": [
        "MPa"
      ]
    },
    {
      "propertyName": "resistencia_compresion",
      "neuronId": "N-011",
      "orientation": "direct",
      "measures": "Tensión máxima de compresión antes de la falla",
      "searchTerms": [
        "resistencia compresion",
        "Tensión máxima de compresión antes de la falla",
        "mechanical",
        "porosidad total",
        "resistencia traccion",
        "modulo young"
      ],
      "units": [
        "MPa"
      ]
    },
    {
      "propertyName": "modulo_young",
      "neuronId": "N-014",
      "orientation": "direct",
      "measures": "Módulo de elasticidad longitudinal (rigidez)",
      "searchTerms": [
        "modulo young",
        "Módulo de elasticidad longitudinal (rigidez)",
        "elasticity",
        "resistencia compresion",
        "poisson",
        "modulo corte"
      ],
      "units": [
        "GPa"
      ]
    },
    {
      "propertyName": "cohesion",
      "neuronId": "N-017",
      "orientation": "direct",
      "measures": "Cohesión interna del material (parámetro de Mohr-Coulomb)",
      "searchTerms": [
        "cohesion",
        "Cohesión interna del material (parámetro de Mohr-Coulomb)",
        "mechanical",
        "angulo friccion",
        "resistencia compresion",
        "resistencia traccion"
      ],
      "units": [
        "MPa"
      ]
    }
  ],
  "subCables": [
    {
      "id": "SUPABASE-resistencia_traccion",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con resistencia_traccion; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "resistencia_traccion",
        "resistencia_compresion",
        "modulo_young",
        "cohesion"
      ]
    }
  ],
  "evidenceTerms": [
    "resistencia traccion",
    "Tensión máxima de tracción antes de la falla",
    "mechanical",
    "resistencia compresion",
    "modulo young",
    "cohesion",
    "resistencia compresion inv",
    "Resistencia a compresión inversa — fragilidad ante impacto",
    "resistencia traccion inv",
    "complacencia elastica",
    "Tensión máxima de compresión antes de la falla",
    "porosidad total",
    "Módulo de elasticidad longitudinal (rigidez)",
    "elasticity",
    "poisson",
    "modulo corte"
  ],
  "sourceNeuron": {
    "group": "mechanical",
    "definition": "Tensión máxima de tracción antes de la falla",
    "referenceUnit": "MPa",
    "physicalRange": {
      "min": 0,
      "max": 100
    },
    "relatedProperties": [
      "resistencia_compresion",
      "modulo_young",
      "cohesion"
    ]
  }
};

export class AgentNeuronN012 extends AgenticNeuron {
  constructor() { super(definition); }
}

export const AI_NEURON_N012 = new AgentNeuronN012();
