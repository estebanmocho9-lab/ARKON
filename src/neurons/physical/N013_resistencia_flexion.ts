/** Neurona directa ARKON N013: perfil IA completo integrado en el módulo físico canónico. */
import { AgenticNeuron } from "../ai/agenticNeuron";
import type { AINeuronProfile } from "../ai/types";

const definition: AINeuronProfile = {
  "id": "AI-N-013",
  "coreNeuronId": "N-013",
  "corePropertyName": "resistencia_flexion",
  "name": "Neurona agente de resistencia mecánica",
  "attribute": "resistencia del panel",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Evalúa resistencia a flexión del panel y la evidencia mecánica complementaria en compresión, tracción y módulo elástico.",
  "methodGuidance": "Prioriza ensayos del producto final con orientación, dimensiones, luz, carga, acondicionamiento y norma. No compara valores de probetas o métodos distintos como equivalentes.",
  "cables": [
    {
      "propertyName": "resistencia_flexion",
      "neuronId": "N-013",
      "orientation": "direct",
      "measures": "Resistencia a flexión/falla en ensayo identificado.",
      "searchTerms": [
        "resistencia a flexión",
        "flexural strength",
        "bending strength",
        "modulus of rupture"
      ],
      "units": [
        "MPa",
        "N/mm2",
        "N/mm²"
      ]
    },
    {
      "propertyName": "resistencia_compresion",
      "neuronId": "N-011",
      "orientation": "direct",
      "measures": "Resistencia a compresión y geometría/método del espécimen.",
      "searchTerms": [
        "resistencia a compresión",
        "compressive strength"
      ],
      "units": [
        "MPa",
        "N/mm2",
        "N/mm²"
      ]
    },
    {
      "propertyName": "resistencia_traccion",
      "neuronId": "N-012",
      "orientation": "direct",
      "measures": "Resistencia a tracción, incluyendo orientación del panel.",
      "searchTerms": [
        "resistencia a tracción",
        "tensile strength",
        "internal bond"
      ],
      "units": [
        "MPa",
        "N/mm2",
        "N/mm²"
      ]
    },
    {
      "propertyName": "modulo_young",
      "neuronId": "N-014",
      "orientation": "direct",
      "measures": "Rigidez elástica, que no es igual a resistencia última.",
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
      "propertyName": "resistencia_compresion",
      "neuronId": "N-62-INV",
      "orientation": "inverse",
      "measures": "Indicador inverso computado por ARKON, no una observación independiente.",
      "searchTerms": [
        "resistencia a compresión",
        "compressive strength"
      ],
      "units": [
        "MPa",
        "N/mm2"
      ]
    }
  ],
  "subCables": [
    {
      "id": "IFM",
      "purpose": "Índice de fragilidad: evaluar solo con las variables requeridas presentes y la ecuación activa de Supabase.",
      "requiredProperties": [
        "resistencia_traccion",
        "resistencia_compresion"
      ]
    },
    {
      "id": "IEM",
      "purpose": "Relación módulo/densidad; conservar unidades y normalización indicadas por Supabase.",
      "requiredProperties": [
        "modulo_young",
        "densidad_aparente"
      ]
    },
    {
      "id": "FLEX-COMP",
      "purpose": "Relacionar flexión y deformación únicamente si existe método compatible.",
      "requiredProperties": [
        "resistencia_flexion",
        "modulo_young"
      ]
    }
  ],
  "evidenceTerms": [
    "resistencia a flexión",
    "resistencia a compresión",
    "resistencia a tracción",
    "módulo de young",
    "flexural strength",
    "bending strength"
  ],
  "sourceNeuron": {
    "group": "mechanical",
    "definition": "Tensión máxima de flexión antes de la fractura",
    "referenceUnit": "MPa",
    "physicalRange": {
      "min": 0,
      "max": 50
    },
    "relatedProperties": [
      "resistencia_compresion",
      "resistencia_traccion",
      "modulo_young"
    ]
  }
};

export class N013_ResistenciaFlexion extends AgenticNeuron {
  constructor() { super(definition); }
}
