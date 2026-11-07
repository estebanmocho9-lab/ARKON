/** Neurona directa ARKON N034: perfil IA completo integrado en el módulo físico canónico. */
import { AgenticNeuron } from "../ai/agenticNeuron";
import type { AINeuronProfile } from "../ai/types";

const definition: AINeuronProfile = {
  "id": "AI-N-034",
  "coreNeuronId": "N-034",
  "corePropertyName": "adsorcion",
  "name": "Neurona IA N-034 · adsorcion",
  "attribute": "adsorcion",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: adsorcion. ARKON la define como: Capacidad de adsorción de sustancias (ej. colorantes, metales). Unidad de referencia: mg/g. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente adsorcion, propiedad del grupo chemical, definida en el registro ARKON como “Capacidad de adsorción de sustancias (ej. colorantes, metales)”. Conserva la unidad de referencia mg/g y ten el rango físico de referencia 0 a 1000 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (area_BET, cec, potencial_zeta) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
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
      "propertyName": "desorcion",
      "neuronId": "N-84-INV",
      "orientation": "inverse",
      "measures": "Desorción — capacidad de liberar moléculas adsorbidas",
      "searchTerms": [
        "desorcion",
        "Desorción — capacidad de liberar moléculas adsorbidas",
        "chemical",
        "capacidad anionica",
        "lisura geometrica"
      ],
      "units": [
        "-"
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
      "id": "SUPABASE-adsorcion",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con adsorcion; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "adsorcion",
        "area_BET",
        "cec",
        "potencial_zeta"
      ]
    }
  ],
  "evidenceTerms": [
    "adsorcion",
    "Capacidad de adsorción de sustancias (ej. colorantes, metales)",
    "chemical",
    "area BET",
    "cec",
    "potencial zeta",
    "desorcion",
    "Desorción — capacidad de liberar moléculas adsorbidas",
    "capacidad anionica",
    "lisura geometrica",
    "Superficie específica medida por método BET",
    "particle",
    "tamaño particula",
    "porosidad total",
    "Capacidad de intercambio catiónico",
    "Potencial eléctrico en la interfaz sólido-líquido"
  ],
  "sourceNeuron": {
    "group": "chemical",
    "definition": "Capacidad de adsorción de sustancias (ej. colorantes, metales)",
    "referenceUnit": "mg/g",
    "physicalRange": {
      "min": 0,
      "max": 1000
    },
    "relatedProperties": [
      "area_BET",
      "cec",
      "potencial_zeta"
    ],
    "confidenceDefault": 0.9
  }
};

export class N034_Adsorcion extends AgenticNeuron {
  constructor() { super(definition); }
}
