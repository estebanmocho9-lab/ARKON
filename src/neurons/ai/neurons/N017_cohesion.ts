import { AgenticNeuron } from "../agenticNeuron";
import type { AINeuronProfile } from "../types";

/** AI clone of direct ARKON neuron N-017; validates its original class at construction. */
const definition: AINeuronProfile = {
  "id": "AI-N-017",
  "coreNeuronId": "N-017",
  "corePropertyName": "cohesion",
  "name": "Neurona IA N-017 · cohesion",
  "attribute": "cohesion",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: cohesion. ARKON la define como: Cohesión interna del material (parámetro de Mohr-Coulomb). Unidad de referencia: MPa. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente cohesion, propiedad del grupo mechanical, definida en el registro ARKON como “Cohesión interna del material (parámetro de Mohr-Coulomb)”. Conserva la unidad de referencia MPa y ten el rango físico de referencia 0 a 50 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (angulo_friccion, resistencia_compresion, resistencia_traccion) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
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
    },
    {
      "propertyName": "inv_cohesion",
      "neuronId": "N-67-INV",
      "orientation": "inverse",
      "measures": "INV_Cohesión — friabilidad, tendencia a desmoronarse bajo carga",
      "searchTerms": [
        "inv cohesion",
        "INV Cohesión — friabilidad, tendencia a desmoronarse bajo carga",
        "mechanical",
        "resistencia compresion inv",
        "blandura"
      ],
      "units": [
        "kPa"
      ]
    },
    {
      "propertyName": "angulo_friccion",
      "neuronId": "N-019",
      "orientation": "direct",
      "measures": "Ángulo de fricción interna (parámetro de Mohr-Coulomb)",
      "searchTerms": [
        "angulo friccion",
        "Ángulo de fricción interna (parámetro de Mohr-Coulomb)",
        "mechanical",
        "cohesion",
        "resistencia compresion",
        "dureza mohs"
      ],
      "units": [
        "°"
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
    }
  ],
  "subCables": [
    {
      "id": "SUPABASE-cohesion",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con cohesion; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "cohesion",
        "angulo_friccion",
        "resistencia_compresion",
        "resistencia_traccion"
      ]
    }
  ],
  "evidenceTerms": [
    "cohesion",
    "Cohesión interna del material (parámetro de Mohr-Coulomb)",
    "mechanical",
    "angulo friccion",
    "resistencia compresion",
    "resistencia traccion",
    "inv cohesion",
    "INV Cohesión — friabilidad, tendencia a desmoronarse bajo carga",
    "resistencia compresion inv",
    "blandura",
    "Ángulo de fricción interna (parámetro de Mohr-Coulomb)",
    "dureza mohs",
    "Tensión máxima de compresión antes de la falla",
    "porosidad total",
    "modulo young",
    "Tensión máxima de tracción antes de la falla"
  ],
  "sourceNeuron": {
    "group": "mechanical",
    "definition": "Cohesión interna del material (parámetro de Mohr-Coulomb)",
    "referenceUnit": "MPa",
    "physicalRange": {
      "min": 0,
      "max": 50
    },
    "relatedProperties": [
      "angulo_friccion",
      "resistencia_compresion",
      "resistencia_traccion"
    ]
  }
};

export class AgentNeuronN017 extends AgenticNeuron {
  constructor() { super(definition); }
}

export const AI_NEURON_N017 = new AgentNeuronN017();
