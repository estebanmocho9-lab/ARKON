import { AgenticNeuron } from "../agenticNeuron";
import type { AINeuronProfile } from "../types";
import { N020_Poisson } from "../../physical/N020_poisson";

/** AI clone of direct ARKON neuron N-020; validates its original class at construction. */
const definition: AINeuronProfile = {
  "id": "AI-N-020",
  "coreNeuronId": "N-020",
  "corePropertyName": "poisson",
  "name": "Neurona IA N-020 · poisson",
  "attribute": "poisson",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: poisson. ARKON la define como: Coeficiente de Poisson (relación de deformación lateral a axial). Unidad de referencia: adimensional. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente poisson, propiedad del grupo elasticity, definida en el registro ARKON como “Coeficiente de Poisson (relación de deformación lateral a axial)”. Conserva la unidad de referencia adimensional y ten el rango físico de referencia 0 a 0.5 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (modulo_young, modulo_corte, modulo_volumetrico) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
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
      "propertyName": "relacion_esbeltez",
      "neuronId": "N-70-INV",
      "orientation": "inverse",
      "measures": "Relación de esbeltez lateral (1/nu) — expansión transversal",
      "searchTerms": [
        "relacion esbeltez",
        "Relación de esbeltez lateral (1/nu) — expansión transversal",
        "mechanical",
        "complacencia elastica",
        "complacencia cizalladura"
      ],
      "units": [
        "-"
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
    },
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
    }
  ],
  "subCables": [
    {
      "id": "SUPABASE-poisson",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con poisson; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "poisson",
        "modulo_young",
        "modulo_corte",
        "modulo_volumetrico"
      ]
    }
  ],
  "evidenceTerms": [
    "poisson",
    "Coeficiente de Poisson (relación de deformación lateral a axial)",
    "elasticity",
    "modulo young",
    "modulo corte",
    "modulo volumetrico",
    "relacion esbeltez",
    "Relación de esbeltez lateral (1/nu) — expansión transversal",
    "mechanical",
    "complacencia elastica",
    "complacencia cizalladura",
    "Módulo de elasticidad longitudinal (rigidez)",
    "resistencia compresion",
    "Módulo de elasticidad transversal",
    "Módulo de compresibilidad volumétrica"
  ],
  "sourceNeuron": {
    "group": "elasticity",
    "definition": "Coeficiente de Poisson (relación de deformación lateral a axial)",
    "referenceUnit": "adimensional",
    "physicalRange": {
      "min": 0,
      "max": 0.5
    },
    "relatedProperties": [
      "modulo_young",
      "modulo_corte",
      "modulo_volumetrico"
    ]
  }
};
const sourceNeuron = new N020_Poisson();

export class AgentNeuronN020 extends AgenticNeuron {
  constructor() { super(definition, sourceNeuron); }
}

export const AI_NEURON_N020 = new AgentNeuronN020();
