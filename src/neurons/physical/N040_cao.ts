/** Neurona directa ARKON N040: perfil IA completo integrado en el módulo físico canónico. */
import { AgenticNeuron } from "../ai/agenticNeuron";
import type { AINeuronProfile } from "../ai/types";

const definition: AINeuronProfile = {
  "id": "AI-N-040",
  "coreNeuronId": "N-040",
  "corePropertyName": "cao",
  "name": "Neurona IA N-040 · cao",
  "attribute": "cao",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: cao. ARKON la define como: Contenido de óxido de calcio (CaO). Unidad de referencia: %. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente cao, propiedad del grupo composition, definida en el registro ARKON como “Contenido de óxido de calcio (CaO)”. Conserva la unidad de referencia % y ten el rango físico de referencia 0 a 100 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (ph, mgo, resistencia_compresion) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
    {
      "propertyName": "cao",
      "neuronId": "N-040",
      "orientation": "direct",
      "measures": "Contenido de óxido de calcio (CaO)",
      "searchTerms": [
        "cao",
        "Contenido de óxido de calcio (CaO)",
        "composition",
        "mgo",
        "resistencia compresion"
      ],
      "units": [
        "%"
      ]
    },
    {
      "propertyName": "cal_libre",
      "neuronId": "N-90-INV",
      "orientation": "inverse",
      "measures": "Cal libre — índice de acidez relativo al CaO",
      "searchTerms": [
        "cal libre",
        "Cal libre — índice de acidez relativo al CaO",
        "composition",
        "actividad puzolana",
        "magnesia"
      ],
      "units": [
        "%"
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
      "propertyName": "mgo",
      "neuronId": "N-041",
      "orientation": "direct",
      "measures": "Contenido de óxido de magnesio (MgO)",
      "searchTerms": [
        "mgo",
        "Contenido de óxido de magnesio (MgO)",
        "composition",
        "cao",
        "sio2",
        "expansion termica"
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
      "id": "SUPABASE-cao",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con cao; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "cao",
        "ph",
        "mgo",
        "resistencia_compresion"
      ]
    }
  ],
  "evidenceTerms": [
    "cao",
    "Contenido de óxido de calcio (CaO)",
    "composition",
    "mgo",
    "resistencia compresion",
    "cal libre",
    "Cal libre — índice de acidez relativo al CaO",
    "actividad puzolana",
    "magnesia",
    "pH en solución acuosa",
    "chemical",
    "cec",
    "potencial zeta",
    "Contenido de óxido de magnesio (MgO)",
    "sio2",
    "expansion termica"
  ],
  "sourceNeuron": {
    "group": "composition",
    "definition": "Contenido de óxido de calcio (CaO)",
    "referenceUnit": "%",
    "physicalRange": {
      "min": 0,
      "max": 100
    },
    "relatedProperties": [
      "ph",
      "mgo",
      "resistencia_compresion"
    ]
  }
};

export class N040_CaO extends AgenticNeuron {
  constructor() { super(definition); }
}
