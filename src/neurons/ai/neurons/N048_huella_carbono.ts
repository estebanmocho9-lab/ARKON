import { AgenticNeuron } from "../agenticNeuron";
import type { AINeuronProfile } from "../types";

/** AI clone of direct ARKON neuron N-048; validates its original class at construction. */
const definition: AINeuronProfile = {
  "id": "AI-N-048",
  "coreNeuronId": "N-048",
  "corePropertyName": "huella_carbono",
  "name": "Neurona IA N-048 · huella_carbono",
  "attribute": "huella_carbono",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: huella_carbono. ARKON la define como: Emisiones de CO₂ equivalente por kilogramo de material. Unidad de referencia: kg CO₂/kg. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente huella_carbono, propiedad del grupo environmental, definida en el registro ARKON como “Emisiones de CO₂ equivalente por kilogramo de material”. Conserva la unidad de referencia kg CO₂/kg y ten el rango físico de referencia 0 a 1000 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (energia_incorporada, reciclabilidad, conductividad_termica) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
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
      "propertyName": "captura_carbono",
      "neuronId": "N-98-INV",
      "orientation": "inverse",
      "measures": "Captura de carbono — secuestro de CO₂ del material",
      "searchTerms": [
        "captura carbono",
        "Captura de carbono — secuestro de CO₂ del material",
        "environmental",
        "energia recuperable",
        "no reciclable"
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
      "propertyName": "conductividad_termica",
      "neuronId": "N-021",
      "orientation": "direct",
      "measures": "Capacidad de transmitir calor por conducción",
      "searchTerms": [
        "conductividad termica",
        "Capacidad de transmitir calor por conducción",
        "thermal",
        "porosidad total",
        "calor especifico",
        "difusividad termica"
      ],
      "units": [
        "W/(m·K)"
      ]
    }
  ],
  "subCables": [
    {
      "id": "SUPABASE-huella_carbono",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con huella_carbono; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "huella_carbono",
        "energia_incorporada",
        "reciclabilidad",
        "conductividad_termica"
      ]
    }
  ],
  "evidenceTerms": [
    "huella carbono",
    "Emisiones de CO₂ equivalente por kilogramo de material",
    "environmental",
    "energia incorporada",
    "reciclabilidad",
    "conductividad termica",
    "captura carbono",
    "Captura de carbono — secuestro de CO₂ del material",
    "energia recuperable",
    "no reciclable",
    "Energía total consumida para producir el material",
    "resistencia compresion",
    "Porcentaje del material que puede ser reciclado al final de su vida útil",
    "composicion",
    "Capacidad de transmitir calor por conducción",
    "thermal"
  ],
  "sourceNeuron": {
    "group": "environmental",
    "definition": "Emisiones de CO₂ equivalente por kilogramo de material",
    "referenceUnit": "kg CO₂/kg",
    "physicalRange": {
      "min": 0,
      "max": 1000
    },
    "relatedProperties": [
      "energia_incorporada",
      "reciclabilidad",
      "conductividad_termica"
    ]
  }
};

export class AgentNeuronN048 extends AgenticNeuron {
  constructor() { super(definition); }
}

export const AI_NEURON_N048 = new AgentNeuronN048();
