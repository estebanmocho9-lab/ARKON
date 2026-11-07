/** Neurona directa ARKON N001: perfil IA completo integrado en el módulo físico canónico. */
import { AgenticNeuron } from "../ai/agenticNeuron";
import type { AINeuronProfile } from "../ai/types";

const definition: AINeuronProfile = {
  "id": "AI-N-001",
  "coreNeuronId": "N-001",
  "corePropertyName": "densidad_real",
  "name": "Neurona IA N-001 · densidad_real",
  "attribute": "densidad_real",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: densidad_real. ARKON la define como: Masa por unidad de volumen sólido sin poros. Unidad de referencia: g/cm³. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente densidad_real, propiedad del grupo density, definida en el registro ARKON como “Masa por unidad de volumen sólido sin poros”. Conserva la unidad de referencia g/cm³ y ten el rango físico de referencia 0.5 a 5.5 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (densidad_aparente, porosidad_total, resistencia_compresion) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
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
    },
    {
      "propertyName": "volumen_especifico_real",
      "neuronId": "N-51-INV",
      "orientation": "inverse",
      "measures": "Volumen específico real — cm³ por gramo de sólido",
      "searchTerms": [
        "volumen especifico real",
        "Volumen específico real — cm³ por gramo de sólido",
        "density",
        "volumen especifico aparente",
        "compacidad"
      ],
      "units": [
        "cm³/g"
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
      "id": "SUPABASE-densidad_real",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con densidad_real; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "densidad_real",
        "densidad_aparente",
        "porosidad_total",
        "resistencia_compresion"
      ]
    }
  ],
  "evidenceTerms": [
    "densidad real",
    "Masa por unidad de volumen sólido sin poros",
    "density",
    "densidad aparente",
    "porosidad total",
    "resistencia compresion",
    "volumen especifico real",
    "Volumen específico real — cm³ por gramo de sólido",
    "volumen especifico aparente",
    "compacidad",
    "Masa por unidad de volumen total (incluyendo poros)",
    "absorcion agua",
    "Fracción de volumen de vacíos respecto al volumen total",
    "porosity",
    "Tensión máxima de compresión antes de la falla",
    "mechanical"
  ],
  "sourceNeuron": {
    "group": "density",
    "definition": "Masa por unidad de volumen sólido sin poros",
    "referenceUnit": "g/cm³",
    "physicalRange": {
      "min": 0.5,
      "max": 5.5
    },
    "relatedProperties": [
      "densidad_aparente",
      "porosidad_total",
      "resistencia_compresion"
    ],
    "confidenceDefault": 0.98
  }
};

/** Conserva el identificador histórico; núcleo, cables y subcables viven en este módulo. */
export class N001_DensidadReal extends AgenticNeuron {
  constructor() { super(definition); }
}
