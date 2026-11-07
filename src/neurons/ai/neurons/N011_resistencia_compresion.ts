import { AgenticNeuron } from "../agenticNeuron";
import type { AINeuronProfile } from "../types";

/** AI clone of direct ARKON neuron N-011; validates its original class at construction. */
const definition: AINeuronProfile = {
  "id": "AI-N-011",
  "coreNeuronId": "N-011",
  "corePropertyName": "resistencia_compresion",
  "name": "Neurona IA N-011 · resistencia_compresion",
  "attribute": "resistencia_compresion",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: resistencia_compresion. ARKON la define como: Tensión máxima de compresión antes de la falla. Unidad de referencia: MPa. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente resistencia_compresion, propiedad del grupo mechanical, definida en el registro ARKON como “Tensión máxima de compresión antes de la falla”. Conserva la unidad de referencia MPa y ten el rango físico de referencia 0 a 500 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (porosidad_total, resistencia_traccion, modulo_young) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
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
      "propertyName": "resistencia_traccion_inv",
      "neuronId": "N-61-INV",
      "orientation": "inverse",
      "measures": "Resistencia a tracción — límite ante fuerzas de tensión",
      "searchTerms": [
        "resistencia traccion inv",
        "Resistencia a tracción — límite ante fuerzas de tensión",
        "mechanical",
        "resistencia compresion inv",
        "inv cohesion"
      ],
      "units": [
        "MPa"
      ]
    },
    {
      "propertyName": "porosidad_total",
      "neuronId": "N-003",
      "orientation": "direct",
      "measures": "Fracción de volumen de vacíos respecto al volumen total",
      "searchTerms": [
        "porosidad total",
        "Fracción de volumen de vacíos respecto al volumen total",
        "porosity",
        "densidad aparente",
        "absorcion agua",
        "resistencia compresion"
      ],
      "units": [
        "%"
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
    }
  ],
  "subCables": [
    {
      "id": "SUPABASE-resistencia_compresion",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con resistencia_compresion; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "resistencia_compresion",
        "porosidad_total",
        "resistencia_traccion",
        "modulo_young"
      ]
    }
  ],
  "evidenceTerms": [
    "resistencia compresion",
    "Tensión máxima de compresión antes de la falla",
    "mechanical",
    "porosidad total",
    "resistencia traccion",
    "modulo young",
    "resistencia traccion inv",
    "Resistencia a tracción — límite ante fuerzas de tensión",
    "resistencia compresion inv",
    "inv cohesion",
    "Fracción de volumen de vacíos respecto al volumen total",
    "porosity",
    "densidad aparente",
    "absorcion agua",
    "Tensión máxima de tracción antes de la falla",
    "cohesion"
  ],
  "sourceNeuron": {
    "group": "mechanical",
    "definition": "Tensión máxima de compresión antes de la falla",
    "referenceUnit": "MPa",
    "physicalRange": {
      "min": 0,
      "max": 500
    },
    "relatedProperties": [
      "porosidad_total",
      "resistencia_traccion",
      "modulo_young"
    ]
  }
};

export class AgentNeuronN011 extends AgenticNeuron {
  constructor() { super(definition); }
}

export const AI_NEURON_N011 = new AgentNeuronN011();
