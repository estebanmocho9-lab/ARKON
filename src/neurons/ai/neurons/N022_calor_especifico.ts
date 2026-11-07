import { AgenticNeuron } from "../agenticNeuron";
import type { AINeuronProfile } from "../types";

/** AI clone of direct ARKON neuron N-022; validates its original class at construction. */
const definition: AINeuronProfile = {
  "id": "AI-N-022",
  "coreNeuronId": "N-022",
  "corePropertyName": "calor_especifico",
  "name": "Neurona IA N-022 · calor_especifico",
  "attribute": "calor_especifico",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: calor_especifico. ARKON la define como: Energía necesaria para elevar la temperatura de 1 kg en 1 K. Unidad de referencia: J/(kg·K). Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente calor_especifico, propiedad del grupo thermal, definida en el registro ARKON como “Energía necesaria para elevar la temperatura de 1 kg en 1 K”. Conserva la unidad de referencia J/(kg·K) y ten el rango físico de referencia 100 a 5000 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (conductividad_termica, difusividad_termica, densidad_aparente) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
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
    },
    {
      "propertyName": "sensibilidad_termica",
      "neuronId": "N-72-INV",
      "orientation": "inverse",
      "measures": "Sensibilidad térmica — responde rápido a cambios de temperatura",
      "searchTerms": [
        "sensibilidad termica",
        "Sensibilidad térmica — responde rápido a cambios de temperatura",
        "thermal",
        "resistividad termica",
        "retardo termico"
      ],
      "units": [
        "kJ/kg·K"
      ]
    },
    {
      "propertyName": "conductividad_termica",
      "neuronId": "N-021",
      "orientation": "direct",
      "measures": "Capacidad de transmitir calor por conducción",
      "searchTerms": [
        "conductividad termica",
        "Capacidad de transmitir calor por conducción",
        "thermal",
        "porosidad total",
        "calor especifico",
        "difusividad termica"
      ],
      "units": [
        "W/(m·K)"
      ]
    },
    {
      "propertyName": "difusividad_termica",
      "neuronId": "N-026",
      "orientation": "direct",
      "measures": "Velocidad de propagación de cambios de temperatura",
      "searchTerms": [
        "difusividad termica",
        "Velocidad de propagación de cambios de temperatura",
        "thermal",
        "conductividad termica",
        "calor especifico",
        "densidad aparente"
      ],
      "units": [
        "mm²/s"
      ]
    },
    {
      "propertyName": "densidad_aparente",
      "neuronId": "N-002",
      "orientation": "direct",
      "measures": "Masa por unidad de volumen total (incluyendo poros)",
      "searchTerms": [
        "densidad aparente",
        "Masa por unidad de volumen total (incluyendo poros)",
        "density",
        "densidad real",
        "porosidad total",
        "absorcion agua"
      ],
      "units": [
        "g/cm³"
      ]
    }
  ],
  "subCables": [
    {
      "id": "SUPABASE-calor_especifico",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con calor_especifico; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "calor_especifico",
        "conductividad_termica",
        "difusividad_termica",
        "densidad_aparente"
      ]
    }
  ],
  "evidenceTerms": [
    "calor especifico",
    "Energía necesaria para elevar la temperatura de 1 kg en 1 K",
    "thermal",
    "conductividad termica",
    "difusividad termica",
    "densidad aparente",
    "sensibilidad termica",
    "Sensibilidad térmica — responde rápido a cambios de temperatura",
    "resistividad termica",
    "retardo termico",
    "Capacidad de transmitir calor por conducción",
    "porosidad total",
    "Velocidad de propagación de cambios de temperatura",
    "Masa por unidad de volumen total (incluyendo poros)",
    "density",
    "densidad real"
  ],
  "sourceNeuron": {
    "group": "thermal",
    "definition": "Energía necesaria para elevar la temperatura de 1 kg en 1 K",
    "referenceUnit": "J/(kg·K)",
    "physicalRange": {
      "min": 100,
      "max": 5000
    },
    "relatedProperties": [
      "conductividad_termica",
      "difusividad_termica",
      "densidad_aparente"
    ]
  }
};

export class AgentNeuronN022 extends AgenticNeuron {
  constructor() { super(definition); }
}

export const AI_NEURON_N022 = new AgentNeuronN022();
