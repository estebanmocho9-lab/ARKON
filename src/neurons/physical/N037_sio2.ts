/** Neurona directa ARKON N037: perfil IA completo integrado en el módulo físico canónico. */
import { AgenticNeuron } from "../ai/agenticNeuron";
import type { AINeuronProfile } from "../ai/types";

const definition: AINeuronProfile = {
  "id": "AI-N-037",
  "coreNeuronId": "N-037",
  "corePropertyName": "sio2",
  "name": "Neurona IA N-037 · sio2",
  "attribute": "sio2",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: sio2. ARKON la define como: Contenido de dióxido de silicio (SiO₂). Unidad de referencia: %. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente sio2, propiedad del grupo composition, definida en el registro ARKON como “Contenido de dióxido de silicio (SiO₂)”. Conserva la unidad de referencia % y ten el rango físico de referencia 0 a 100 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (al2o3, cao, ph) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
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
      "propertyName": "actividad_puzolana",
      "neuronId": "N-87-INV",
      "orientation": "inverse",
      "measures": "Actividad puzolánica — reactividad de la sílice con cal",
      "searchTerms": [
        "actividad puzolana",
        "Actividad puzolánica — reactividad de la sílice con cal",
        "composition",
        "cal libre",
        "contenido alumina"
      ],
      "units": [
        "%"
      ]
    },
    {
      "propertyName": "al2o3",
      "neuronId": "N-038",
      "orientation": "direct",
      "measures": "Contenido de alúmina (Al₂O₃)",
      "searchTerms": [
        "al2o3",
        "Contenido de alúmina (Al₂O₃)",
        "composition",
        "sio2",
        "fe2o3",
        "cec"
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
      "id": "SUPABASE-sio2",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con sio2; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "sio2",
        "al2o3",
        "cao",
        "ph"
      ]
    }
  ],
  "evidenceTerms": [
    "sio2",
    "Contenido de dióxido de silicio (SiO₂)",
    "composition",
    "al2o3",
    "cao",
    "actividad puzolana",
    "Actividad puzolánica — reactividad de la sílice con cal",
    "cal libre",
    "contenido alumina",
    "Contenido de alúmina (Al₂O₃)",
    "fe2o3",
    "cec",
    "Contenido de óxido de calcio (CaO)",
    "mgo",
    "resistencia compresion",
    "pH en solución acuosa"
  ],
  "sourceNeuron": {
    "group": "composition",
    "definition": "Contenido de dióxido de silicio (SiO₂)",
    "referenceUnit": "%",
    "physicalRange": {
      "min": 0,
      "max": 100
    },
    "relatedProperties": [
      "al2o3",
      "cao",
      "ph"
    ],
    "confidenceDefault": 0.98
  }
};

export class N037_SiO2 extends AgenticNeuron {
  constructor() { super(definition); }
}
