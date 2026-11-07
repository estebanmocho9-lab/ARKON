import { AgenticNeuron } from "../agenticNeuron";
import type { AINeuronProfile } from "../types";
import { N027_PermeabilidadIntrinseca } from "../../physical/N027_permeabilidad_intrinseca";

/** AI clone of direct ARKON neuron N-027; validates its original class at construction. */
const definition: AINeuronProfile = {
  "id": "AI-N-027",
  "coreNeuronId": "N-027",
  "corePropertyName": "permeabilidad_intrinseca",
  "name": "Neurona IA N-027 · permeabilidad_intrinseca",
  "attribute": "permeabilidad_intrinseca",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: permeabilidad_intrinseca. ARKON la define como: Permeabilidad intrínseca (ley de Darcy). Unidad de referencia: mD. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente permeabilidad_intrinseca, propiedad del grupo permeability, definida en el registro ARKON como “Permeabilidad intrínseca (ley de Darcy)”. Conserva la unidad de referencia mD y ten el rango físico de referencia 0.000001 a 1000000 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (porosidad_total, diametro_poro, conductividad_hidraulica) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
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
      "propertyName": "resistencia_matriz",
      "neuronId": "N-77-INV",
      "orientation": "inverse",
      "measures": "Resistencia de matriz — frena el flujo de fluidos",
      "searchTerms": [
        "resistencia matriz",
        "Resistencia de matriz — frena el flujo de fluidos",
        "transport",
        "resistividad hidraulica",
        "rectitud flujo"
      ],
      "units": [
        "m/s"
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
      "propertyName": "diametro_poro",
      "neuronId": "N-009",
      "orientation": "direct",
      "measures": "Diámetro medio de poro",
      "searchTerms": [
        "diametro poro",
        "Diámetro medio de poro",
        "pore",
        "volumen poro",
        "permeabilidad intrinseca",
        "tortuosidad"
      ],
      "units": [
        "nm"
      ]
    },
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
    }
  ],
  "subCables": [
    {
      "id": "SUPABASE-permeabilidad_intrinseca",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con permeabilidad_intrinseca; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "permeabilidad_intrinseca",
        "porosidad_total",
        "diametro_poro",
        "conductividad_hidraulica"
      ]
    }
  ],
  "evidenceTerms": [
    "permeabilidad intrinseca",
    "Permeabilidad intrínseca (ley de Darcy)",
    "permeability",
    "porosidad total",
    "diametro poro",
    "conductividad hidraulica",
    "resistencia matriz",
    "Resistencia de matriz — frena el flujo de fluidos",
    "transport",
    "resistividad hidraulica",
    "rectitud flujo",
    "Fracción de volumen de vacíos respecto al volumen total",
    "porosity",
    "densidad aparente",
    "absorcion agua",
    "resistencia compresion"
  ],
  "sourceNeuron": {
    "group": "permeability",
    "definition": "Permeabilidad intrínseca (ley de Darcy)",
    "referenceUnit": "mD",
    "physicalRange": {
      "min": 0.000001,
      "max": 1000000
    },
    "relatedProperties": [
      "porosidad_total",
      "diametro_poro",
      "conductividad_hidraulica"
    ]
  }
};
const sourceNeuron = new N027_PermeabilidadIntrinseca();

export class AgentNeuronN027 extends AgenticNeuron {
  constructor() { super(definition, sourceNeuron); }
}

export const AI_NEURON_N027 = new AgentNeuronN027();
