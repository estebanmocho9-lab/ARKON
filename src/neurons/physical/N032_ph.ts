/** Neurona directa ARKON N032: perfil IA completo integrado en el módulo físico canónico. */
import { AgenticNeuron } from "../ai/agenticNeuron";
import type { AINeuronProfile } from "../ai/types";

const definition: AINeuronProfile = {
  "id": "AI-N-032",
  "coreNeuronId": "N-032",
  "corePropertyName": "ph",
  "name": "Neurona IA N-032 · ph",
  "attribute": "ph",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: ph. ARKON la define como: pH en solución acuosa. Unidad de referencia: adimensional. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente ph, propiedad del grupo chemical, definida en el registro ARKON como “pH en solución acuosa”. Conserva la unidad de referencia adimensional y ten el rango físico de referencia 0 a 14 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (cao, cec, potencial_zeta) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
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
      "propertyName": "poh",
      "neuronId": "N-82-INV",
      "orientation": "inverse",
      "measures": "pOH — basicidad complementaria al pH",
      "searchTerms": [
        "poh",
        "pOH — basicidad complementaria al pH",
        "chemical",
        "capacidad anionica",
        "punto carga cero"
      ],
      "units": [
        "Escala"
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
      "id": "SUPABASE-ph",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con ph; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "ph",
        "cao",
        "cec",
        "potencial_zeta"
      ]
    }
  ],
  "evidenceTerms": [
    "pH en solución acuosa",
    "chemical",
    "cao",
    "cec",
    "potencial zeta",
    "poh",
    "pOH — basicidad complementaria al pH",
    "capacidad anionica",
    "punto carga cero",
    "Contenido de óxido de calcio (CaO)",
    "composition",
    "mgo",
    "resistencia compresion",
    "Capacidad de intercambio catiónico",
    "adsorcion",
    "Potencial eléctrico en la interfaz sólido-líquido"
  ],
  "sourceNeuron": {
    "group": "chemical",
    "definition": "pH en solución acuosa",
    "referenceUnit": "adimensional",
    "physicalRange": {
      "min": 0,
      "max": 14
    },
    "relatedProperties": [
      "cao",
      "cec",
      "potencial_zeta"
    ]
  }
};

export class N032_Ph extends AgenticNeuron {
  constructor() { super(definition); }
}
