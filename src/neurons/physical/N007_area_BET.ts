/** Neurona directa ARKON N007: perfil IA completo integrado en el módulo físico canónico. */
import { AgenticNeuron } from "../ai/agenticNeuron";
import type { AINeuronProfile } from "../ai/types";

const definition: AINeuronProfile = {
  "id": "AI-N-007",
  "coreNeuronId": "N-007",
  "corePropertyName": "area_BET",
  "name": "Neurona IA N-007 · area_BET",
  "attribute": "area_BET",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: area_BET. ARKON la define como: Superficie específica medida por método BET. Unidad de referencia: m²/g. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente area_BET, propiedad del grupo particle, definida en el registro ARKON como “Superficie específica medida por método BET”. Conserva la unidad de referencia m²/g y ten el rango físico de referencia 0.1 a 1000 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (tamaño_particula, adsorcion, porosidad_total) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
    {
      "propertyName": "area_BET",
      "neuronId": "N-007",
      "orientation": "direct",
      "measures": "Superficie específica medida por método BET",
      "searchTerms": [
        "area BET",
        "Superficie específica medida por método BET",
        "particle",
        "tamaño particula",
        "adsorcion",
        "porosidad total"
      ],
      "units": [
        "m²/g"
      ]
    },
    {
      "propertyName": "lisura_geometrica",
      "neuronId": "N-57-INV",
      "orientation": "inverse",
      "measures": "Lisura geométrica — superficie baja indica partícula lisa",
      "searchTerms": [
        "lisura geometrica",
        "Lisura geométrica — superficie baja indica partícula lisa",
        "particle",
        "superficie especifica blaine",
        "volumen esqueleto"
      ],
      "units": [
        "m²/g"
      ]
    },
    {
      "propertyName": "tamaño_particula",
      "neuronId": "N-006",
      "orientation": "direct",
      "measures": "Diámetro medio de partícula",
      "searchTerms": [
        "tamaño particula",
        "Diámetro medio de partícula",
        "particle",
        "area BET",
        "volumen poro",
        "porosidad total"
      ],
      "units": [
        "µm"
      ]
    },
    {
      "propertyName": "adsorcion",
      "neuronId": "N-034",
      "orientation": "direct",
      "measures": "Capacidad de adsorción de sustancias (ej. colorantes, metales)",
      "searchTerms": [
        "adsorcion",
        "Capacidad de adsorción de sustancias (ej. colorantes, metales)",
        "chemical",
        "area BET",
        "cec",
        "potencial zeta"
      ],
      "units": [
        "mg/g"
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
    }
  ],
  "subCables": [
    {
      "id": "SUPABASE-area_BET",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con area_BET; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "area_BET",
        "tamaño_particula",
        "adsorcion",
        "porosidad_total"
      ]
    }
  ],
  "evidenceTerms": [
    "area BET",
    "Superficie específica medida por método BET",
    "particle",
    "tamaño particula",
    "adsorcion",
    "porosidad total",
    "lisura geometrica",
    "Lisura geométrica — superficie baja indica partícula lisa",
    "superficie especifica blaine",
    "volumen esqueleto",
    "Diámetro medio de partícula",
    "volumen poro",
    "Capacidad de adsorción de sustancias (ej. colorantes, metales)",
    "chemical",
    "cec",
    "potencial zeta"
  ],
  "sourceNeuron": {
    "group": "particle",
    "definition": "Superficie específica medida por método BET",
    "referenceUnit": "m²/g",
    "physicalRange": {
      "min": 0.1,
      "max": 1000
    },
    "relatedProperties": [
      "tamaño_particula",
      "adsorcion",
      "porosidad_total"
    ]
  }
};

export class N007_AreaBET extends AgenticNeuron {
  constructor() { super(definition); }
}
