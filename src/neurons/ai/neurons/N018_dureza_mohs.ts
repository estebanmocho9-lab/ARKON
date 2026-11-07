import { AgenticNeuron } from "../agenticNeuron";
import type { AINeuronProfile } from "../types";
import { N018_DurezaMohs } from "../../physical/N018_dureza_mohs";

/** AI clone of direct ARKON neuron N-018; validates its original class at construction. */
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
const sourceNeuron = new N018_DurezaMohs();

export class AgentNeuronN018 extends AgenticNeuron {
  constructor() { super(definition, sourceNeuron); }
}

export const AI_NEURON_N018 = new AgentNeuronN018();
