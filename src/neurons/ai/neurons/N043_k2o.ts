import { AgenticNeuron } from "../agenticNeuron";
import type { AINeuronProfile } from "../types";
import { N043_K2O } from "../../physical/N043_k2o";

/** AI clone of direct ARKON neuron N-043; validates its original class at construction. */
const definition: AINeuronProfile = {
  "id": "AI-N-043",
  "coreNeuronId": "N-043",
  "corePropertyName": "k2o",
  "name": "Neurona IA N-043 · k2o",
  "attribute": "k2o",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: k2o. ARKON la define como: Contenido de óxido de potasio (K₂O). Unidad de referencia: %. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente k2o, propiedad del grupo composition, definida en el registro ARKON como “Contenido de óxido de potasio (K₂O)”. Conserva la unidad de referencia % y ten el rango físico de referencia 0 a 100 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (na2o, cec, ph) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
    {
      "propertyName": "k2o",
      "neuronId": "N-043",
      "orientation": "direct",
      "measures": "Contenido de óxido de potasio (K₂O)",
      "searchTerms": [
        "k2o",
        "Contenido de óxido de potasio (K₂O)",
        "composition",
        "na2o",
        "cec"
      ],
      "units": [
        "%"
      ]
    },
    {
      "propertyName": "viscosidad_fundido_potasico",
      "neuronId": "N-93-INV",
      "orientation": "inverse",
      "measures": "Viscosidad de fase líquida potásica — influencia del K₂O en fusión",
      "searchTerms": [
        "viscosidad fundido potasico",
        "Viscosidad de fase líquida potásica — influencia del K₂O en fusión",
        "composition",
        "viscosidad fundido sodico",
        "cal libre"
      ],
      "units": [
        "%"
      ]
    },
    {
      "propertyName": "na2o",
      "neuronId": "N-042",
      "orientation": "direct",
      "measures": "Contenido de óxido de sodio (Na₂O)",
      "searchTerms": [
        "na2o",
        "Contenido de óxido de sodio (Na₂O)",
        "composition",
        "k2o",
        "conductividad electrica"
      ],
      "units": [
        "%"
      ]
    },
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
    }
  ],
  "subCables": [
    {
      "id": "SUPABASE-k2o",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con k2o; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "k2o",
        "na2o",
        "cec",
        "ph"
      ]
    }
  ],
  "evidenceTerms": [
    "k2o",
    "Contenido de óxido de potasio (K₂O)",
    "composition",
    "na2o",
    "cec",
    "viscosidad fundido potasico",
    "Viscosidad de fase líquida potásica — influencia del K₂O en fusión",
    "viscosidad fundido sodico",
    "cal libre",
    "Contenido de óxido de sodio (Na₂O)",
    "conductividad electrica",
    "Capacidad de intercambio catiónico",
    "chemical",
    "adsorcion",
    "potencial zeta",
    "pH en solución acuosa"
  ],
  "sourceNeuron": {
    "group": "composition",
    "definition": "Contenido de óxido de potasio (K₂O)",
    "referenceUnit": "%",
    "physicalRange": {
      "min": 0,
      "max": 100
    },
    "relatedProperties": [
      "na2o",
      "cec",
      "ph"
    ]
  }
};
const sourceNeuron = new N043_K2O();

export class AgentNeuronN043 extends AgenticNeuron {
  constructor() { super(definition, sourceNeuron); }
}

export const AI_NEURON_N043 = new AgentNeuronN043();
