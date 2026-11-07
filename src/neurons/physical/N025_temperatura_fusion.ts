/** Neurona directa ARKON N025: perfil IA completo integrado en el módulo físico canónico. */
import { AgenticNeuron } from "../ai/agenticNeuron";
import type { AINeuronProfile } from "../ai/types";

const definition: AINeuronProfile = {
  "id": "AI-N-025",
  "coreNeuronId": "N-025",
  "corePropertyName": "temperatura_fusion",
  "name": "Neurona IA N-025 · temperatura_fusion",
  "attribute": "temperatura_fusion",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: temperatura_fusion. ARKON la define como: Temperatura de fusión del material. Unidad de referencia: °C. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente temperatura_fusion, propiedad del grupo thermal_limits, definida en el registro ARKON como “Temperatura de fusión del material”. Conserva la unidad de referencia °C y ten el rango físico de referencia 100 a 3000 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (temperatura_servicio, expansion_termica, calor_especifico) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
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
      "propertyName": "solidificacion",
      "neuronId": "N-75-INV",
      "orientation": "inverse",
      "measures": "Temperatura de solidificación — punto de transición líquido/sólido",
      "searchTerms": [
        "solidificacion",
        "Temperatura de solidificación — punto de transición líquido/sólido",
        "thermal",
        "temperatura falla",
        "resistividad termica"
      ],
      "units": [
        "°C"
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
      "id": "SUPABASE-temperatura_fusion",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con temperatura_fusion; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "temperatura_fusion",
        "temperatura_servicio",
        "expansion_termica",
        "calor_especifico"
      ]
    }
  ],
  "evidenceTerms": [
    "temperatura fusion",
    "Temperatura de fusión del material",
    "thermal limits",
    "temperatura servicio",
    "expansion termica",
    "calor especifico",
    "solidificacion",
    "Temperatura de solidificación — punto de transición líquido/sólido",
    "thermal",
    "temperatura falla",
    "resistividad termica",
    "Temperatura máxima de servicio sin degradación significativa",
    "Coeficiente de expansión térmica lineal",
    "modulo young",
    "resistencia traccion",
    "Energía necesaria para elevar la temperatura de 1 kg en 1 K"
  ],
  "sourceNeuron": {
    "group": "thermal_limits",
    "definition": "Temperatura de fusión del material",
    "referenceUnit": "°C",
    "physicalRange": {
      "min": 100,
      "max": 3000
    },
    "relatedProperties": [
      "temperatura_servicio",
      "expansion_termica",
      "calor_especifico"
    ],
    "confidenceDefault": 0.98
  }
};

export class N025_TemperaturaFusion extends AgenticNeuron {
  constructor() { super(definition); }
}
