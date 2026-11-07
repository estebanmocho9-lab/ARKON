import { AgenticNeuron } from "../agenticNeuron";
import type { AINeuronProfile } from "../types";
import { N009_DiametroPoro } from "../../physical/N009_diametro_poro";

/** AI clone of direct ARKON neuron N-009; validates its original class at construction. */
const definition: AINeuronProfile = {
  "id": "AI-N-009",
  "coreNeuronId": "N-009",
  "corePropertyName": "diametro_poro",
  "name": "Neurona IA N-009 · diametro_poro",
  "attribute": "diametro_poro",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: diametro_poro. ARKON la define como: Diámetro medio de poro. Unidad de referencia: nm. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente diametro_poro, propiedad del grupo pore, definida en el registro ARKON como “Diámetro medio de poro”. Conserva la unidad de referencia nm y ten el rango físico de referencia 1 a 100000 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (volumen_poro, permeabilidad_intrinseca, tortuosidad) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
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
      "propertyName": "estrechez_capilar",
      "neuronId": "N-59-INV",
      "orientation": "inverse",
      "measures": "Estrechez capilar — poros finos frenan el flujo capilar",
      "searchTerms": [
        "estrechez capilar",
        "Estrechez capilar — poros finos frenan el flujo capilar",
        "particle",
        "rectitud flujo",
        "resistencia matriz"
      ],
      "units": [
        "µm"
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
      "propertyName": "tortuosidad",
      "neuronId": "N-010",
      "orientation": "direct",
      "measures": "Relación entre la longitud efectiva del camino y la longitud recta",
      "searchTerms": [
        "tortuosidad",
        "Relación entre la longitud efectiva del camino y la longitud recta",
        "pore",
        "permeabilidad intrinseca",
        "difusion agua",
        "diametro poro"
      ],
      "units": [
        "adimensional"
      ]
    }
  ],
  "subCables": [
    {
      "id": "SUPABASE-diametro_poro",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con diametro_poro; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "diametro_poro",
        "volumen_poro",
        "permeabilidad_intrinseca",
        "tortuosidad"
      ]
    }
  ],
  "evidenceTerms": [
    "diametro poro",
    "Diámetro medio de poro",
    "pore",
    "volumen poro",
    "permeabilidad intrinseca",
    "tortuosidad",
    "estrechez capilar",
    "Estrechez capilar — poros finos frenan el flujo capilar",
    "particle",
    "rectitud flujo",
    "resistencia matriz",
    "Volumen de poros por unidad de masa",
    "porosidad total",
    "absorcion agua",
    "Permeabilidad intrínseca (ley de Darcy)",
    "permeability"
  ],
  "sourceNeuron": {
    "group": "pore",
    "definition": "Diámetro medio de poro",
    "referenceUnit": "nm",
    "physicalRange": {
      "min": 1,
      "max": 100000
    },
    "relatedProperties": [
      "volumen_poro",
      "permeabilidad_intrinseca",
      "tortuosidad"
    ]
  }
};
const sourceNeuron = new N009_DiametroPoro();

export class AgentNeuronN009 extends AgenticNeuron {
  constructor() { super(definition, sourceNeuron); }
}

export const AI_NEURON_N009 = new AgentNeuronN009();
