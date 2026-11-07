/** Neurona directa ARKON N038: perfil IA completo integrado en el módulo físico canónico. */
import { AgenticNeuron } from "../ai/agenticNeuron";
import type { AINeuronProfile } from "../ai/types";

const definition: AINeuronProfile = {
  "id": "AI-N-038",
  "coreNeuronId": "N-038",
  "corePropertyName": "al2o3",
  "name": "Neurona IA N-038 · al2o3",
  "attribute": "al2o3",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: al2o3. ARKON la define como: Contenido de alúmina (Al₂O₃). Unidad de referencia: %. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente al2o3, propiedad del grupo composition, definida en el registro ARKON como “Contenido de alúmina (Al₂O₃)”. Conserva la unidad de referencia % y ten el rango físico de referencia 0 a 100 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (sio2, fe2o3, cec) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
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
      "propertyName": "contenido_alumina",
      "neuronId": "N-88-INV",
      "orientation": "inverse",
      "measures": "Contenido de alúmina — refractariedad e índice de fundición",
      "searchTerms": [
        "contenido alumina",
        "Contenido de alúmina — refractariedad e índice de fundición",
        "composition",
        "actividad puzolana",
        "contenido ferrico"
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
      "propertyName": "fe2o3",
      "neuronId": "N-039",
      "orientation": "direct",
      "measures": "Contenido de óxido férrico (Fe₂O₃)",
      "searchTerms": [
        "fe2o3",
        "Contenido de óxido férrico (Fe₂O₃)",
        "composition",
        "sio2",
        "al2o3",
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
    }
  ],
  "subCables": [
    {
      "id": "SUPABASE-al2o3",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con al2o3; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "al2o3",
        "sio2",
        "fe2o3",
        "cec"
      ]
    }
  ],
  "evidenceTerms": [
    "al2o3",
    "Contenido de alúmina (Al₂O₃)",
    "composition",
    "sio2",
    "fe2o3",
    "cec",
    "contenido alumina",
    "Contenido de alúmina — refractariedad e índice de fundición",
    "actividad puzolana",
    "contenido ferrico",
    "Contenido de dióxido de silicio (SiO₂)",
    "cao",
    "Contenido de óxido férrico (Fe₂O₃)",
    "conductividad electrica",
    "Capacidad de intercambio catiónico",
    "chemical"
  ],
  "sourceNeuron": {
    "group": "composition",
    "definition": "Contenido de alúmina (Al₂O₃)",
    "referenceUnit": "%",
    "physicalRange": {
      "min": 0,
      "max": 100
    },
    "relatedProperties": [
      "sio2",
      "fe2o3",
      "cec"
    ],
    "confidenceDefault": 0.98
  }
};

export class N038_Al2O3 extends AgenticNeuron {
  constructor() { super(definition); }
}
