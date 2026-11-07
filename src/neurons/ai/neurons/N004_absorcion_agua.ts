import { AgenticNeuron } from "../agenticNeuron";
import type { AINeuronProfile } from "../types";
import { N004_AbsorcionAgua } from "../../physical/N004_absorcion_agua";

/** AI clone of direct ARKON neuron N-004; validates its original class at construction. */
const definition: AINeuronProfile = {
  "id": "AI-N-004",
  "coreNeuronId": "N-004",
  "corePropertyName": "absorcion_agua",
  "name": "Neurona agente de resistencia a la humedad",
  "attribute": "resistencia a la humedad",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Evalúa qué evidencia existe sobre absorción de agua y desempeño frente a humedad para el producto y estado solicitados. No deduce que “antihumedad” signifique impermeable.",
  "methodGuidance": "Prioriza ensayos del producto/panel terminado, distinguiendo absorción, permeabilidad al vapor y exposición líquida. Compara resultados solo si método, acondicionamiento, espesor y estado son compatibles.",
  "cables": [
    {
      "propertyName": "absorcion_agua",
      "neuronId": "N-004",
      "orientation": "direct",
      "measures": "Agua absorbida respecto de la masa seca; buscar valor, método y acondicionamiento.",
      "searchTerms": [
        "absorción de agua",
        "water absorption",
        "water uptake",
        "absorcion agua"
      ],
      "units": [
        "%",
        "kg/kg",
        "g/g"
      ]
    },
    {
      "propertyName": "porosidad_total",
      "neuronId": "N-003",
      "orientation": "direct",
      "measures": "Fracción/porcentaje de poros y método de determinación.",
      "searchTerms": [
        "porosidad total",
        "total porosity",
        "porosidad"
      ],
      "units": [
        "%",
        "fracción",
        "m3/m3"
      ]
    },
    {
      "propertyName": "permeabilidad_intrinseca",
      "neuronId": "N-027",
      "orientation": "direct",
      "measures": "Transporte de fluido por la matriz, sin confundirlo con absorción.",
      "searchTerms": [
        "permeabilidad intrínseca",
        "permeabilidad al agua",
        "intrinsic permeability"
      ],
      "units": [
        "m2",
        "m²"
      ]
    },
    {
      "propertyName": "difusion_agua",
      "neuronId": "N-029",
      "orientation": "direct",
      "measures": "Difusión de agua o vapor bajo las condiciones del ensayo.",
      "searchTerms": [
        "difusión de agua",
        "difusividad al vapor",
        "water vapor diffusion"
      ],
      "units": [
        "m2/s",
        "m²/s",
        "kg/(m s)"
      ]
    },
    {
      "propertyName": "angulo_contacto",
      "neuronId": "N-045",
      "orientation": "direct",
      "measures": "Mojabilidad superficial; no equivale por sí sola a impermeabilidad.",
      "searchTerms": [
        "ángulo de contacto",
        "contact angle"
      ],
      "units": [
        "°",
        "grados"
      ]
    },
    {
      "propertyName": "impermeabilidad",
      "neuronId": "N-54-INV",
      "orientation": "inverse",
      "measures": "Indicador inverso registrado por ARKON; debe derivarse con método definido.",
      "searchTerms": [
        "impermeabilidad",
        "waterproof",
        "water resistance"
      ],
      "units": [
        "adimensional",
        "%"
      ]
    }
  ],
  "subCables": [
    {
      "id": "IAH",
      "purpose": "Cruce de absorción y porosidad para humedad; usar solo fórmula activa recuperada de Supabase.",
      "requiredProperties": [
        "absorcion_agua",
        "porosidad_total"
      ]
    },
    {
      "id": "IPH",
      "purpose": "Cruce hidráulico; verificar propiedades y unidades antes de evaluar.",
      "requiredProperties": [
        "permeabilidad_intrinseca",
        "conductividad_hidraulica"
      ]
    },
    {
      "id": "CAP",
      "purpose": "Relación de capacidad/absorción superficial; no extrapolar fuera de la definición de Supabase.",
      "requiredProperties": [
        "absorcion_agua",
        "angulo_contacto"
      ]
    }
  ],
  "evidenceTerms": [
    "humedad",
    "absorción de agua",
    "absorcion de agua",
    "absorción",
    "permeabilidad",
    "difusión de agua",
    "difusion de agua",
    "vapor de agua",
    "ángulo de contacto",
    "angulo de contacto",
    "impermeabilidad"
  ],
  "sourceNeuron": {
    "group": "absorption",
    "definition": "Porcentaje de agua absorbida respecto al peso seco",
    "referenceUnit": "%",
    "physicalRange": {
      "min": 0,
      "max": 100
    },
    "relatedProperties": [
      "porosidad_total",
      "permeabilidad_intrinseca",
      "angulo_contacto"
    ]
  }
};
const sourceNeuron = new N004_AbsorcionAgua();

export class AgentNeuronN004 extends AgenticNeuron {
  constructor() { super(definition, sourceNeuron); }
}

export const AI_NEURON_N004 = new AgentNeuronN004();
