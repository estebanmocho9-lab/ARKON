import { AgenticNeuron } from "../agenticNeuron";
import type { AINeuronProfile } from "../types";
import { N010_Tortuosidad } from "../../physical/N010_tortuosidad";

/** AI clone of direct ARKON neuron N-010; validates its original class at construction. */
const definition: AINeuronProfile = {
  "id": "AI-N-010",
  "coreNeuronId": "N-010",
  "corePropertyName": "tortuosidad",
  "name": "Neurona IA N-010 · tortuosidad",
  "attribute": "tortuosidad",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: tortuosidad. ARKON la define como: Relación entre la longitud efectiva del camino y la longitud recta. Unidad de referencia: adimensional. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente tortuosidad, propiedad del grupo pore, definida en el registro ARKON como “Relación entre la longitud efectiva del camino y la longitud recta”. Conserva la unidad de referencia adimensional y ten el rango físico de referencia 1 a 100 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (permeabilidad_intrinseca, difusion_agua, diametro_poro) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
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
    },
    {
      "propertyName": "rectitud_flujo",
      "neuronId": "N-60-INV",
      "orientation": "inverse",
      "measures": "Rectitud de flujo — camino más directo posible",
      "searchTerms": [
        "rectitud flujo",
        "Rectitud de flujo — camino más directo posible",
        "particle",
        "estrechez capilar",
        "resistividad hidraulica"
      ],
      "units": [
        "-"
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
      "propertyName": "difusion_agua",
      "neuronId": "N-029",
      "orientation": "direct",
      "measures": "Coeficiente de difusión de agua en el material",
      "searchTerms": [
        "difusion agua",
        "Coeficiente de difusión de agua en el material",
        "diffusion",
        "porosidad total",
        "tortuosidad",
        "absorcion agua"
      ],
      "units": [
        "m²/s"
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
    }
  ],
  "subCables": [
    {
      "id": "SUPABASE-tortuosidad",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con tortuosidad; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "tortuosidad",
        "permeabilidad_intrinseca",
        "difusion_agua",
        "diametro_poro"
      ]
    }
  ],
  "evidenceTerms": [
    "tortuosidad",
    "Relación entre la longitud efectiva del camino y la longitud recta",
    "pore",
    "permeabilidad intrinseca",
    "difusion agua",
    "diametro poro",
    "rectitud flujo",
    "Rectitud de flujo — camino más directo posible",
    "particle",
    "estrechez capilar",
    "resistividad hidraulica",
    "Permeabilidad intrínseca (ley de Darcy)",
    "permeability",
    "porosidad total",
    "conductividad hidraulica",
    "Coeficiente de difusión de agua en el material"
  ],
  "sourceNeuron": {
    "group": "pore",
    "definition": "Relación entre la longitud efectiva del camino y la longitud recta",
    "referenceUnit": "adimensional",
    "physicalRange": {
      "min": 1,
      "max": 100
    },
    "relatedProperties": [
      "permeabilidad_intrinseca",
      "difusion_agua",
      "diametro_poro"
    ]
  }
};
const sourceNeuron = new N010_Tortuosidad();

export class AgentNeuronN010 extends AgenticNeuron {
  constructor() { super(definition, sourceNeuron); }
}

export const AI_NEURON_N010 = new AgentNeuronN010();
