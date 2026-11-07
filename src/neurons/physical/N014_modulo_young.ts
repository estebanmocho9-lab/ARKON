/** Neurona directa ARKON N014: perfil IA completo integrado en el módulo físico canónico. */
import { AgenticNeuron } from "../ai/agenticNeuron";
import type { AINeuronProfile } from "../ai/types";

const definition: AINeuronProfile = {
  "id": "AI-N-014",
  "coreNeuronId": "N-014",
  "corePropertyName": "modulo_young",
  "name": "Neurona agente de flexibilidad y deflexión",
  "attribute": "flexibilidad",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Evalúa deformación/deflexión del panel y su rigidez elástica sin confundir capacidad de flexión con resistencia a la rotura.",
  "methodGuidance": "Una afirmación de flexibilidad requiere ensayo de carga-deflexión o datos de módulo y geometría. Para paneles, la luz, espesor, orientación, apoyos y humedad son esenciales.",
  "cables": [
    {
      "propertyName": "deflectabilidad",
      "neuronId": "N-63-INV",
      "orientation": "inverse",
      "measures": "Deflexión/deformabilidad según magnitud y método configurados por ARKON.",
      "searchTerms": [
        "deflectabilidad",
        "deflexión",
        "deflection",
        "deformation"
      ],
      "units": [
        "mm",
        "%",
        "mm/mm"
      ]
    },
    {
      "propertyName": "complacencia_elastica",
      "neuronId": "N-64-INV",
      "orientation": "inverse",
      "measures": "Complacencia elástica; verificar definición y unidades.",
      "searchTerms": [
        "complacencia elástica",
        "elastic compliance",
        "compliance"
      ],
      "units": [
        "1/Pa",
        "Pa-1",
        "GPa-1"
      ]
    },
    {
      "propertyName": "modulo_young",
      "neuronId": "N-014",
      "orientation": "direct",
      "measures": "Módulo de elasticidad como indicador de rigidez.",
      "searchTerms": [
        "módulo de young",
        "elastic modulus",
        "modulus of elasticity",
        "MOE"
      ],
      "units": [
        "MPa",
        "GPa",
        "N/mm2"
      ]
    },
    {
      "propertyName": "resistencia_flexion",
      "neuronId": "N-013",
      "orientation": "direct",
      "measures": "Resistencia a flexión, separada de la deflexión elástica.",
      "searchTerms": [
        "resistencia a flexión",
        "flexural strength",
        "bending strength"
      ],
      "units": [
        "MPa",
        "N/mm2"
      ]
    }
  ],
  "subCables": [
    {
      "id": "FLEX-ELASTICA",
      "purpose": "Conectar rigidez y deformación solo con fórmula activa y propiedades dimensionales suficientes.",
      "requiredProperties": [
        "modulo_young",
        "deflectabilidad"
      ]
    },
    {
      "id": "GEOMETRIA-PANEL",
      "purpose": "Deflexión del panel requiere dimensiones, orientación, luz y esquema de carga.",
      "requiredProperties": [
        "espesor",
        "luz_ensayo",
        "carga"
      ]
    }
  ],
  "evidenceTerms": [
    "deflexión",
    "deflectabilidad",
    "flexibilidad",
    "complacencia elástica",
    "módulo de elasticidad",
    "flexural stiffness",
    "deflection"
  ],
  "sourceNeuron": {
    "group": "elasticity",
    "definition": "Módulo de elasticidad longitudinal (rigidez)",
    "referenceUnit": "GPa",
    "physicalRange": {
      "min": 0.001,
      "max": 200
    },
    "relatedProperties": [
      "resistencia_compresion",
      "poisson",
      "modulo_corte"
    ]
  }
};

export class N014_ModuloYoung extends AgenticNeuron {
  constructor() { super(definition); }
}
