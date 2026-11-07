import { AgenticNeuron } from "../agenticNeuron";
import type { AINeuronProfile } from "../types";

/** AI clone of direct ARKON neuron N-033; validates its original class at construction. */
const definition: AINeuronProfile = {
  "id": "AI-N-033",
  "coreNeuronId": "N-033",
  "corePropertyName": "cec",
  "name": "Neurona IA N-033 · cec",
  "attribute": "cec",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: cec. ARKON la define como: Capacidad de intercambio catiónico. Unidad de referencia: meq/100g. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente cec, propiedad del grupo chemical, definida en el registro ARKON como “Capacidad de intercambio catiónico”. Conserva la unidad de referencia meq/100g y ten el rango físico de referencia 0 a 200 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (ph, adsorcion, potencial_zeta) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
    {
      "propertyName": "cec",
      "neuronId": "N-033",
      "orientation": "direct",
      "measures": "Capacidad de intercambio catiónico",
      "searchTerms": [
        "cec",
        "Capacidad de intercambio catiónico",
        "chemical",
        "adsorcion",
        "potencial zeta"
      ],
      "units": [
        "meq/100g"
      ]
    },
    {
      "propertyName": "capacidad_anionica",
      "neuronId": "N-83-INV",
      "orientation": "inverse",
      "measures": "Capacidad de intercambio aniónico",
      "searchTerms": [
        "capacidad anionica",
        "Capacidad de intercambio aniónico",
        "chemical",
        "poh",
        "desorcion"
      ],
      "units": [
        "meq/100g"
      ]
    },
    {
      "propertyName": "ph",
      "neuronId": "N-032",
      "orientation": "direct",
      "measures": "pH en solución acuosa",
      "searchTerms": [
        "pH en solución acuosa",
        "chemical",
        "cao",
        "cec",
        "potencial zeta"
      ],
      "units": [
        "adimensional"
      ]
    },
    {
      "propertyName": "adsorcion",
      "neuronId": "N-034",
      "orientation": "direct",
      "measures": "Capacidad de adsorción de sustancias (ej. colorantes, metales)",
      "searchTerms": [
        "adsorcion",
        "Capacidad de adsorción de sustancias (ej. colorantes, metales)",
        "chemical",
        "area BET",
        "cec",
        "potencial zeta"
      ],
      "units": [
        "mg/g"
      ]
    },
    {
      "propertyName": "potencial_zeta",
      "neuronId": "N-036",
      "orientation": "direct",
      "measures": "Potencial eléctrico en la interfaz sólido-líquido",
      "searchTerms": [
        "potencial zeta",
        "Potencial eléctrico en la interfaz sólido-líquido",
        "surface",
        "cec",
        "espesor doble capa"
      ],
      "units": [
        "mV"
      ]
    }
  ],
  "subCables": [
    {
      "id": "SUPABASE-cec",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con cec; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "cec",
        "ph",
        "adsorcion",
        "potencial_zeta"
      ]
    }
  ],
  "evidenceTerms": [
    "cec",
    "Capacidad de intercambio catiónico",
    "chemical",
    "adsorcion",
    "potencial zeta",
    "capacidad anionica",
    "Capacidad de intercambio aniónico",
    "poh",
    "desorcion",
    "pH en solución acuosa",
    "cao",
    "Capacidad de adsorción de sustancias (ej. colorantes, metales)",
    "area BET",
    "Potencial eléctrico en la interfaz sólido-líquido",
    "surface",
    "espesor doble capa"
  ],
  "sourceNeuron": {
    "group": "chemical",
    "definition": "Capacidad de intercambio catiónico",
    "referenceUnit": "meq/100g",
    "physicalRange": {
      "min": 0,
      "max": 200
    },
    "relatedProperties": [
      "ph",
      "adsorcion",
      "potencial_zeta"
    ]
  }
};

export class AgentNeuronN033 extends AgenticNeuron {
  constructor() { super(definition); }
}

export const AI_NEURON_N033 = new AgentNeuronN033();
