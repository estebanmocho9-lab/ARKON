/** Neurona directa ARKON N041: perfil IA completo integrado en el módulo físico canónico. */
import { AgenticNeuron } from "../ai/agenticNeuron";
import type { AINeuronProfile } from "../ai/types";

const definition: AINeuronProfile = {
  "id": "AI-N-041",
  "coreNeuronId": "N-041",
  "corePropertyName": "mgo",
  "name": "Neurona IA N-041 · mgo",
  "attribute": "mgo",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: mgo. ARKON la define como: Contenido de óxido de magnesio (MgO). Unidad de referencia: %. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente mgo, propiedad del grupo composition, definida en el registro ARKON como “Contenido de óxido de magnesio (MgO)”. Conserva la unidad de referencia % y ten el rango físico de referencia 0 a 100 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (cao, sio2, expansion_termica) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
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
      "propertyName": "magnesia",
      "neuronId": "N-91-INV",
      "orientation": "inverse",
      "measures": "Magnesia — estabilidad volumétrica inmediata",
      "searchTerms": [
        "magnesia",
        "Magnesia — estabilidad volumétrica inmediata",
        "composition",
        "cal libre",
        "contenido alumina"
      ],
      "units": [
        "%"
      ]
    },
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
      "propertyName": "sio2",
      "neuronId": "N-037",
      "orientation": "direct",
      "measures": "Contenido de dióxido de silicio (SiO₂)",
      "searchTerms": [
        "sio2",
        "Contenido de dióxido de silicio (SiO₂)",
        "composition",
        "al2o3",
        "cao"
      ],
      "units": [
        "%"
      ]
    },
    {
      "propertyName": "expansion_termica",
      "neuronId": "N-023",
      "orientation": "direct",
      "measures": "Coeficiente de expansión térmica lineal",
      "searchTerms": [
        "expansion termica",
        "Coeficiente de expansión térmica lineal",
        "thermal",
        "modulo young",
        "resistencia traccion",
        "temperatura servicio"
      ],
      "units": [
        "10^-6/K"
      ]
    }
  ],
  "subCables": [
    {
      "id": "SUPABASE-mgo",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con mgo; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "mgo",
        "cao",
        "sio2",
        "expansion_termica"
      ]
    }
  ],
  "evidenceTerms": [
    "mgo",
    "Contenido de óxido de magnesio (MgO)",
    "composition",
    "cao",
    "sio2",
    "expansion termica",
    "magnesia",
    "Magnesia — estabilidad volumétrica inmediata",
    "cal libre",
    "contenido alumina",
    "Contenido de óxido de calcio (CaO)",
    "resistencia compresion",
    "Contenido de dióxido de silicio (SiO₂)",
    "al2o3",
    "Coeficiente de expansión térmica lineal",
    "thermal"
  ],
  "sourceNeuron": {
    "group": "composition",
    "definition": "Contenido de óxido de magnesio (MgO)",
    "referenceUnit": "%",
    "physicalRange": {
      "min": 0,
      "max": 100
    },
    "relatedProperties": [
      "cao",
      "sio2",
      "expansion_termica"
    ],
    "confidenceDefault": 0.98
  }
};

export class N041_MgO extends AgenticNeuron {
  constructor() { super(definition); }
}
