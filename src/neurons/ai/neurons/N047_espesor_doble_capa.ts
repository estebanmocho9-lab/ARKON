import { AgenticNeuron } from "../agenticNeuron";
import type { AINeuronProfile } from "../types";
import { N047_EspesorDobleCapa } from "../../physical/N047_espesor_doble_capa";

/** AI clone of direct ARKON neuron N-047; validates its original class at construction. */
const definition: AINeuronProfile = {
  "id": "AI-N-047",
  "coreNeuronId": "N-047",
  "corePropertyName": "espesor_doble_capa",
  "name": "Neurona IA N-047 · espesor_doble_capa",
  "attribute": "espesor_doble_capa",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: espesor_doble_capa. ARKON la define como: Espesor de la doble capa eléctrica. Unidad de referencia: nm. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente espesor_doble_capa, propiedad del grupo surface, definida en el registro ARKON como “Espesor de la doble capa eléctrica”. Conserva la unidad de referencia nm y ten el rango físico de referencia 0.1 a 1000 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (potencial_zeta, cec, conductividad_electrica) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
    {
      "propertyName": "espesor_doble_capa",
      "neuronId": "N-047",
      "orientation": "direct",
      "measures": "Espesor de la doble capa eléctrica",
      "searchTerms": [
        "espesor doble capa",
        "Espesor de la doble capa eléctrica",
        "surface",
        "potencial zeta",
        "cec",
        "conductividad electrica"
      ],
      "units": [
        "nm"
      ]
    },
    {
      "propertyName": "radio_debye",
      "neuronId": "N-97-INV",
      "orientation": "inverse",
      "measures": "Radio de Debye — fuerza iónica comprimida",
      "searchTerms": [
        "radio debye",
        "Radio de Debye — fuerza iónica comprimida",
        "surface",
        "punto carga cero",
        "resistividad electrica"
      ],
      "units": [
        "nm"
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
      "propertyName": "conductividad_electrica",
      "neuronId": "N-035",
      "orientation": "direct",
      "measures": "Conductividad eléctrica (medida en solución o en sólido)",
      "searchTerms": [
        "conductividad electrica",
        "Conductividad eléctrica (medida en solución o en sólido)",
        "electrical",
        "porosidad total",
        "difusion ionica"
      ],
      "units": [
        "mS/cm"
      ]
    }
  ],
  "subCables": [
    {
      "id": "SUPABASE-espesor_doble_capa",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con espesor_doble_capa; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "espesor_doble_capa",
        "potencial_zeta",
        "cec",
        "conductividad_electrica"
      ]
    }
  ],
  "evidenceTerms": [
    "espesor doble capa",
    "Espesor de la doble capa eléctrica",
    "surface",
    "potencial zeta",
    "cec",
    "conductividad electrica",
    "radio debye",
    "Radio de Debye — fuerza iónica comprimida",
    "punto carga cero",
    "resistividad electrica",
    "Potencial eléctrico en la interfaz sólido-líquido",
    "Capacidad de intercambio catiónico",
    "chemical",
    "adsorcion",
    "Conductividad eléctrica (medida en solución o en sólido)",
    "electrical"
  ],
  "sourceNeuron": {
    "group": "surface",
    "definition": "Espesor de la doble capa eléctrica",
    "referenceUnit": "nm",
    "physicalRange": {
      "min": 0.1,
      "max": 1000
    },
    "relatedProperties": [
      "potencial_zeta",
      "cec",
      "conductividad_electrica"
    ]
  }
};
const sourceNeuron = new N047_EspesorDobleCapa();

export class AgentNeuronN047 extends AgenticNeuron {
  constructor() { super(definition, sourceNeuron); }
}

export const AI_NEURON_N047 = new AgentNeuronN047();
