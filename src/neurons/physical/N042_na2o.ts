/** Neurona directa ARKON N042: perfil IA completo integrado en el módulo físico canónico. */
import { AgenticNeuron } from "../ai/agenticNeuron";
import type { AINeuronProfile } from "../ai/types";

const definition: AINeuronProfile = {
  "id": "AI-N-042",
  "coreNeuronId": "N-042",
  "corePropertyName": "na2o",
  "name": "Neurona IA N-042 · na2o",
  "attribute": "na2o",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: na2o. ARKON la define como: Contenido de óxido de sodio (Na₂O). Unidad de referencia: %. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente na2o, propiedad del grupo composition, definida en el registro ARKON como “Contenido de óxido de sodio (Na₂O)”. Conserva la unidad de referencia % y ten el rango físico de referencia 0 a 100 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (k2o, ph, conductividad_electrica) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
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
      "propertyName": "viscosidad_fundido_sodico",
      "neuronId": "N-92-INV",
      "orientation": "inverse",
      "measures": "Viscosidad de fase líquida sódica — influencia del Na₂O en fusión",
      "searchTerms": [
        "viscosidad fundido sodico",
        "Viscosidad de fase líquida sódica — influencia del Na₂O en fusión",
        "composition",
        "viscosidad fundido potasico",
        "actividad puzolana"
      ],
      "units": [
        "%"
      ]
    },
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
      "id": "SUPABASE-na2o",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con na2o; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "na2o",
        "k2o",
        "ph",
        "conductividad_electrica"
      ]
    }
  ],
  "evidenceTerms": [
    "na2o",
    "Contenido de óxido de sodio (Na₂O)",
    "composition",
    "k2o",
    "conductividad electrica",
    "viscosidad fundido sodico",
    "Viscosidad de fase líquida sódica — influencia del Na₂O en fusión",
    "viscosidad fundido potasico",
    "actividad puzolana",
    "Contenido de óxido de potasio (K₂O)",
    "cec",
    "pH en solución acuosa",
    "chemical",
    "cao",
    "potencial zeta",
    "Conductividad eléctrica (medida en solución o en sólido)"
  ],
  "sourceNeuron": {
    "group": "composition",
    "definition": "Contenido de óxido de sodio (Na₂O)",
    "referenceUnit": "%",
    "physicalRange": {
      "min": 0,
      "max": 100
    },
    "relatedProperties": [
      "k2o",
      "ph",
      "conductividad_electrica"
    ],
    "confidenceDefault": 0.98
  }
};

export class N042_Na2O extends AgenticNeuron {
  constructor() { super(definition); }
}
