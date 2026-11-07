import { AgenticNeuron } from "../agenticNeuron";
import type { AINeuronProfile } from "../types";
import { N008_VolumenPoro } from "../../physical/N008_volumen_poro";

/** AI clone of direct ARKON neuron N-008; validates its original class at construction. */
const definition: AINeuronProfile = {
  "id": "AI-N-008",
  "coreNeuronId": "N-008",
  "corePropertyName": "volumen_poro",
  "name": "Neurona IA N-008 · volumen_poro",
  "attribute": "volumen_poro",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: volumen_poro. ARKON la define como: Volumen de poros por unidad de masa. Unidad de referencia: cm³/g. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente volumen_poro, propiedad del grupo pore, definida en el registro ARKON como “Volumen de poros por unidad de masa”. Conserva la unidad de referencia cm³/g y ten el rango físico de referencia 0.001 a 10 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (porosidad_total, diametro_poro, absorcion_agua) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
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
      "propertyName": "volumen_esqueleto",
      "neuronId": "N-58-INV",
      "orientation": "inverse",
      "measures": "Volumen de esqueleto sólido — espacio ocupado por el sólido",
      "searchTerms": [
        "volumen esqueleto",
        "Volumen de esqueleto sólido — espacio ocupado por el sólido",
        "particle",
        "compacidad",
        "volumen especifico real"
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
      "id": "SUPABASE-volumen_poro",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con volumen_poro; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "volumen_poro",
        "porosidad_total",
        "diametro_poro",
        "absorcion_agua"
      ]
    }
  ],
  "evidenceTerms": [
    "volumen poro",
    "Volumen de poros por unidad de masa",
    "pore",
    "porosidad total",
    "diametro poro",
    "absorcion agua",
    "volumen esqueleto",
    "Volumen de esqueleto sólido — espacio ocupado por el sólido",
    "particle",
    "compacidad",
    "volumen especifico real",
    "Fracción de volumen de vacíos respecto al volumen total",
    "porosity",
    "densidad aparente",
    "resistencia compresion",
    "Diámetro medio de poro"
  ],
  "sourceNeuron": {
    "group": "pore",
    "definition": "Volumen de poros por unidad de masa",
    "referenceUnit": "cm³/g",
    "physicalRange": {
      "min": 0.001,
      "max": 10
    },
    "relatedProperties": [
      "porosidad_total",
      "diametro_poro",
      "absorcion_agua"
    ]
  }
};
const sourceNeuron = new N008_VolumenPoro();

export class AgentNeuronN008 extends AgenticNeuron {
  constructor() { super(definition, sourceNeuron); }
}

export const AI_NEURON_N008 = new AgentNeuronN008();
