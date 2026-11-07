/** Neurona directa ARKON N003: perfil IA completo integrado en el módulo físico canónico. */
import { AgenticNeuron } from "../ai/agenticNeuron";
import type { AINeuronProfile } from "../ai/types";

const definition: AINeuronProfile = {
  "id": "AI-N-003",
  "coreNeuronId": "N-003",
  "corePropertyName": "porosidad_total",
  "name": "Neurona IA N-003 · porosidad_total",
  "attribute": "porosidad_total",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: porosidad_total. ARKON la define como: Fracción de volumen de vacíos respecto al volumen total. Unidad de referencia: %. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente porosidad_total, propiedad del grupo porosity, definida en el registro ARKON como “Fracción de volumen de vacíos respecto al volumen total”. Conserva la unidad de referencia % y ten el rango físico de referencia 0 a 100 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (densidad_aparente, absorcion_agua, resistencia_compresion) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
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
      "propertyName": "compacidad",
      "neuronId": "N-53-INV",
      "orientation": "inverse",
      "measures": "Compacidad — fracción sólida del volumen total",
      "searchTerms": [
        "compacidad",
        "Compacidad — fracción sólida del volumen total",
        "porosity",
        "volumen especifico aparente",
        "impermeabilidad"
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
      "propertyName": "absorcion_agua",
      "neuronId": "N-004",
      "orientation": "direct",
      "measures": "Porcentaje de agua absorbida respecto al peso seco",
      "searchTerms": [
        "absorcion agua",
        "Porcentaje de agua absorbida respecto al peso seco",
        "absorption",
        "porosidad total",
        "permeabilidad intrinseca",
        "angulo contacto"
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
      "id": "SUPABASE-porosidad_total",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con porosidad_total; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "porosidad_total",
        "densidad_aparente",
        "absorcion_agua",
        "resistencia_compresion"
      ]
    }
  ],
  "evidenceTerms": [
    "porosidad total",
    "Fracción de volumen de vacíos respecto al volumen total",
    "porosity",
    "densidad aparente",
    "absorcion agua",
    "resistencia compresion",
    "compacidad",
    "Compacidad — fracción sólida del volumen total",
    "volumen especifico aparente",
    "impermeabilidad",
    "Masa por unidad de volumen total (incluyendo poros)",
    "density",
    "densidad real",
    "Porcentaje de agua absorbida respecto al peso seco",
    "absorption",
    "permeabilidad intrinseca"
  ],
  "sourceNeuron": {
    "group": "porosity",
    "definition": "Fracción de volumen de vacíos respecto al volumen total",
    "referenceUnit": "%",
    "physicalRange": {
      "min": 0,
      "max": 100
    },
    "relatedProperties": [
      "densidad_aparente",
      "absorcion_agua",
      "resistencia_compresion"
    ]
  }
};

/** Conserva el identificador histórico; núcleo, cables y subcables viven en este módulo. */
export class N003_PorosidadTotal extends AgenticNeuron {
  constructor() { super(definition); }
}
