import { AgenticNeuron } from "../agenticNeuron";
import type { AINeuronProfile } from "../types";
import { N015_ModuloCorte } from "../../physical/N015_modulo_corte";

/** AI clone of direct ARKON neuron N-015; validates its original class at construction. */
const definition: AINeuronProfile = {
  "id": "AI-N-015",
  "coreNeuronId": "N-015",
  "corePropertyName": "modulo_corte",
  "name": "Neurona IA N-015 · modulo_corte",
  "attribute": "modulo_corte",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: modulo_corte. ARKON la define como: Módulo de elasticidad transversal. Unidad de referencia: GPa. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente modulo_corte, propiedad del grupo elasticity, definida en el registro ARKON como “Módulo de elasticidad transversal”. Conserva la unidad de referencia GPa y ten el rango físico de referencia 0.001 a 80 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (modulo_young, poisson, modulo_volumetrico) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
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
      "propertyName": "complacencia_cizalladura",
      "neuronId": "N-65-INV",
      "orientation": "inverse",
      "measures": "Complacencia de cizalladura (1/G) — flexibilidad al corte",
      "searchTerms": [
        "complacencia cizalladura",
        "Complacencia de cizalladura (1/G) — flexibilidad al corte",
        "mechanical",
        "complacencia elastica",
        "relacion esbeltez"
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
      "id": "SUPABASE-modulo_corte",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con modulo_corte; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "modulo_corte",
        "modulo_young",
        "poisson",
        "modulo_volumetrico"
      ]
    }
  ],
  "evidenceTerms": [
    "modulo corte",
    "Módulo de elasticidad transversal",
    "elasticity",
    "modulo young",
    "poisson",
    "modulo volumetrico",
    "complacencia cizalladura",
    "Complacencia de cizalladura (1/G) — flexibilidad al corte",
    "mechanical",
    "complacencia elastica",
    "relacion esbeltez",
    "Módulo de elasticidad longitudinal (rigidez)",
    "resistencia compresion",
    "Coeficiente de Poisson (relación de deformación lateral a axial)",
    "Módulo de compresibilidad volumétrica"
  ],
  "sourceNeuron": {
    "group": "elasticity",
    "definition": "Módulo de elasticidad transversal",
    "referenceUnit": "GPa",
    "physicalRange": {
      "min": 0.001,
      "max": 80
    },
    "relatedProperties": [
      "modulo_young",
      "poisson",
      "modulo_volumetrico"
    ]
  }
};
const sourceNeuron = new N015_ModuloCorte();

export class AgentNeuronN015 extends AgenticNeuron {
  constructor() { super(definition, sourceNeuron); }
}

export const AI_NEURON_N015 = new AgentNeuronN015();
