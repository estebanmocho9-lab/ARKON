import { AgenticNeuron } from "../agenticNeuron";
import type { AINeuronProfile } from "../types";
import { N006_TamanoParticula } from "../../physical/N006_tamano_particula";

/** AI clone of direct ARKON neuron N-006; validates its original class at construction. */
const definition: AINeuronProfile = {
  "id": "AI-N-006",
  "coreNeuronId": "N-006",
  "corePropertyName": "tamaño_particula",
  "name": "Neurona IA N-006 · tamaño_particula",
  "attribute": "tamaño_particula",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: tamaño_particula. ARKON la define como: Diámetro medio de partícula. Unidad de referencia: µm. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente tamaño_particula, propiedad del grupo particle, definida en el registro ARKON como “Diámetro medio de partícula”. Conserva la unidad de referencia µm y ten el rango físico de referencia 0.001 a 1000 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (area_BET, volumen_poro, porosidad_total) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
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
      "propertyName": "superficie_especifica_blaine",
      "neuronId": "N-56-INV",
      "orientation": "inverse",
      "measures": "Superficie específica Blaine — área por unidad de masa",
      "searchTerms": [
        "superficie especifica blaine",
        "Superficie específica Blaine — área por unidad de masa",
        "particle",
        "lisura geometrica",
        "estrechez capilar"
      ],
      "units": [
        "cm²/g"
      ]
    },
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
      "propertyName": "volumen_poro",
      "neuronId": "N-008",
      "orientation": "direct",
      "measures": "Volumen de poros por unidad de masa",
      "searchTerms": [
        "volumen poro",
        "Volumen de poros por unidad de masa",
        "pore",
        "porosidad total",
        "diametro poro",
        "absorcion agua"
      ],
      "units": [
        "cm³/g"
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
      "id": "SUPABASE-tamaño_particula",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con tamaño_particula; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "tamaño_particula",
        "area_BET",
        "volumen_poro",
        "porosidad_total"
      ]
    }
  ],
  "evidenceTerms": [
    "tamaño particula",
    "Diámetro medio de partícula",
    "particle",
    "area BET",
    "volumen poro",
    "porosidad total",
    "superficie especifica blaine",
    "Superficie específica Blaine — área por unidad de masa",
    "lisura geometrica",
    "estrechez capilar",
    "Superficie específica medida por método BET",
    "adsorcion",
    "Volumen de poros por unidad de masa",
    "pore",
    "diametro poro",
    "absorcion agua"
  ],
  "sourceNeuron": {
    "group": "particle",
    "definition": "Diámetro medio de partícula",
    "referenceUnit": "µm",
    "physicalRange": {
      "min": 0.001,
      "max": 1000
    },
    "relatedProperties": [
      "area_BET",
      "volumen_poro",
      "porosidad_total"
    ]
  }
};
const sourceNeuron = new N006_TamanoParticula();

export class AgentNeuronN006 extends AgenticNeuron {
  constructor() { super(definition, sourceNeuron); }
}

export const AI_NEURON_N006 = new AgentNeuronN006();
