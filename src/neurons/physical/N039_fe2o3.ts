/** Neurona directa ARKON N039: perfil IA completo integrado en el módulo físico canónico. */
import { AgenticNeuron } from "../ai/agenticNeuron";
import type { AINeuronProfile } from "../ai/types";

const definition: AINeuronProfile = {
  "id": "AI-N-039",
  "coreNeuronId": "N-039",
  "corePropertyName": "fe2o3",
  "name": "Neurona IA N-039 · fe2o3",
  "attribute": "fe2o3",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: fe2o3. ARKON la define como: Contenido de óxido férrico (Fe₂O₃). Unidad de referencia: %. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente fe2o3, propiedad del grupo composition, definida en el registro ARKON como “Contenido de óxido férrico (Fe₂O₃)”. Conserva la unidad de referencia % y ten el rango físico de referencia 0 a 100 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (sio2, al2o3, conductividad_electrica) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
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
      "propertyName": "contenido_ferrico",
      "neuronId": "N-89-INV",
      "orientation": "inverse",
      "measures": "Contenido férrico — óxido ferroso reducido (FeO)",
      "searchTerms": [
        "contenido ferrico",
        "Contenido férrico — óxido ferroso reducido (FeO)",
        "composition",
        "contenido alumina",
        "magnesia"
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
      "propertyName": "conductividad_electrica",
      "neuronId": "N-035",
      "orientation": "direct",
      "measures": "Conductividad eléctrica (medida en solución o en sólido)",
      "searchTerms": [
        "conductividad electrica",
        "Conductividad eléctrica (medida en solución o en sólido)",
        "electrical",
        "porosidad total",
        "difusion ionica"
      ],
      "units": [
        "mS/cm"
      ]
    }
  ],
  "subCables": [
    {
      "id": "SUPABASE-fe2o3",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con fe2o3; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "fe2o3",
        "sio2",
        "al2o3",
        "conductividad_electrica"
      ]
    }
  ],
  "evidenceTerms": [
    "fe2o3",
    "Contenido de óxido férrico (Fe₂O₃)",
    "composition",
    "sio2",
    "al2o3",
    "conductividad electrica",
    "contenido ferrico",
    "Contenido férrico — óxido ferroso reducido (FeO)",
    "contenido alumina",
    "magnesia",
    "Contenido de dióxido de silicio (SiO₂)",
    "cao",
    "Contenido de alúmina (Al₂O₃)",
    "cec",
    "Conductividad eléctrica (medida en solución o en sólido)",
    "electrical"
  ],
  "sourceNeuron": {
    "group": "composition",
    "definition": "Contenido de óxido férrico (Fe₂O₃)",
    "referenceUnit": "%",
    "physicalRange": {
      "min": 0,
      "max": 100
    },
    "relatedProperties": [
      "sio2",
      "al2o3",
      "conductividad_electrica"
    ]
  }
};

export class N039_Fe2O3 extends AgenticNeuron {
  constructor() { super(definition); }
}
