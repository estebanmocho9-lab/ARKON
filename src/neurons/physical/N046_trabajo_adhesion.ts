/** Neurona directa ARKON N046: perfil IA completo integrado en el módulo físico canónico. */
import { AgenticNeuron } from "../ai/agenticNeuron";
import type { AINeuronProfile } from "../ai/types";

const definition: AINeuronProfile = {
  "id": "AI-N-046",
  "coreNeuronId": "N-046",
  "corePropertyName": "trabajo_adhesion",
  "name": "Neurona IA N-046 · trabajo_adhesion",
  "attribute": "trabajo_adhesion",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: trabajo_adhesion. ARKON la define como: Trabajo de adhesión sólido-líquido. Unidad de referencia: mJ/m². Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente trabajo_adhesion, propiedad del grupo surface, definida en el registro ARKON como “Trabajo de adhesión sólido-líquido”. Conserva la unidad de referencia mJ/m² y ten el rango físico de referencia 10 a 1000 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (energia_superficial, angulo_contacto, cohesion) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
    {
      "propertyName": "trabajo_adhesion",
      "neuronId": "N-046",
      "orientation": "direct",
      "measures": "Trabajo de adhesión sólido-líquido",
      "searchTerms": [
        "trabajo adhesion",
        "Trabajo de adhesión sólido-líquido",
        "surface",
        "energia superficial",
        "angulo contacto",
        "cohesion"
      ],
      "units": [
        "mJ/m²"
      ]
    },
    {
      "propertyName": "trabajo_cohesion",
      "neuronId": "N-96-INV",
      "orientation": "inverse",
      "measures": "Trabajo de cohesión — energía de unión interna del material",
      "searchTerms": [
        "trabajo cohesion",
        "Trabajo de cohesión — energía de unión interna del material",
        "surface",
        "estabilidad cohesiva",
        "coseno angulo"
      ],
      "units": [
        "mJ"
      ]
    },
    {
      "propertyName": "energia_superficial",
      "neuronId": "N-044",
      "orientation": "direct",
      "measures": "Energía libre superficial",
      "searchTerms": [
        "energia superficial",
        "Energía libre superficial",
        "surface",
        "angulo contacto",
        "trabajo adhesion",
        "adsorcion"
      ],
      "units": [
        "mJ/m²"
      ]
    },
    {
      "propertyName": "angulo_contacto",
      "neuronId": "N-045",
      "orientation": "direct",
      "measures": "Ángulo de contacto con agua",
      "searchTerms": [
        "angulo contacto",
        "Ángulo de contacto con agua",
        "surface",
        "energia superficial",
        "absorcion agua",
        "trabajo adhesion"
      ],
      "units": [
        "°"
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
    }
  ],
  "subCables": [
    {
      "id": "SUPABASE-trabajo_adhesion",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con trabajo_adhesion; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "trabajo_adhesion",
        "energia_superficial",
        "angulo_contacto",
        "cohesion"
      ]
    }
  ],
  "evidenceTerms": [
    "trabajo adhesion",
    "Trabajo de adhesión sólido-líquido",
    "surface",
    "energia superficial",
    "angulo contacto",
    "cohesion",
    "trabajo cohesion",
    "Trabajo de cohesión — energía de unión interna del material",
    "estabilidad cohesiva",
    "coseno angulo",
    "Energía libre superficial",
    "adsorcion",
    "Ángulo de contacto con agua",
    "absorcion agua",
    "Cohesión interna del material (parámetro de Mohr-Coulomb)",
    "mechanical"
  ],
  "sourceNeuron": {
    "group": "surface",
    "definition": "Trabajo de adhesión sólido-líquido",
    "referenceUnit": "mJ/m²",
    "physicalRange": {
      "min": 10,
      "max": 1000
    },
    "relatedProperties": [
      "energia_superficial",
      "angulo_contacto",
      "cohesion"
    ]
  }
};

export class N046_TrabajoAdhesion extends AgenticNeuron {
  constructor() { super(definition); }
}
