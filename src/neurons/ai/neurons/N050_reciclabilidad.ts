import { AgenticNeuron } from "../agenticNeuron";
import type { AINeuronProfile } from "../types";

/** AI clone of direct ARKON neuron N-050; validates its original class at construction. */
const definition: AINeuronProfile = {
  "id": "AI-N-050",
  "coreNeuronId": "N-050",
  "corePropertyName": "reciclabilidad",
  "name": "Neurona IA N-050 · reciclabilidad",
  "attribute": "reciclabilidad",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: reciclabilidad. ARKON la define como: Porcentaje del material que puede ser reciclado al final de su vida útil. Unidad de referencia: %. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente reciclabilidad, propiedad del grupo environmental, definida en el registro ARKON como “Porcentaje del material que puede ser reciclado al final de su vida útil”. Conserva la unidad de referencia % y ten el rango físico de referencia 0 a 100 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (huella_carbono, energia_incorporada, composicion) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
    {
      "propertyName": "reciclabilidad",
      "neuronId": "N-050",
      "orientation": "direct",
      "measures": "Porcentaje del material que puede ser reciclado al final de su vida útil",
      "searchTerms": [
        "reciclabilidad",
        "Porcentaje del material que puede ser reciclado al final de su vida útil",
        "environmental",
        "huella carbono",
        "energia incorporada",
        "composicion"
      ],
      "units": [
        "%"
      ]
    },
    {
      "propertyName": "no_reciclable",
      "neuronId": "N-100-INV",
      "orientation": "inverse",
      "measures": "No reciclable — tasa de confinamiento irreversible",
      "searchTerms": [
        "no reciclable",
        "No reciclable — tasa de confinamiento irreversible",
        "environmental",
        "captura carbono",
        "energia recuperable"
      ],
      "units": [
        "%"
      ]
    },
    {
      "propertyName": "huella_carbono",
      "neuronId": "N-048",
      "orientation": "direct",
      "measures": "Emisiones de CO₂ equivalente por kilogramo de material",
      "searchTerms": [
        "huella carbono",
        "Emisiones de CO₂ equivalente por kilogramo de material",
        "environmental",
        "energia incorporada",
        "reciclabilidad",
        "conductividad termica"
      ],
      "units": [
        "kg CO₂/kg"
      ]
    },
    {
      "propertyName": "energia_incorporada",
      "neuronId": "N-049",
      "orientation": "direct",
      "measures": "Energía total consumida para producir el material",
      "searchTerms": [
        "energia incorporada",
        "Energía total consumida para producir el material",
        "environmental",
        "huella carbono",
        "reciclabilidad",
        "resistencia compresion"
      ],
      "units": [
        "MJ/kg"
      ]
    }
  ],
  "subCables": [
    {
      "id": "SUPABASE-reciclabilidad",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con reciclabilidad; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "reciclabilidad",
        "huella_carbono",
        "energia_incorporada",
        "composicion"
      ]
    }
  ],
  "evidenceTerms": [
    "reciclabilidad",
    "Porcentaje del material que puede ser reciclado al final de su vida útil",
    "environmental",
    "huella carbono",
    "energia incorporada",
    "composicion",
    "no reciclable",
    "No reciclable — tasa de confinamiento irreversible",
    "captura carbono",
    "energia recuperable",
    "Emisiones de CO₂ equivalente por kilogramo de material",
    "conductividad termica",
    "Energía total consumida para producir el material",
    "resistencia compresion"
  ],
  "sourceNeuron": {
    "group": "environmental",
    "definition": "Porcentaje del material que puede ser reciclado al final de su vida útil",
    "referenceUnit": "%",
    "physicalRange": {
      "min": 0,
      "max": 100
    },
    "relatedProperties": [
      "huella_carbono",
      "energia_incorporada",
      "composicion"
    ]
  }
};

export class AgentNeuronN050 extends AgenticNeuron {
  constructor() { super(definition); }
}

export const AI_NEURON_N050 = new AgentNeuronN050();
