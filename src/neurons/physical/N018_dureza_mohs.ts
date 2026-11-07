/** Neurona directa ARKON N018: perfil IA completo integrado en el módulo físico canónico. */
import { AgenticNeuron } from "../ai/agenticNeuron";
import type { AINeuronProfile } from "../ai/types";

const definition: AINeuronProfile = {
  "id": "AI-N-018",
  "coreNeuronId": "N-018",
  "corePropertyName": "dureza_mohs",
  "name": "Neurona agente de dureza superficial",
  "attribute": "dureza",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Evalúa evidencia de dureza superficial del panel, identificando exactamente la escala y el método de ensayo.",
  "methodGuidance": "No conviertas ni compares Mohs, Brinell, Vickers, Shore u otros métodos sin una conversión validada y compatible. No confundas dureza superficial con resistencia estructural.",
  "cables": [
    {
      "propertyName": "dureza_mohs",
      "neuronId": "N-018",
      "orientation": "direct",
      "measures": "Dureza declarada y escala/método de medición.",
      "searchTerms": [
        "dureza",
        "hardness",
        "mohs",
        "brinell",
        "vickers",
        "shore",
        "scratch resistance"
      ],
      "units": [
        "Mohs",
        "HV",
        "HB",
        "Shore",
        "adimensional"
      ]
    },
    {
      "propertyName": "blandura",
      "neuronId": "N-68-INV",
      "orientation": "inverse",
      "measures": "Indicador inverso; conservar método y no inferirlo como dato experimental.",
      "searchTerms": [
        "blandura",
        "softness"
      ],
      "units": [
        "adimensional",
        "escala"
      ]
    }
  ],
  "subCables": [
    {
      "id": "DUREZA-METODO",
      "purpose": "Validar comparabilidad entre ensayos de dureza.",
      "requiredProperties": [
        "dureza_mohs"
      ]
    }
  ],
  "evidenceTerms": [
    "dureza",
    "hardness",
    "mohs",
    "brinell",
    "vickers",
    "shore",
    "indentación",
    "rayado"
  ],
  "sourceNeuron": {
    "group": "mechanical",
    "definition": "Dureza según escala de Mohs (1 a 10)",
    "referenceUnit": "adimensional",
    "physicalRange": {
      "min": 1,
      "max": 10
    },
    "relatedProperties": [
      "resistencia_compresion",
      "angulo_friccion",
      "energia_superficial"
    ]
  }
};

export class N018_DurezaMohs extends AgenticNeuron {
  constructor() { super(definition); }
}
