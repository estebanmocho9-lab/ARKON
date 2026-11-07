/** Neurona directa ARKON N035: perfil IA completo integrado en el módulo físico canónico. */
import { AgenticNeuron } from "../ai/agenticNeuron";
import type { AINeuronProfile } from "../ai/types";

const definition: AINeuronProfile = {
  "id": "AI-N-035",
  "coreNeuronId": "N-035",
  "corePropertyName": "conductividad_electrica",
  "name": "Neurona IA N-035 · conductividad_electrica",
  "attribute": "conductividad_electrica",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: conductividad_electrica. ARKON la define como: Conductividad eléctrica (medida en solución o en sólido). Unidad de referencia: mS/cm. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente conductividad_electrica, propiedad del grupo electrical, definida en el registro ARKON como “Conductividad eléctrica (medida en solución o en sólido)”. Conserva la unidad de referencia mS/cm y ten el rango físico de referencia 0 a 1000 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (porosidad_total, difusion_ionica, ph) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
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
    },
    {
      "propertyName": "resistividad_electrica",
      "neuronId": "N-85-INV",
      "orientation": "inverse",
      "measures": "Resistividad eléctrica — comportamiento como aislante eléctrico",
      "searchTerms": [
        "resistividad electrica",
        "Resistividad eléctrica — comportamiento como aislante eléctrico",
        "chemical",
        "poh",
        "punto carga cero"
      ],
      "units": [
        "Ω·m"
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
      "propertyName": "difusion_ionica",
      "neuronId": "N-031",
      "orientation": "direct",
      "measures": "Coeficiente de difusión de iones (por ejemplo, cloruros)",
      "searchTerms": [
        "difusion ionica",
        "Coeficiente de difusión de iones (por ejemplo, cloruros)",
        "diffusion",
        "porosidad total",
        "conductividad electrica",
        "cec"
      ],
      "units": [
        "m²/s"
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
    }
  ],
  "subCables": [
    {
      "id": "SUPABASE-conductividad_electrica",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con conductividad_electrica; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "conductividad_electrica",
        "porosidad_total",
        "difusion_ionica",
        "ph"
      ]
    }
  ],
  "evidenceTerms": [
    "conductividad electrica",
    "Conductividad eléctrica (medida en solución o en sólido)",
    "electrical",
    "porosidad total",
    "difusion ionica",
    "resistividad electrica",
    "Resistividad eléctrica — comportamiento como aislante eléctrico",
    "chemical",
    "poh",
    "punto carga cero",
    "Fracción de volumen de vacíos respecto al volumen total",
    "porosity",
    "densidad aparente",
    "absorcion agua",
    "resistencia compresion",
    "Coeficiente de difusión de iones (por ejemplo, cloruros)"
  ],
  "sourceNeuron": {
    "group": "electrical",
    "definition": "Conductividad eléctrica (medida en solución o en sólido)",
    "referenceUnit": "mS/cm",
    "physicalRange": {
      "min": 0,
      "max": 1000
    },
    "relatedProperties": [
      "porosidad_total",
      "difusion_ionica",
      "ph"
    ]
  }
};

export class N035_ConductividadElectrica extends AgenticNeuron {
  constructor() { super(definition); }
}
