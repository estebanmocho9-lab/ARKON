/** Neurona directa ARKON N021: perfil IA completo integrado en el módulo físico canónico. */
import { AgenticNeuron } from "../ai/agenticNeuron";
import type { AINeuronProfile } from "../ai/types";

const definition: AINeuronProfile = {
  "id": "AI-N-021",
  "coreNeuronId": "N-021",
  "corePropertyName": "conductividad_termica",
  "name": "Neurona agente de aislamiento térmico y servicio",
  "attribute": "aislamiento térmico/frío-calor",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Evalúa conducción, almacenamiento y difusión del calor, además del rango térmico documentado del producto.",
  "methodGuidance": "Para resistencia térmica R se necesita conductividad y espesor de capa; registra humedad, temperatura, densidad y método. No infieras aislamiento solo por porosidad.",
  "cables": [
    {
      "propertyName": "conductividad_termica",
      "neuronId": "N-021",
      "orientation": "direct",
      "measures": "Conductividad térmica del material/producto.",
      "searchTerms": [
        "conductividad térmica",
        "thermal conductivity",
        "lambda",
        "λ"
      ],
      "units": [
        "W/(m K)",
        "W/(m·K)",
        "W/mK"
      ]
    },
    {
      "propertyName": "calor_especifico",
      "neuronId": "N-022",
      "orientation": "direct",
      "measures": "Capacidad calorífica específica, con temperatura de ensayo.",
      "searchTerms": [
        "calor específico",
        "specific heat capacity"
      ],
      "units": [
        "J/(kg K)",
        "J/(kg·K)",
        "kJ/(kg K)"
      ]
    },
    {
      "propertyName": "difusividad_termica",
      "neuronId": "N-026",
      "orientation": "direct",
      "measures": "Difusividad térmica, no intercambiable con conductividad.",
      "searchTerms": [
        "difusividad térmica",
        "thermal diffusivity"
      ],
      "units": [
        "m2/s",
        "m²/s"
      ]
    },
    {
      "propertyName": "temperatura_servicio",
      "neuronId": "N-024",
      "orientation": "direct",
      "measures": "Temperatura/rango de operación declarados para el producto.",
      "searchTerms": [
        "temperatura de servicio",
        "service temperature",
        "operating temperature"
      ],
      "units": [
        "°C",
        "K"
      ]
    },
    {
      "propertyName": "resistividad_termica",
      "neuronId": "N-71-INV",
      "orientation": "inverse",
      "measures": "Propiedad inversa según la definición de ARKON; distinguir de R de una capa.",
      "searchTerms": [
        "resistividad térmica",
        "thermal resistivity"
      ],
      "units": [
        "m K/W",
        "m·K/W"
      ]
    },
    {
      "propertyName": "retardo_termico",
      "neuronId": "N-76-INV",
      "orientation": "inverse",
      "measures": "Retardo térmico bajo geometría y condiciones de ensayo documentadas.",
      "searchTerms": [
        "retardo térmico",
        "thermal lag",
        "thermal delay"
      ],
      "units": [
        "h",
        "s"
      ]
    }
  ],
  "subCables": [
    {
      "id": "KTERM",
      "purpose": "Índice de aislamiento vinculado a conductividad según la regla/fórmula de Supabase.",
      "requiredProperties": [
        "conductividad_termica"
      ]
    },
    {
      "id": "DIFTERM",
      "purpose": "Cruce de difusividad térmica con el sentido y escala configurados.",
      "requiredProperties": [
        "difusividad_termica"
      ]
    },
    {
      "id": "R-CAPA",
      "purpose": "Resistencia térmica de una capa requiere espesor y conductividad.",
      "requiredProperties": [
        "conductividad_termica",
        "espesor"
      ]
    }
  ],
  "evidenceTerms": [
    "conductividad térmica",
    "aislamiento térmico",
    "calor específico",
    "difusividad térmica",
    "temperatura de servicio",
    "thermal conductivity",
    "thermal insulation"
  ],
  "sourceNeuron": {
    "group": "thermal",
    "definition": "Capacidad de transmitir calor por conducción",
    "referenceUnit": "W/(m·K)",
    "physicalRange": {
      "min": 0.01,
      "max": 500
    },
    "relatedProperties": [
      "porosidad_total",
      "calor_especifico",
      "difusividad_termica"
    ]
  }
};

export class N021_ConductividadTermica extends AgenticNeuron {
  constructor() { super(definition); }
}
