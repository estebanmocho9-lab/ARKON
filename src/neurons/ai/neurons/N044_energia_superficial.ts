import { AgenticNeuron } from "../agenticNeuron";
import type { AINeuronProfile } from "../types";

/** AI clone of direct ARKON neuron N-044; validates its original class at construction. */
const definition: AINeuronProfile = {
  "id": "AI-N-044",
  "coreNeuronId": "N-044",
  "corePropertyName": "energia_superficial",
  "name": "Neurona IA N-044 · energia_superficial",
  "attribute": "energia_superficial",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: energia_superficial. ARKON la define como: Energía libre superficial. Unidad de referencia: mJ/m². Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente energia_superficial, propiedad del grupo surface, definida en el registro ARKON como “Energía libre superficial”. Conserva la unidad de referencia mJ/m² y ten el rango físico de referencia 10 a 500 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (angulo_contacto, trabajo_adhesion, adsorcion) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
    {
      "propertyName": "energia_superficial",
      "neuronId": "N-044",
      "orientation": "direct",
      "measures": "Energía libre superficial",
      "searchTerms": [
        "energia superficial",
        "Energía libre superficial",
        "surface",
        "angulo contacto",
        "trabajo adhesion",
        "adsorcion"
      ],
      "units": [
        "mJ/m²"
      ]
    },
    {
      "propertyName": "estabilidad_cohesiva",
      "neuronId": "N-94-INV",
      "orientation": "inverse",
      "measures": "Estabilidad cohesiva interna — energía de unión superficial",
      "searchTerms": [
        "estabilidad cohesiva",
        "Estabilidad cohesiva interna — energía de unión superficial",
        "surface",
        "coseno angulo",
        "trabajo cohesion"
      ],
      "units": [
        "mN/m"
      ]
    },
    {
      "propertyName": "angulo_contacto",
      "neuronId": "N-045",
      "orientation": "direct",
      "measures": "Ángulo de contacto con agua",
      "searchTerms": [
        "angulo contacto",
        "Ángulo de contacto con agua",
        "surface",
        "energia superficial",
        "absorcion agua",
        "trabajo adhesion"
      ],
      "units": [
        "°"
      ]
    },
    {
      "propertyName": "trabajo_adhesion",
      "neuronId": "N-046",
      "orientation": "direct",
      "measures": "Trabajo de adhesión sólido-líquido",
      "searchTerms": [
        "trabajo adhesion",
        "Trabajo de adhesión sólido-líquido",
        "surface",
        "energia superficial",
        "angulo contacto",
        "cohesion"
      ],
      "units": [
        "mJ/m²"
      ]
    },
    {
      "propertyName": "adsorcion",
      "neuronId": "N-034",
      "orientation": "direct",
      "measures": "Capacidad de adsorción de sustancias (ej. colorantes, metales)",
      "searchTerms": [
        "adsorcion",
        "Capacidad de adsorción de sustancias (ej. colorantes, metales)",
        "chemical",
        "area BET",
        "cec",
        "potencial zeta"
      ],
      "units": [
        "mg/g"
      ]
    }
  ],
  "subCables": [
    {
      "id": "SUPABASE-energia_superficial",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con energia_superficial; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "energia_superficial",
        "angulo_contacto",
        "trabajo_adhesion",
        "adsorcion"
      ]
    }
  ],
  "evidenceTerms": [
    "energia superficial",
    "Energía libre superficial",
    "surface",
    "angulo contacto",
    "trabajo adhesion",
    "adsorcion",
    "estabilidad cohesiva",
    "Estabilidad cohesiva interna — energía de unión superficial",
    "coseno angulo",
    "trabajo cohesion",
    "Ángulo de contacto con agua",
    "absorcion agua",
    "Trabajo de adhesión sólido-líquido",
    "cohesion",
    "Capacidad de adsorción de sustancias (ej. colorantes, metales)",
    "chemical"
  ],
  "sourceNeuron": {
    "group": "surface",
    "definition": "Energía libre superficial",
    "referenceUnit": "mJ/m²",
    "physicalRange": {
      "min": 10,
      "max": 500
    },
    "relatedProperties": [
      "angulo_contacto",
      "trabajo_adhesion",
      "adsorcion"
    ]
  }
};

export class AgentNeuronN044 extends AgenticNeuron {
  constructor() { super(definition); }
}

export const AI_NEURON_N044 = new AgentNeuronN044();
