/** Neurona directa ARKON N005: perfil IA completo integrado en el módulo físico canónico. */
import { AgenticNeuron } from "../ai/agenticNeuron";
import type { AINeuronProfile } from "../ai/types";

const definition: AINeuronProfile = {
  "id": "AI-N-005",
  "coreNeuronId": "N-005",
  "corePropertyName": "indice_vacios",
  "name": "Neurona IA N-005 · indice_vacios",
  "attribute": "indice_vacios",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: indice_vacios. ARKON la define como: Relación entre volumen de vacíos y volumen de sólidos. Unidad de referencia: adimensional. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente indice_vacios, propiedad del grupo porosity, definida en el registro ARKON como “Relación entre volumen de vacíos y volumen de sólidos”. Conserva la unidad de referencia adimensional y ten el rango físico de referencia 0 a 10 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (porosidad_total, densidad_aparente, densidad_real) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
    {
      "propertyName": "indice_vacios",
      "neuronId": "N-005",
      "orientation": "direct",
      "measures": "Relación entre volumen de vacíos y volumen de sólidos",
      "searchTerms": [
        "indice vacios",
        "Relación entre volumen de vacíos y volumen de sólidos",
        "porosity",
        "porosidad total",
        "densidad aparente",
        "densidad real"
      ],
      "units": [
        "adimensional"
      ]
    },
    {
      "propertyName": "indice_solidos",
      "neuronId": "N-55-INV",
      "orientation": "inverse",
      "measures": "Índice de sólidos (1/e) — fracción de esqueleto sólido",
      "searchTerms": [
        "indice solidos",
        "Índice de sólidos (1/e) — fracción de esqueleto sólido",
        "porosity",
        "volumen especifico real",
        "compacidad"
      ],
      "units": [
        "-"
      ]
    },
    {
      "propertyName": "porosidad_total",
      "neuronId": "N-003",
      "orientation": "direct",
      "measures": "Fracción de volumen de vacíos respecto al volumen total",
      "searchTerms": [
        "porosidad total",
        "Fracción de volumen de vacíos respecto al volumen total",
        "porosity",
        "densidad aparente",
        "absorcion agua",
        "resistencia compresion"
      ],
      "units": [
        "%"
      ]
    },
    {
      "propertyName": "densidad_aparente",
      "neuronId": "N-002",
      "orientation": "direct",
      "measures": "Masa por unidad de volumen total (incluyendo poros)",
      "searchTerms": [
        "densidad aparente",
        "Masa por unidad de volumen total (incluyendo poros)",
        "density",
        "densidad real",
        "porosidad total",
        "absorcion agua"
      ],
      "units": [
        "g/cm³"
      ]
    },
    {
      "propertyName": "densidad_real",
      "neuronId": "N-001",
      "orientation": "direct",
      "measures": "Masa por unidad de volumen sólido sin poros",
      "searchTerms": [
        "densidad real",
        "Masa por unidad de volumen sólido sin poros",
        "density",
        "densidad aparente",
        "porosidad total",
        "resistencia compresion"
      ],
      "units": [
        "g/cm³"
      ]
    }
  ],
  "subCables": [
    {
      "id": "SUPABASE-indice_vacios",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con indice_vacios; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "indice_vacios",
        "porosidad_total",
        "densidad_aparente",
        "densidad_real"
      ]
    }
  ],
  "evidenceTerms": [
    "indice vacios",
    "Relación entre volumen de vacíos y volumen de sólidos",
    "porosity",
    "porosidad total",
    "densidad aparente",
    "densidad real",
    "indice solidos",
    "Índice de sólidos (1/e) — fracción de esqueleto sólido",
    "volumen especifico real",
    "compacidad",
    "Fracción de volumen de vacíos respecto al volumen total",
    "absorcion agua",
    "resistencia compresion",
    "Masa por unidad de volumen total (incluyendo poros)",
    "density",
    "Masa por unidad de volumen sólido sin poros"
  ],
  "sourceNeuron": {
    "group": "porosity",
    "definition": "Relación entre volumen de vacíos y volumen de sólidos",
    "referenceUnit": "adimensional",
    "physicalRange": {
      "min": 0,
      "max": 10
    },
    "relatedProperties": [
      "porosidad_total",
      "densidad_aparente",
      "densidad_real"
    ]
  }
};

export class N005_IndiceVacios extends AgenticNeuron {
  constructor() { super(definition); }
}
