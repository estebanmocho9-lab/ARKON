import { AgenticNeuron } from "../agenticNeuron";
import type { AINeuronProfile } from "../types";
import { N036_PotencialZeta } from "../../physical/N036_potencial_zeta";

/** AI clone of direct ARKON neuron N-036; validates its original class at construction. */
const definition: AINeuronProfile = {
  "id": "AI-N-036",
  "coreNeuronId": "N-036",
  "corePropertyName": "potencial_zeta",
  "name": "Neurona IA N-036 · potencial_zeta",
  "attribute": "potencial_zeta",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: potencial_zeta. ARKON la define como: Potencial eléctrico en la interfaz sólido-líquido. Unidad de referencia: mV. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente potencial_zeta, propiedad del grupo surface, definida en el registro ARKON como “Potencial eléctrico en la interfaz sólido-líquido”. Conserva la unidad de referencia mV y ten el rango físico de referencia -100 a 100 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (ph, cec, espesor_doble_capa) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
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
      "propertyName": "punto_carga_cero",
      "neuronId": "N-86-INV",
      "orientation": "inverse",
      "measures": "Punto de carga cero (PZC) — equilibrio electrostático de superficie",
      "searchTerms": [
        "punto carga cero",
        "Punto de carga cero (PZC) — equilibrio electrostático de superficie",
        "chemical",
        "poh",
        "estabilidad cohesiva"
      ],
      "units": [
        "pH"
      ]
    },
    {
      "propertyName": "ph",
      "neuronId": "N-032",
      "orientation": "direct",
      "measures": "pH en solución acuosa",
      "searchTerms": [
        "pH en solución acuosa",
        "chemical",
        "cao",
        "cec",
        "potencial zeta"
      ],
      "units": [
        "adimensional"
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
    }
  ],
  "subCables": [
    {
      "id": "SUPABASE-potencial_zeta",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con potencial_zeta; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "potencial_zeta",
        "ph",
        "cec",
        "espesor_doble_capa"
      ]
    }
  ],
  "evidenceTerms": [
    "potencial zeta",
    "Potencial eléctrico en la interfaz sólido-líquido",
    "surface",
    "cec",
    "espesor doble capa",
    "punto carga cero",
    "Punto de carga cero (PZC) — equilibrio electrostático de superficie",
    "chemical",
    "poh",
    "estabilidad cohesiva",
    "pH en solución acuosa",
    "cao",
    "Capacidad de intercambio catiónico",
    "adsorcion",
    "Espesor de la doble capa eléctrica",
    "conductividad electrica"
  ],
  "sourceNeuron": {
    "group": "surface",
    "definition": "Potencial eléctrico en la interfaz sólido-líquido",
    "referenceUnit": "mV",
    "physicalRange": {
      "min": -100,
      "max": 100
    },
    "relatedProperties": [
      "ph",
      "cec",
      "espesor_doble_capa"
    ]
  }
};
const sourceNeuron = new N036_PotencialZeta();

export class AgentNeuronN036 extends AgenticNeuron {
  constructor() { super(definition, sourceNeuron); }
}

export const AI_NEURON_N036 = new AgentNeuronN036();
