import { AgenticNeuron } from "../agenticNeuron";
import type { AINeuronProfile } from "../types";

/** AI clone of direct ARKON neuron N-016; validates its original class at construction. */
const definition: AINeuronProfile = {
  "id": "AI-N-016",
  "coreNeuronId": "N-016",
  "corePropertyName": "modulo_volumetrico",
  "name": "Neurona IA N-016 · modulo_volumetrico",
  "attribute": "modulo_volumetrico",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: modulo_volumetrico. ARKON la define como: Módulo de compresibilidad volumétrica. Unidad de referencia: GPa. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente modulo_volumetrico, propiedad del grupo elasticity, definida en el registro ARKON como “Módulo de compresibilidad volumétrica”. Conserva la unidad de referencia GPa y ten el rango físico de referencia 0.001 a 150 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (modulo_young, poisson, modulo_corte) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
    {
      "propertyName": "modulo_volumetrico",
      "neuronId": "N-016",
      "orientation": "direct",
      "measures": "Módulo de compresibilidad volumétrica",
      "searchTerms": [
        "modulo volumetrico",
        "Módulo de compresibilidad volumétrica",
        "elasticity",
        "modulo young",
        "poisson",
        "modulo corte"
      ],
      "units": [
        "GPa"
      ]
    },
    {
      "propertyName": "compresibilidad",
      "neuronId": "N-66-INV",
      "orientation": "inverse",
      "measures": "Compresibilidad (beta=1/K) — facilidad de compresión volumétrica",
      "searchTerms": [
        "compresibilidad",
        "Compresibilidad (beta=1/K) — facilidad de compresión volumétrica",
        "mechanical",
        "complacencia elastica",
        "compacidad"
      ],
      "units": [
        "1/GPa"
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
      "propertyName": "poisson",
      "neuronId": "N-020",
      "orientation": "direct",
      "measures": "Coeficiente de Poisson (relación de deformación lateral a axial)",
      "searchTerms": [
        "poisson",
        "Coeficiente de Poisson (relación de deformación lateral a axial)",
        "elasticity",
        "modulo young",
        "modulo corte",
        "modulo volumetrico"
      ],
      "units": [
        "adimensional"
      ]
    },
    {
      "propertyName": "modulo_corte",
      "neuronId": "N-015",
      "orientation": "direct",
      "measures": "Módulo de elasticidad transversal",
      "searchTerms": [
        "modulo corte",
        "Módulo de elasticidad transversal",
        "elasticity",
        "modulo young",
        "poisson",
        "modulo volumetrico"
      ],
      "units": [
        "GPa"
      ]
    }
  ],
  "subCables": [
    {
      "id": "SUPABASE-modulo_volumetrico",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con modulo_volumetrico; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "modulo_volumetrico",
        "modulo_young",
        "poisson",
        "modulo_corte"
      ]
    }
  ],
  "evidenceTerms": [
    "modulo volumetrico",
    "Módulo de compresibilidad volumétrica",
    "elasticity",
    "modulo young",
    "poisson",
    "modulo corte",
    "compresibilidad",
    "Compresibilidad (beta=1/K) — facilidad de compresión volumétrica",
    "mechanical",
    "complacencia elastica",
    "compacidad",
    "Módulo de elasticidad longitudinal (rigidez)",
    "resistencia compresion",
    "Coeficiente de Poisson (relación de deformación lateral a axial)",
    "Módulo de elasticidad transversal"
  ],
  "sourceNeuron": {
    "group": "elasticity",
    "definition": "Módulo de compresibilidad volumétrica",
    "referenceUnit": "GPa",
    "physicalRange": {
      "min": 0.001,
      "max": 150
    },
    "relatedProperties": [
      "modulo_young",
      "poisson",
      "modulo_corte"
    ]
  }
};

export class AgentNeuronN016 extends AgenticNeuron {
  constructor() { super(definition); }
}

export const AI_NEURON_N016 = new AgentNeuronN016();
