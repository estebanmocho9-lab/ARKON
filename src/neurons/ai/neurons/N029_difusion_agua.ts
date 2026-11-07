import { AgenticNeuron } from "../agenticNeuron";
import type { AINeuronProfile } from "../types";

/** AI clone of direct ARKON neuron N-029; validates its original class at construction. */
const definition: AINeuronProfile = {
  "id": "AI-N-029",
  "coreNeuronId": "N-029",
  "corePropertyName": "difusion_agua",
  "name": "Neurona IA N-029 · difusion_agua",
  "attribute": "difusion_agua",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: difusion_agua. ARKON la define como: Coeficiente de difusión de agua en el material. Unidad de referencia: m²/s. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente difusion_agua, propiedad del grupo diffusion, definida en el registro ARKON como “Coeficiente de difusión de agua en el material”. Conserva la unidad de referencia m²/s y ten el rango físico de referencia 1e-14 a 1e-8 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (porosidad_total, tortuosidad, absorcion_agua) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
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
    },
    {
      "propertyName": "resistencia_difusion",
      "neuronId": "N-79-INV",
      "orientation": "inverse",
      "measures": "Resistencia a difusión de vapor (mu) — barrera de vapor",
      "searchTerms": [
        "resistencia difusion",
        "Resistencia a difusión de vapor (mu) — barrera de vapor",
        "transport",
        "impermeabilidad",
        "compacidad"
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
      "propertyName": "absorcion_agua",
      "neuronId": "N-004",
      "orientation": "direct",
      "measures": "Porcentaje de agua absorbida respecto al peso seco",
      "searchTerms": [
        "absorcion agua",
        "Porcentaje de agua absorbida respecto al peso seco",
        "absorption",
        "porosidad total",
        "permeabilidad intrinseca",
        "angulo contacto"
      ],
      "units": [
        "%"
      ]
    }
  ],
  "subCables": [
    {
      "id": "SUPABASE-difusion_agua",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con difusion_agua; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "difusion_agua",
        "porosidad_total",
        "tortuosidad",
        "absorcion_agua"
      ]
    }
  ],
  "evidenceTerms": [
    "difusion agua",
    "Coeficiente de difusión de agua en el material",
    "diffusion",
    "porosidad total",
    "tortuosidad",
    "absorcion agua",
    "resistencia difusion",
    "Resistencia a difusión de vapor (mu) — barrera de vapor",
    "transport",
    "impermeabilidad",
    "compacidad",
    "Fracción de volumen de vacíos respecto al volumen total",
    "porosity",
    "densidad aparente",
    "resistencia compresion",
    "Relación entre la longitud efectiva del camino y la longitud recta"
  ],
  "sourceNeuron": {
    "group": "diffusion",
    "definition": "Coeficiente de difusión de agua en el material",
    "referenceUnit": "m²/s",
    "physicalRange": {
      "min": 1e-14,
      "max": 1e-8
    },
    "relatedProperties": [
      "porosidad_total",
      "tortuosidad",
      "absorcion_agua"
    ]
  }
};

export class AgentNeuronN029 extends AgenticNeuron {
  constructor() { super(definition); }
}

export const AI_NEURON_N029 = new AgentNeuronN029();
