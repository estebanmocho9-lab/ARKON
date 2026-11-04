import { AgenticNeuron } from "../agenticNeuron";
import type { AINeuronProfile } from "../types";
import { N049_EnergiaIncorporada } from "../../physical/N049_energia_incorporada";

/** AI clone of direct ARKON neuron N-049; validates its original class at construction. */
const definition: AINeuronProfile = {
  "id": "AI-N-049",
  "coreNeuronId": "N-049",
  "corePropertyName": "energia_incorporada",
  "name": "Neurona IA N-049 · energia_incorporada",
  "attribute": "energia_incorporada",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: energia_incorporada. ARKON la define como: Energía total consumida para producir el material. Unidad de referencia: MJ/kg. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente energia_incorporada, propiedad del grupo environmental, definida en el registro ARKON como “Energía total consumida para producir el material”. Conserva la unidad de referencia MJ/kg y ten el rango físico de referencia 0 a 500 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (huella_carbono, reciclabilidad, resistencia_compresion) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
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
    },
    {
      "propertyName": "energia_recuperable",
      "neuronId": "N-99-INV",
      "orientation": "inverse",
      "measures": "Energía recuperable residual — energía reutilizable",
      "searchTerms": [
        "energia recuperable",
        "Energía recuperable residual — energía reutilizable",
        "environmental",
        "captura carbono",
        "no reciclable"
      ],
      "units": [
        "MJ/kg"
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
      "propertyName": "resistencia_compresion",
      "neuronId": "N-011",
      "orientation": "direct",
      "measures": "Tensión máxima de compresión antes de la falla",
      "searchTerms": [
        "resistencia compresion",
        "Tensión máxima de compresión antes de la falla",
        "mechanical",
        "porosidad total",
        "resistencia traccion",
        "modulo young"
      ],
      "units": [
        "MPa"
      ]
    }
  ],
  "subCables": [
    {
      "id": "SUPABASE-energia_incorporada",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con energia_incorporada; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "energia_incorporada",
        "huella_carbono",
        "reciclabilidad",
        "resistencia_compresion"
      ]
    }
  ],
  "evidenceTerms": [
    "energia incorporada",
    "Energía total consumida para producir el material",
    "environmental",
    "huella carbono",
    "reciclabilidad",
    "resistencia compresion",
    "energia recuperable",
    "Energía recuperable residual — energía reutilizable",
    "captura carbono",
    "no reciclable",
    "Emisiones de CO₂ equivalente por kilogramo de material",
    "conductividad termica",
    "Porcentaje del material que puede ser reciclado al final de su vida útil",
    "composicion",
    "Tensión máxima de compresión antes de la falla",
    "mechanical"
  ],
  "sourceNeuron": {
    "group": "environmental",
    "definition": "Energía total consumida para producir el material",
    "referenceUnit": "MJ/kg",
    "physicalRange": {
      "min": 0,
      "max": 500
    },
    "relatedProperties": [
      "huella_carbono",
      "reciclabilidad",
      "resistencia_compresion"
    ]
  }
};
const sourceNeuron = new N049_EnergiaIncorporada();

export class AgentNeuronN049 extends AgenticNeuron {
  constructor() { super(definition, sourceNeuron); }
}

export const AI_NEURON_N049 = new AgentNeuronN049();
