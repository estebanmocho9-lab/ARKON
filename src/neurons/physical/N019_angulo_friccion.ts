/** Neurona directa ARKON N019: perfil IA completo integrado en el módulo físico canónico. */
import { AgenticNeuron } from "../ai/agenticNeuron";
import type { AINeuronProfile } from "../ai/types";

const definition: AINeuronProfile = {
  "id": "AI-N-019",
  "coreNeuronId": "N-019",
  "corePropertyName": "angulo_friccion",
  "name": "Neurona IA N-019 · angulo_friccion",
  "attribute": "angulo_friccion",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: angulo_friccion. ARKON la define como: Ángulo de fricción interna (parámetro de Mohr-Coulomb). Unidad de referencia: °. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente angulo_friccion, propiedad del grupo mechanical, definida en el registro ARKON como “Ángulo de fricción interna (parámetro de Mohr-Coulomb)”. Conserva la unidad de referencia ° y ten el rango físico de referencia 0 a 90 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (cohesion, resistencia_compresion, dureza_mohs) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
    {
      "propertyName": "angulo_friccion",
      "neuronId": "N-019",
      "orientation": "direct",
      "measures": "Ángulo de fricción interna (parámetro de Mohr-Coulomb)",
      "searchTerms": [
        "angulo friccion",
        "Ángulo de fricción interna (parámetro de Mohr-Coulomb)",
        "mechanical",
        "cohesion",
        "resistencia compresion",
        "dureza mohs"
      ],
      "units": [
        "°"
      ]
    },
    {
      "propertyName": "coef_deslizamiento",
      "neuronId": "N-69-INV",
      "orientation": "inverse",
      "measures": "Coeficiente de deslizamiento lubricado",
      "searchTerms": [
        "coef deslizamiento",
        "Coeficiente de deslizamiento lubricado",
        "mechanical",
        "inv cohesion",
        "blandura"
      ],
      "units": [
        "adim"
      ]
    },
    {
      "propertyName": "cohesion",
      "neuronId": "N-017",
      "orientation": "direct",
      "measures": "Cohesión interna del material (parámetro de Mohr-Coulomb)",
      "searchTerms": [
        "cohesion",
        "Cohesión interna del material (parámetro de Mohr-Coulomb)",
        "mechanical",
        "angulo friccion",
        "resistencia compresion",
        "resistencia traccion"
      ],
      "units": [
        "MPa"
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
    },
    {
      "propertyName": "dureza_mohs",
      "neuronId": "N-018",
      "orientation": "direct",
      "measures": "Dureza según escala de Mohs (1 a 10)",
      "searchTerms": [
        "dureza mohs",
        "Dureza según escala de Mohs (1 a 10)",
        "mechanical",
        "resistencia compresion",
        "angulo friccion",
        "energia superficial"
      ],
      "units": [
        "adimensional"
      ]
    }
  ],
  "subCables": [
    {
      "id": "SUPABASE-angulo_friccion",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con angulo_friccion; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "angulo_friccion",
        "cohesion",
        "resistencia_compresion",
        "dureza_mohs"
      ]
    }
  ],
  "evidenceTerms": [
    "angulo friccion",
    "Ángulo de fricción interna (parámetro de Mohr-Coulomb)",
    "mechanical",
    "cohesion",
    "resistencia compresion",
    "dureza mohs",
    "coef deslizamiento",
    "Coeficiente de deslizamiento lubricado",
    "inv cohesion",
    "blandura",
    "Cohesión interna del material (parámetro de Mohr-Coulomb)",
    "resistencia traccion",
    "Tensión máxima de compresión antes de la falla",
    "porosidad total",
    "modulo young",
    "Dureza según escala de Mohs (1 a 10)"
  ],
  "sourceNeuron": {
    "group": "mechanical",
    "definition": "Ángulo de fricción interna (parámetro de Mohr-Coulomb)",
    "referenceUnit": "°",
    "physicalRange": {
      "min": 0,
      "max": 90
    },
    "relatedProperties": [
      "cohesion",
      "resistencia_compresion",
      "dureza_mohs"
    ]
  }
};

export class N019_AnguloFriccion extends AgenticNeuron {
  constructor() { super(definition); }
}
