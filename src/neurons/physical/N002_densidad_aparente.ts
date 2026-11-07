/** Neurona directa ARKON N002: perfil IA completo integrado en el módulo físico canónico. */
import { AgenticNeuron } from "../ai/agenticNeuron";
import type { AINeuronProfile } from "../ai/types";

const definition: AINeuronProfile = {
  "id": "AI-N-002",
  "coreNeuronId": "N-002",
  "corePropertyName": "densidad_aparente",
  "name": "Neurona agente de peso y densidad",
  "attribute": "peso/densidad",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Evalúa densidad aparente/real y masa superficial solo cuando las mediciones y dimensiones necesarias están documentadas.",
  "methodGuidance": "El peso de una placa no se deduce solo de la densidad: requiere volumen o dimensiones/espesor. Distingue densidad aparente de densidad real y registra humedad del espécimen.",
  "cables": [
    {
      "propertyName": "densidad_aparente",
      "neuronId": "N-002",
      "orientation": "direct",
      "measures": "Masa/volumen aparente, con poros y método indicados.",
      "searchTerms": [
        "densidad aparente",
        "bulk density",
        "apparent density",
        "densidad del panel"
      ],
      "units": [
        "kg/m3",
        "kg/m³",
        "g/cm3",
        "g/cm³"
      ]
    },
    {
      "propertyName": "densidad_real",
      "neuronId": "N-001",
      "orientation": "direct",
      "measures": "Densidad de la fase sólida, distinta de la densidad aparente.",
      "searchTerms": [
        "densidad real",
        "true density",
        "particle density"
      ],
      "units": [
        "kg/m3",
        "kg/m³",
        "g/cm3",
        "g/cm³"
      ]
    },
    {
      "propertyName": "volumen_especifico_aparente",
      "neuronId": "N-52-INV",
      "orientation": "inverse",
      "measures": "Volumen específico aparente solo si su definición/escala coincide con la de ARKON.",
      "searchTerms": [
        "volumen específico aparente",
        "specific apparent volume"
      ],
      "units": [
        "m3/kg",
        "m³/kg"
      ]
    }
  ],
  "subCables": [
    {
      "id": "DEN",
      "purpose": "Indicador de densidad/peso del material, sujeto a la fórmula activa de Supabase.",
      "requiredProperties": [
        "densidad_aparente"
      ]
    },
    {
      "id": "PESO-AREA",
      "purpose": "Masa superficial requiere densidad y espesor medido del producto.",
      "requiredProperties": [
        "densidad_aparente",
        "espesor"
      ]
    }
  ],
  "evidenceTerms": [
    "densidad aparente",
    "densidad real",
    "masa por área",
    "peso por metro cuadrado",
    "bulk density",
    "apparent density",
    "areal mass"
  ],
  "sourceNeuron": {
    "group": "density",
    "definition": "Masa por unidad de volumen total (incluyendo poros)",
    "referenceUnit": "g/cm³",
    "physicalRange": {
      "min": 0.1,
      "max": 3
    },
    "relatedProperties": [
      "densidad_real",
      "porosidad_total",
      "absorcion_agua"
    ],
    "confidenceDefault": 0.95
  }
};

/** Conserva el identificador histórico; núcleo, cables y subcables viven en este módulo. */
export class N002_DensidadAparente extends AgenticNeuron {
  constructor() { super(definition); }
}
