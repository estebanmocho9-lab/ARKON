import { AgenticNeuron } from "../agenticNeuron";
import type { AINeuronProfile } from "../types";
import { N045_AnguloContacto } from "../../physical/N045_angulo_contacto";

/** AI clone of direct ARKON neuron N-045; validates its original class at construction. */
const definition: AINeuronProfile = {
  "id": "AI-N-045",
  "coreNeuronId": "N-045",
  "corePropertyName": "angulo_contacto",
  "name": "Neurona IA N-045 · angulo_contacto",
  "attribute": "angulo_contacto",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: angulo_contacto. ARKON la define como: Ángulo de contacto con agua. Unidad de referencia: °. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente angulo_contacto, propiedad del grupo surface, definida en el registro ARKON como “Ángulo de contacto con agua”. Conserva la unidad de referencia ° y ten el rango físico de referencia 0 a 180 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (energia_superficial, absorcion_agua, trabajo_adhesion) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
    {
      "propertyName": "angulo_contacto",
      "neuronId": "N-045",
      "orientation": "direct",
      "measures": "Ángulo de contacto con agua",
      "searchTerms": [
        "angulo contacto",
        "Ángulo de contacto con agua",
        "surface",
        "energia superficial",
        "absorcion agua",
        "trabajo adhesion"
      ],
      "units": [
        "°"
      ]
    },
    {
      "propertyName": "coseno_angulo",
      "neuronId": "N-95-INV",
      "orientation": "inverse",
      "measures": "Coseno del ángulo de contacto — grado de hidrofilicidad",
      "searchTerms": [
        "coseno angulo",
        "Coseno del ángulo de contacto — grado de hidrofilicidad",
        "surface",
        "estabilidad cohesiva",
        "impermeabilidad"
      ],
      "units": [
        "adim"
      ]
    },
    {
      "propertyName": "energia_superficial",
      "neuronId": "N-044",
      "orientation": "direct",
      "measures": "Energía libre superficial",
      "searchTerms": [
        "energia superficial",
        "Energía libre superficial",
        "surface",
        "angulo contacto",
        "trabajo adhesion",
        "adsorcion"
      ],
      "units": [
        "mJ/m²"
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
    },
    {
      "propertyName": "trabajo_adhesion",
      "neuronId": "N-046",
      "orientation": "direct",
      "measures": "Trabajo de adhesión sólido-líquido",
      "searchTerms": [
        "trabajo adhesion",
        "Trabajo de adhesión sólido-líquido",
        "surface",
        "energia superficial",
        "angulo contacto",
        "cohesion"
      ],
      "units": [
        "mJ/m²"
      ]
    }
  ],
  "subCables": [
    {
      "id": "SUPABASE-angulo_contacto",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con angulo_contacto; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "angulo_contacto",
        "energia_superficial",
        "absorcion_agua",
        "trabajo_adhesion"
      ]
    }
  ],
  "evidenceTerms": [
    "angulo contacto",
    "Ángulo de contacto con agua",
    "surface",
    "energia superficial",
    "absorcion agua",
    "trabajo adhesion",
    "coseno angulo",
    "Coseno del ángulo de contacto — grado de hidrofilicidad",
    "estabilidad cohesiva",
    "impermeabilidad",
    "Energía libre superficial",
    "adsorcion",
    "Porcentaje de agua absorbida respecto al peso seco",
    "absorption",
    "porosidad total",
    "permeabilidad intrinseca"
  ],
  "sourceNeuron": {
    "group": "surface",
    "definition": "Ángulo de contacto con agua",
    "referenceUnit": "°",
    "physicalRange": {
      "min": 0,
      "max": 180
    },
    "relatedProperties": [
      "energia_superficial",
      "absorcion_agua",
      "trabajo_adhesion"
    ]
  }
};
const sourceNeuron = new N045_AnguloContacto();

export class AgentNeuronN045 extends AgenticNeuron {
  constructor() { super(definition, sourceNeuron); }
}

export const AI_NEURON_N045 = new AgentNeuronN045();
