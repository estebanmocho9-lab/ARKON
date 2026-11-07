import { AgenticNeuron } from "../agenticNeuron";
import type { AINeuronProfile } from "../types";

/** AI clone of direct ARKON neuron N-030; validates its original class at construction. */
const definition: AINeuronProfile = {
  "id": "AI-N-030",
  "coreNeuronId": "N-030",
  "corePropertyName": "difusion_gases",
  "name": "Neurona IA N-030 · difusion_gases",
  "attribute": "difusion_gases",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: difusion_gases. ARKON la define como: Coeficiente de difusión de gases (por ejemplo, vapor de agua). Unidad de referencia: m²/s. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente difusion_gases, propiedad del grupo diffusion, definida en el registro ARKON como “Coeficiente de difusión de gases (por ejemplo, vapor de agua)”. Conserva la unidad de referencia m²/s y ten el rango físico de referencia 1e-14 a 1e-8 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (porosidad_total, tortuosidad, difusion_agua) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
    {
      "propertyName": "difusion_gases",
      "neuronId": "N-030",
      "orientation": "direct",
      "measures": "Coeficiente de difusión de gases (por ejemplo, vapor de agua)",
      "searchTerms": [
        "difusion gases",
        "Coeficiente de difusión de gases (por ejemplo, vapor de agua)",
        "diffusion",
        "porosidad total",
        "tortuosidad",
        "difusion agua"
      ],
      "units": [
        "m²/s"
      ]
    },
    {
      "propertyName": "resistencia_gases",
      "neuronId": "N-80-INV",
      "orientation": "inverse",
      "measures": "Resistencia a gases — impedancia al paso de gases",
      "searchTerms": [
        "resistencia gases",
        "Resistencia a gases — impedancia al paso de gases",
        "transport",
        "compacidad",
        "rectitud flujo"
      ],
      "units": [
        "m²/s"
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
      "propertyName": "tortuosidad",
      "neuronId": "N-010",
      "orientation": "direct",
      "measures": "Relación entre la longitud efectiva del camino y la longitud recta",
      "searchTerms": [
        "tortuosidad",
        "Relación entre la longitud efectiva del camino y la longitud recta",
        "pore",
        "permeabilidad intrinseca",
        "difusion agua",
        "diametro poro"
      ],
      "units": [
        "adimensional"
      ]
    },
    {
      "propertyName": "difusion_agua",
      "neuronId": "N-029",
      "orientation": "direct",
      "measures": "Coeficiente de difusión de agua en el material",
      "searchTerms": [
        "difusion agua",
        "Coeficiente de difusión de agua en el material",
        "diffusion",
        "porosidad total",
        "tortuosidad",
        "absorcion agua"
      ],
      "units": [
        "m²/s"
      ]
    }
  ],
  "subCables": [
    {
      "id": "SUPABASE-difusion_gases",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con difusion_gases; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "difusion_gases",
        "porosidad_total",
        "tortuosidad",
        "difusion_agua"
      ]
    }
  ],
  "evidenceTerms": [
    "difusion gases",
    "Coeficiente de difusión de gases (por ejemplo, vapor de agua)",
    "diffusion",
    "porosidad total",
    "tortuosidad",
    "difusion agua",
    "resistencia gases",
    "Resistencia a gases — impedancia al paso de gases",
    "transport",
    "compacidad",
    "rectitud flujo",
    "Fracción de volumen de vacíos respecto al volumen total",
    "porosity",
    "densidad aparente",
    "absorcion agua",
    "resistencia compresion"
  ],
  "sourceNeuron": {
    "group": "diffusion",
    "definition": "Coeficiente de difusión de gases (por ejemplo, vapor de agua)",
    "referenceUnit": "m²/s",
    "physicalRange": {
      "min": 1e-14,
      "max": 1e-8
    },
    "relatedProperties": [
      "porosidad_total",
      "tortuosidad",
      "difusion_agua"
    ]
  }
};

export class AgentNeuronN030 extends AgenticNeuron {
  constructor() { super(definition); }
}

export const AI_NEURON_N030 = new AgentNeuronN030();
