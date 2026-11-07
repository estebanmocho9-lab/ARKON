/** Neurona directa ARKON N031: perfil IA completo integrado en el módulo físico canónico. */
import { AgenticNeuron } from "../ai/agenticNeuron";
import type { AINeuronProfile } from "../ai/types";

const definition: AINeuronProfile = {
  "id": "AI-N-031",
  "coreNeuronId": "N-031",
  "corePropertyName": "difusion_ionica",
  "name": "Neurona IA N-031 · difusion_ionica",
  "attribute": "difusion_ionica",
  "appliesTo": [
    "mdf",
    "gypsum",
    "concrete"
  ],
  "nucleus": "Magnitud central: difusion_ionica. ARKON la define como: Coeficiente de difusión de iones (por ejemplo, cloruros). Unidad de referencia: m²/s. Busca y evalúa evidencia documental de esa magnitud, no propiedades sustitutas.",
  "methodGuidance": "Investiga específicamente difusion_ionica, propiedad del grupo diffusion, definida en el registro ARKON como “Coeficiente de difusión de iones (por ejemplo, cloruros)”. Conserva la unidad de referencia m²/s y ten el rango físico de referencia 1e-14 a 1e-8 solo como metadato ARKON, no como límite de aceptación del producto. Busca en Turso valores del material/producto y estado solicitados; extrae método/norma, acondicionamiento, geometría u orientación cuando sean pertinentes. Usa las propiedades relacionadas (porosidad_total, conductividad_electrica, cec) y subcables únicamente para localizar fórmulas o dependencias de Supabase; nunca sustituyas la propiedad núcleo por una correlación. Si falta una unidad, método, estado o variable necesaria, informa el faltante y solicita revisión.",
  "cables": [
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
      "propertyName": "resistencia_ionica",
      "neuronId": "N-81-INV",
      "orientation": "inverse",
      "measures": "Resistencia iónica — barrera dieléctrica y bloqueo iónico",
      "searchTerms": [
        "resistencia ionica",
        "Resistencia iónica — barrera dieléctrica y bloqueo iónico",
        "transport",
        "resistividad electrica",
        "poh"
      ],
      "units": [
        "m²/s"
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
    }
  ],
  "subCables": [
    {
      "id": "SUPABASE-difusion_ionica",
      "purpose": "Consultar reglas y fórmulas activas de Supabase relacionadas con difusion_ionica; comprobar entradas, unidades y dominio antes de razonar.",
      "requiredProperties": [
        "difusion_ionica",
        "porosidad_total",
        "conductividad_electrica",
        "cec"
      ]
    }
  ],
  "evidenceTerms": [
    "difusion ionica",
    "Coeficiente de difusión de iones (por ejemplo, cloruros)",
    "diffusion",
    "porosidad total",
    "conductividad electrica",
    "cec",
    "resistencia ionica",
    "Resistencia iónica — barrera dieléctrica y bloqueo iónico",
    "transport",
    "resistividad electrica",
    "poh",
    "Fracción de volumen de vacíos respecto al volumen total",
    "porosity",
    "densidad aparente",
    "absorcion agua",
    "resistencia compresion"
  ],
  "sourceNeuron": {
    "group": "diffusion",
    "definition": "Coeficiente de difusión de iones (por ejemplo, cloruros)",
    "referenceUnit": "m²/s",
    "physicalRange": {
      "min": 1e-14,
      "max": 1e-8
    },
    "relatedProperties": [
      "porosidad_total",
      "conductividad_electrica",
      "cec"
    ]
  }
};

export class N031_DifusionIonica extends AgenticNeuron {
  constructor() { super(definition); }
}
