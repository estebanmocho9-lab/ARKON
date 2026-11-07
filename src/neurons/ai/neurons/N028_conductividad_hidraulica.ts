import { AgenticNeuron } from "../agenticNeuron";
import type { AINeuronProfile } from "../types";

/** AI clone of direct ARKON neuron N-028; validates its original class at construction. */
const definition: AINeuronProfile = {
  "id": "AI-N-028",
  "coreNeuronId": "N-028",
  "corePropertyName": "conductividad_hidraulica",
  "name": "Neurona IA N-028 · conductividad_hidraulica",
  "attribute": "conductividad_hidraulica",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: conductividad_hidraulica. ARKON la define como: Conductividad hidráulica saturada. Unidad de referencia: m/s. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente conductividad_hidraulica, propiedad del grupo permeability, definida en el registro ARKON como “Conductividad hidráulica saturada”. Conserva la unidad de referencia m/s y ten el rango físico de referencia 1e-12 a 1 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (permeabilidad_intrinseca, porosidad_total, absorcion_agua) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
    {
      "propertyName": "conductividad_hidraulica",
      "neuronId": "N-028",
      "orientation": "direct",
      "measures": "Conductividad hidráulica saturada",
      "searchTerms": [
        "conductividad hidraulica",
        "Conductividad hidráulica saturada",
        "permeability",
        "permeabilidad intrinseca",
        "porosidad total",
        "absorcion agua"
      ],
      "units": [
        "m/s"
      ]
    },
    {
      "propertyName": "resistividad_hidraulica",
      "neuronId": "N-78-INV",
      "orientation": "inverse",
      "measures": "Resistividad hidráulica (1/K) — frena el paso del agua",
      "searchTerms": [
        "resistividad hidraulica",
        "Resistividad hidráulica (1/K) — frena el paso del agua",
        "transport",
        "resistencia matriz",
        "compacidad"
      ],
      "units": [
        "m/s"
      ]
    },
    {
      "propertyName": "permeabilidad_intrinseca",
      "neuronId": "N-027",
      "orientation": "direct",
      "measures": "Permeabilidad intrínseca (ley de Darcy)",
      "searchTerms": [
        "permeabilidad intrinseca",
        "Permeabilidad intrínseca (ley de Darcy)",
        "permeability",
        "porosidad total",
        "diametro poro",
        "conductividad hidraulica"
      ],
      "units": [
        "mD"
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
    }
  ],
  "subCables": [
    {
      "id": "SUPABASE-conductividad_hidraulica",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con conductividad_hidraulica; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "conductividad_hidraulica",
        "permeabilidad_intrinseca",
        "porosidad_total",
        "absorcion_agua"
      ]
    }
  ],
  "evidenceTerms": [
    "conductividad hidraulica",
    "Conductividad hidráulica saturada",
    "permeability",
    "permeabilidad intrinseca",
    "porosidad total",
    "absorcion agua",
    "resistividad hidraulica",
    "Resistividad hidráulica (1/K) — frena el paso del agua",
    "transport",
    "resistencia matriz",
    "compacidad",
    "Permeabilidad intrínseca (ley de Darcy)",
    "diametro poro",
    "Fracción de volumen de vacíos respecto al volumen total",
    "porosity",
    "densidad aparente"
  ],
  "sourceNeuron": {
    "group": "permeability",
    "definition": "Conductividad hidráulica saturada",
    "referenceUnit": "m/s",
    "physicalRange": {
      "min": 1e-12,
      "max": 1
    },
    "relatedProperties": [
      "permeabilidad_intrinseca",
      "porosidad_total",
      "absorcion_agua"
    ]
  }
};

export class AgentNeuronN028 extends AgenticNeuron {
  constructor() { super(definition); }
}

export const AI_NEURON_N028 = new AgentNeuronN028();
