/** Neurona directa ARKON N026: perfil IA completo integrado en el módulo físico canónico. */
import { AgenticNeuron } from "../ai/agenticNeuron";
import type { AINeuronProfile } from "../ai/types";

const definition: AINeuronProfile = {
  "id": "AI-N-026",
  "coreNeuronId": "N-026",
  "corePropertyName": "difusividad_termica",
  "name": "Neurona IA N-026 · difusividad_termica",
  "attribute": "difusividad_termica",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: difusividad_termica. ARKON la define como: Velocidad de propagación de cambios de temperatura. Unidad de referencia: mm²/s. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente difusividad_termica, propiedad del grupo thermal, definida en el registro ARKON como “Velocidad de propagación de cambios de temperatura”. Conserva la unidad de referencia mm²/s y ten el rango físico de referencia 0.01 a 1000 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (conductividad_termica, calor_especifico, densidad_aparente) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
    {
      "propertyName": "difusividad_termica",
      "neuronId": "N-026",
      "orientation": "direct",
      "measures": "Velocidad de propagación de cambios de temperatura",
      "searchTerms": [
        "difusividad termica",
        "Velocidad de propagación de cambios de temperatura",
        "thermal",
        "conductividad termica",
        "calor especifico",
        "densidad aparente"
      ],
      "units": [
        "mm²/s"
      ]
    },
    {
      "propertyName": "retardo_termico",
      "neuronId": "N-76-INV",
      "orientation": "inverse",
      "measures": "Retardo térmico — inercia ante cambios de temperatura",
      "searchTerms": [
        "retardo termico",
        "Retardo térmico — inercia ante cambios de temperatura",
        "thermal",
        "resistividad termica",
        "sensibilidad termica"
      ],
      "units": [
        "10⁻⁶m²/s"
      ]
    },
    {
      "propertyName": "conductividad_termica",
      "neuronId": "N-021",
      "orientation": "direct",
      "measures": "Capacidad de transmitir calor por conducción",
      "searchTerms": [
        "conductividad termica",
        "Capacidad de transmitir calor por conducción",
        "thermal",
        "porosidad total",
        "calor especifico",
        "difusividad termica"
      ],
      "units": [
        "W/(m·K)"
      ]
    },
    {
      "propertyName": "calor_especifico",
      "neuronId": "N-022",
      "orientation": "direct",
      "measures": "Energía necesaria para elevar la temperatura de 1 kg en 1 K",
      "searchTerms": [
        "calor especifico",
        "Energía necesaria para elevar la temperatura de 1 kg en 1 K",
        "thermal",
        "conductividad termica",
        "difusividad termica",
        "densidad aparente"
      ],
      "units": [
        "J/(kg·K)"
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
    }
  ],
  "subCables": [
    {
      "id": "SUPABASE-difusividad_termica",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con difusividad_termica; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "difusividad_termica",
        "conductividad_termica",
        "calor_especifico",
        "densidad_aparente"
      ]
    }
  ],
  "evidenceTerms": [
    "difusividad termica",
    "Velocidad de propagación de cambios de temperatura",
    "thermal",
    "conductividad termica",
    "calor especifico",
    "densidad aparente",
    "retardo termico",
    "Retardo térmico — inercia ante cambios de temperatura",
    "resistividad termica",
    "sensibilidad termica",
    "Capacidad de transmitir calor por conducción",
    "porosidad total",
    "Energía necesaria para elevar la temperatura de 1 kg en 1 K",
    "Masa por unidad de volumen total (incluyendo poros)",
    "density",
    "densidad real"
  ],
  "sourceNeuron": {
    "group": "thermal",
    "definition": "Velocidad de propagación de cambios de temperatura",
    "referenceUnit": "mm²/s",
    "physicalRange": {
      "min": 0.01,
      "max": 1000
    },
    "relatedProperties": [
      "conductividad_termica",
      "calor_especifico",
      "densidad_aparente"
    ]
  }
};

export class N026_DifusividadTermica extends AgenticNeuron {
  constructor() { super(definition); }
}
