import { AgenticNeuron } from "../agenticNeuron";
import type { AINeuronProfile } from "../types";

/** AI clone of direct ARKON neuron N-024; validates its original class at construction. */
const definition: AINeuronProfile = {
  "id": "AI-N-024",
  "coreNeuronId": "N-024",
  "corePropertyName": "temperatura_servicio",
  "name": "Neurona IA N-024 · temperatura_servicio",
  "attribute": "temperatura_servicio",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: temperatura_servicio. ARKON la define como: Temperatura máxima de servicio sin degradación significativa. Unidad de referencia: °C. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente temperatura_servicio, propiedad del grupo thermal_limits, definida en el registro ARKON como “Temperatura máxima de servicio sin degradación significativa”. Conserva la unidad de referencia °C y ten el rango físico de referencia -50 a 2000 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (expansion_termica, temperatura_fusion, calor_especifico) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
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
    },
    {
      "propertyName": "temperatura_falla",
      "neuronId": "N-74-INV",
      "orientation": "inverse",
      "measures": "Temperatura de falla o degradación del material",
      "searchTerms": [
        "temperatura falla",
        "Temperatura de falla o degradación del material",
        "thermal",
        "resistividad termica",
        "contraccion termica"
      ],
      "units": [
        "°C"
      ]
    },
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
      "propertyName": "temperatura_fusion",
      "neuronId": "N-025",
      "orientation": "direct",
      "measures": "Temperatura de fusión del material",
      "searchTerms": [
        "temperatura fusion",
        "Temperatura de fusión del material",
        "thermal limits",
        "temperatura servicio",
        "expansion termica",
        "calor especifico"
      ],
      "units": [
        "°C"
      ]
    },
    {
      "propertyName": "calor_especifico",
      "neuronId": "N-022",
      "orientation": "direct",
      "measures": "Energía necesaria para elevar la temperatura de 1 kg en 1 K",
      "searchTerms": [
        "calor especifico",
        "Energía necesaria para elevar la temperatura de 1 kg en 1 K",
        "thermal",
        "conductividad termica",
        "difusividad termica",
        "densidad aparente"
      ],
      "units": [
        "J/(kg·K)"
      ]
    }
  ],
  "subCables": [
    {
      "id": "SUPABASE-temperatura_servicio",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con temperatura_servicio; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "temperatura_servicio",
        "expansion_termica",
        "temperatura_fusion",
        "calor_especifico"
      ]
    }
  ],
  "evidenceTerms": [
    "temperatura servicio",
    "Temperatura máxima de servicio sin degradación significativa",
    "thermal limits",
    "expansion termica",
    "temperatura fusion",
    "calor especifico",
    "temperatura falla",
    "Temperatura de falla o degradación del material",
    "thermal",
    "resistividad termica",
    "contraccion termica",
    "Coeficiente de expansión térmica lineal",
    "modulo young",
    "resistencia traccion",
    "Temperatura de fusión del material",
    "Energía necesaria para elevar la temperatura de 1 kg en 1 K"
  ],
  "sourceNeuron": {
    "group": "thermal_limits",
    "definition": "Temperatura máxima de servicio sin degradación significativa",
    "referenceUnit": "°C",
    "physicalRange": {
      "min": -50,
      "max": 2000
    },
    "relatedProperties": [
      "expansion_termica",
      "temperatura_fusion",
      "calor_especifico"
    ]
  }
};

export class AgentNeuronN024 extends AgenticNeuron {
  constructor() { super(definition); }
}

export const AI_NEURON_N024 = new AgentNeuronN024();
