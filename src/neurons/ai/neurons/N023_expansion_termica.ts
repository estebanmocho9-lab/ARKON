import { AgenticNeuron } from "../agenticNeuron";
import type { AINeuronProfile } from "../types";

/** AI clone of direct ARKON neuron N-023; validates its original class at construction. */
const definition: AINeuronProfile = {
  "id": "AI-N-023",
  "coreNeuronId": "N-023",
  "corePropertyName": "expansion_termica",
  "name": "Neurona IA N-023 · expansion_termica",
  "attribute": "expansion_termica",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: expansion_termica. ARKON la define como: Coeficiente de expansión térmica lineal. Unidad de referencia: 10^-6/K. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente expansion_termica, propiedad del grupo thermal, definida en el registro ARKON como “Coeficiente de expansión térmica lineal”. Conserva la unidad de referencia 10^-6/K y ten el rango físico de referencia 0 a 50 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (modulo_young, resistencia_traccion, temperatura_servicio) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
    {
      "propertyName": "expansion_termica",
      "neuronId": "N-023",
      "orientation": "direct",
      "measures": "Coeficiente de expansión térmica lineal",
      "searchTerms": [
        "expansion termica",
        "Coeficiente de expansión térmica lineal",
        "thermal",
        "modulo young",
        "resistencia traccion",
        "temperatura servicio"
      ],
      "units": [
        "10^-6/K"
      ]
    },
    {
      "propertyName": "contraccion_termica",
      "neuronId": "N-73-INV",
      "orientation": "inverse",
      "measures": "Contracción térmica — tendencia a contraerse con el frío",
      "searchTerms": [
        "contraccion termica",
        "Contracción térmica — tendencia a contraerse con el frío",
        "thermal",
        "complacencia elastica",
        "resistividad termica"
      ],
      "units": [
        "10⁻⁶/°C"
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
      "propertyName": "temperatura_servicio",
      "neuronId": "N-024",
      "orientation": "direct",
      "measures": "Temperatura máxima de servicio sin degradación significativa",
      "searchTerms": [
        "temperatura servicio",
        "Temperatura máxima de servicio sin degradación significativa",
        "thermal limits",
        "expansion termica",
        "temperatura fusion",
        "calor especifico"
      ],
      "units": [
        "°C"
      ]
    }
  ],
  "subCables": [
    {
      "id": "SUPABASE-expansion_termica",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con expansion_termica; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "expansion_termica",
        "modulo_young",
        "resistencia_traccion",
        "temperatura_servicio"
      ]
    }
  ],
  "evidenceTerms": [
    "expansion termica",
    "Coeficiente de expansión térmica lineal",
    "thermal",
    "modulo young",
    "resistencia traccion",
    "temperatura servicio",
    "contraccion termica",
    "Contracción térmica — tendencia a contraerse con el frío",
    "complacencia elastica",
    "resistividad termica",
    "Módulo de elasticidad longitudinal (rigidez)",
    "elasticity",
    "resistencia compresion",
    "poisson",
    "modulo corte",
    "Tensión máxima de tracción antes de la falla"
  ],
  "sourceNeuron": {
    "group": "thermal",
    "definition": "Coeficiente de expansión térmica lineal",
    "referenceUnit": "10^-6/K",
    "physicalRange": {
      "min": 0,
      "max": 50
    },
    "relatedProperties": [
      "modulo_young",
      "resistencia_traccion",
      "temperatura_servicio"
    ]
  }
};

export class AgentNeuronN023 extends AgenticNeuron {
  constructor() { super(definition); }
}

export const AI_NEURON_N023 = new AgentNeuronN023();
