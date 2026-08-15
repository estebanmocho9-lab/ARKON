// ============================================================
// src/extraction-neurons/diccionarios/atributos.ts
// Cualidades/atributos DESCRIPTIVOS de materiales (no numéricos):
// Soldabilidad, Ductilidad, Tenacidad, etc. A diferencia de
// propiedades.ts, estos se reconocen por su sola PRESENCIA en el
// texto (no necesitan un valor numérico al lado) — cubren el caso
// de un libro que describe un material con palabras ('este
// material es dúctil y resistente al desgaste') en vez de cifras.
//
// Fuente: extraído y corregido de DATOS_COMPLETOS.xlsx (respuesta
// de otra IA a partir del prompt de referencia armado en el chat).
// ============================================================

export interface EntradaAtributo {
  id: string;
  nombre_es: string;
  nombre_en: string;
  definicion: string;
  propiedades_asociadas: string;   // texto libre, propiedades relacionadas
  norma_metodo: string;             // norma o método típico de evaluación
}

export const ATRIBUTOS: EntradaAtributo[] = [
  { id: 'soldabilidad', nombre_es: 'Soldabilidad', nombre_en: 'Soldabilidad',
    definicion: 'Capacidad de un material para ser soldadura por unido sin defectos y conservando sus propiedades',
    propiedades_asociadas: 'Composición química equivalente, carbono, tenacidad, sensibilidad al agrietamiento', norma_metodo: 'ISO 15614, AWS D1.1, carbono equivalente (IIW)' },
  { id: 'maquinabilidad', nombre_es: 'Maquinabilidad', nombre_en: 'Maquinabilidad',
    definicion: 'Facilidad con que un material mase corte con arranque de viruta, relacionada con desgaste de herramienta, superficial y ajuste y potencia consumida',
    propiedades_asociadas: 'Dureza, ductilidad, conductaria, cámaras térmicas', norma_metodo: 'ASTM E618 (vida de herramienta), índice de maquinabilidad relativo' },
  { id: 'conformabilidad', nombre_es: 'Conformabilidad', nombre_en: 'Formability',
    definicion: 'Capacidad para ser deformado plásticamente hasta una forma deseada sin agrietarse ni estricción excesiva',
    propiedades_asociadas: 'Límite elástico, elongación, exponente n, coeficiente de anisotropía plástica (R)', norma_metodo: 'Curvas FLD, ensayo de copa Erichsen, ASTM E2218' },
  { id: 'ductilidad', nombre_es: 'Ductilidad', nombre_en: 'Ductility',
    definicion: 'Capacidad de un material para deformarse plásticamente bajo tracción sin romperse',
    propiedades_asociadas: 'Elongación (A), estricción (Z)', norma_metodo: 'ASTM E8, ISO 6892-1' },
  { id: 'maleabilidad', nombre_es: 'Maleabilidad', nombre_en: 'Malleability',
    definicion: 'Capacidad de deformarse por compresión para formar láminas delgadas sin agrietarse',
    propiedades_asociadas: 'Ductilidad en compresión, límite elástico', norma_metodo: 'Ensayos de forjabilidad' },
  { id: 'tenacidad', nombre_es: 'Tenacidad', nombre_en: 'Toughness',
    definicion: 'Capacidad de absorber energía antes de la fractura, combinando resistencia y ductilidad',
    propiedades_asociadas: 'Integral J, KV, K_IC, energía de deformación total', norma_metodo: 'ASTM E23, ASTM E1820' },
  { id: 'resiliencia', nombre_es: 'Resiliencia', nombre_en: 'Resilience',
    definicion: 'Capacidad de absorber energía en el rango elástico',
    propiedades_asociadas: 'Límite elástico, módulo de Young (módulo de resiliencia = σ_y2/2E)', norma_metodo: 'Curva tensión-deformación (área elástica)' },
  { id: 'resistencia_al_desgaste', nombre_es: 'Resistencia al desgaste', nombre_en: 'Wear resistance',
    definicion: 'Oposición a la pérdida progresiva de material de la superficie por acción mecánica',
    propiedades_asociadas: 'Dureza, coeficiente de fricción, tenacidad a la fractura, microestructura', norma_metodo: 'ASTM G65 (arena seca), ASTM G99 (pin-on-disk)' },
  { id: 'resistencia_a_la_abrasion', nombre_es: 'Resistencia a la abrasión', nombre_en: 'Abrasion resistance',
    definicion: 'Resistencia al desgaste por partículas duras que deslizan o impactan',
    propiedades_asociadas: 'Dureza, tenacidad', norma_metodo: 'Taber Abraser (ASTM D4060), ensayo de Los Ángeles (ASTM C131)' },
  { id: 'resistencia_a_la_erosion', nombre_es: 'Resistencia a la erosión', nombre_en: 'Erosion resistance',
    definicion: 'Resistencia al desgaste por impacto de partículas sólidas o gotas de líquido',
    propiedades_asociadas: 'Dureza, ángulo de impacto, tenacidad', norma_metodo: 'ASTM G76 (chorro de partículas)' },
  { id: 'resistencia_a_la_corrosion', nombre_es: 'Resistencia a la corrosión', nombre_en: 'Corrosion resistance',
    definicion: 'Capacidad de un material para soportar el ataque químico o electroquímico en un ambiente dado',
    propiedades_asociadas: 'Potencial de corrosión, i_corr, pasividad, composición', norma_metodo: 'ASTM G48 (picaduras), ASTM B117 (niebla salina)' },
  { id: 'resistencia_a_la_oxidacion_en_caliente', nombre_es: 'Resistencia a la oxidación en caliente', nombre_en: 'Hot oxidation resistance',
    definicion: 'Resistencia a la formación de óxidos a alta temperatura en atmósfera oxidante',
    propiedades_asociadas: 'Co de difusión, de la capa de óxido, óxido (Cr, Al, Si)', norma_metodo: 'ASTM G54 (oxidación cíclica), ISO 21608' },
  { id: 'pasividad', nombre_es: 'Pasividad', nombre_en: 'Passivity',
    definicion: 'Formación de una capa superficial protectora que reduce drásticamente la velocidad de corrosión',
    propiedades_asociadas: 'Potencial de picado, composición de la capa pasiva (Cr₂O₃)', norma_metodo: 'Curvas de polarización, ASTM G61' },
  { id: 'biocompatibilidad', nombre_es: 'Biocompatibilidad', nombre_en: 'Biocompatibilidad',
    definicion: 'Capacidad de un material para su su condición sin fuente una respuesta biológica contradictorios',
    propiedades_asociadas: 'Citotoxicidad, hemocompatibilidad, liberación deiones', norma_metodo: 'ISO 10993 series' },
  { id: 'bioactividad', nombre_es: 'Bioactividad', nombre_en: 'Bioactivity',
    definicion: 'Capacidad de inducir una respuesta biológica específica en la interfase material-tejido (ej. formación de hidroxiapatita)',
    propiedades_asociadas: 'Composición superficial energía, superficial, porosidad', norma_metodo: 'Inmersión en SBF (ISO 23317)' },
  { id: 'estabilidad_dimensional', nombre_es: 'Estabilidad dimensional', nombre_en: 'Dimensional stability',
    definicion: 'Capacidad de mantener las dimensiones bajo cambios ambientales (temperatura, humedad) o tensiones internas',
    propiedades_asociadas: 'α (expansión térmica), absorción de agua, relajación de tensiones, fluencia', norma_metodo: 'ASTM D648 (HDT), variación dimensional tras acondicionamiento' },
  { id: 'resistencia_al_fuego', nombre_es: 'Resistencia al fuego', nombre_en: 'Resistencia al fuego',
    definicion: 'Capacidad de un elemento de manifiesto su portante, integridad y y y insólito por el inmueble',
    propiedades_asociadas: 'Temperatura de fusión, conductividad térmica, calor específico', norma_metodo: 'Curvas normalizadas tiempo-temperatura (ISO 834, ASTM E119)' },
  { id: 'retardancia_a_la_llama', nombre_es: 'Retardancia a la llama', nombre_en: 'Flame retardancy',
    definicion: 'Capacidad intrínseca o impartida para resistir la ignición y propagación de la llama',
    propiedades_asociadas: 'LOI, velocidad de liberación de calor (cono calorimétrico), UL 94', norma_metodo: 'ASTM D2863 (LOI), ISO 5660 (cono), UL 94' },
  { id: 'aislamiento_electrico', nombre_es: 'Aislamiento eléctrico', nombre_en: 'Electrical insulation',
    definicion: 'Aptitud para impedir el paso de corriente eléctrica bajo un campo aplicado',
    propiedades_asociadas: 'Resistividad volumétrica, rigido dieléctrica, resistencia al arco', norma_metodo: 'ASTM D257, ASTM D149' },
  { id: 'conductividad_termica_efectiva_de_un_aislante', nombre_es: 'Conductividad térmica efectiva de un aislante', nombre_en: 'Thermal insulation performance',
    definicion: 'Capacidad global de un sistema para reducir la transferencia de calor',
    propiedades_asociadas: 'Conductividad térmica, R-value, transmitancia U', norma_metodo: 'ASTM C518, ISO 8302' },
  { id: 'amortiguamiento_de_vibraciones', nombre_es: 'Amortiguamiento de vibraciones', nombre_en: 'Vibration damping',
    definicion: 'Capacidad de disipar energía mecánica en vibraciones, reduciendo amplitudes',
    propiedades_asociadas: 'Factor de pérdida (tan δ, η), módulo de pérdida', norma_metodo: 'ASTM E756 (viga en voladizo)' },
  { id: 'resistencia_a_la_fluencia_creep', nombre_es: 'Resistencia a la fluencia (creep)', nombre_en: 'Creep resistance',
    definicion: 'Capacidad de Soportar carga a alta sin temperatura deformación en el tiempo',
    propiedades_asociadas: 'Módulo de fluencia, mínima de frecuencia, tiempo a la Resort', norma_metodo: 'ASTM E139, ISO 204' },
  { id: 'resistencia_a_la_fatiga', nombre_es: 'Resistencia a la fatiga', nombre_en: 'Fatigue resistance',
    definicion: 'Capacidad de soportar cargas cíclicas sin fallar por agrietamiento progresivo',
    propiedades_asociadas: 'Límite de fatiga (S_e), ΔK_th, curva S-N', norma_metodo: 'ASTM E466, ASTM E647' },
  { id: 'transparencia_claridad_optica', nombre_es: 'Transparencia / Claridad óptica', nombre_en: 'Transparency / Clarity',
    definicion: 'Aptitud de un material para transmitir imágenes sin distorsión significativa',
    propiedades_asociadas: 'Transmitancia, turbidez (haze), índice de refracción', norma_metodo: 'ASTM D1003 (transmitancia y haze)' },
  { id: 'fotodegradabilidad', nombre_es: 'Fotodegradabilidad', nombre_en: 'Photodegradability',
    definicion: 'Susceptibilidad a la degradación química inducida por radiación UV/visible',
    propiedades_asociadas: 'Espectro de absorción, energía de enlace, índice de amarillamiento', norma_metodo: 'ASTM G154 (arco de xenón), ISO 4892' },
  { id: 'recubribilidad', nombre_es: 'Recubribilidad', nombre_en: 'Pintabilidad',
    definicion: 'Facilidad con que un sustrato acepta y retiene un recubrimiento orgánico',
    propiedades_asociadas: 'Energía superficial, rugosidad, tensión superficial crítica', norma_metodo: 'Medición de ángulo de contacto, prueba de adhesión (ASTM D3359)' },
  { id: 'pulibilidad', nombre_es: 'Pulibilidad', nombre_en: 'Pulibilidad',
    definicion: 'Capacidad de una superficie para alcanzar un alto brillo especular mediante abrasión fina',
    propiedades_asociadas: 'Dureza, microestructura, ausencia de porosidad', norma_metodo: 'Brillo (ASTM D523), rugosidad tras pulido' },
  { id: 'estabilidad_quimica', nombre_es: 'Estabilidad química', nombre_en: 'Chemical stability',
    definicion: 'Resistencia a la degradación o reacción química no deseada en condiciones de servicio',
    propiedades_asociadas: 'Resistencia a ácidos/álcalis/solventes, hinchamiento, extraíbles', norma_metodo: 'Inmersión (ASTM D543), resistencia química (ISO 175)' },
  { id: 'resistencia_a_la_radiacion', nombre_es: 'Resistencia a la radiación', nombre_en: 'Radiation resistance',
    definicion: 'Capacidad de mantener las propiedades bajo exposición a radiación ionizante o electromagnética',
    propiedades_asociadas: 'Cambios en propiedades mecánicas, oxidación, gases generados', norma_metodo: 'ASTM D4082 (radiación gamma)' },
  { id: 'sellabilidad', nombre_es: 'Sellabilidad', nombre_en: 'Sealability',
    definicion: 'Capacidad de un material o sistema de junta para impedir el paso de fluidos',
    propiedades_asociadas: 'Permeabilidad, resiliencia, deformación remanente por compresión', norma_metodo: 'ASTM F37 (fugas en juntas)' },
  { id: 'fluencia_en_frio_resistencia_al', nombre_es: 'Fluencia en frío (resistencia al)', nombre_en: 'Cold flow resistance',
    definicion: 'Resistencia a la deformación plástica progresiva a temperatura ambiente bajo carga constante (típico en polímeros)',
    propiedades_asociadas: 'Módulo de fluencia a ambiente, deformación remanente', norma_metodo: 'ASTM D2990 (fluencia en polímeros)' },
  { id: 'facilidad_de_desmoldeo', nombre_es: 'Facilidad de desmoldeo', nombre_en: 'Mold release',
    definicion: 'Capacidad de una pieza para separarse limpiamente del molde sin agentes externos',
    propiedades_asociadas: 'Energía superficial, textura superficial, contracción térmica', norma_metodo: 'Medición de fuerza de desmoldeo' },
  { id: 'hidrofobicidad_hidrofilicidad', nombre_es: 'Hidrofobicidad / Hidrofilicidad', nombre_en: 'Hidrofobicidad / Hidrofilia',
    definicion: 'Afinidad de una superficie por el agua, clasificada por el ángulo de contacto',
    propiedades_asociadas: 'Ángulo de contacto, energía superficial', norma_metodo: 'ASTM D7334, clasificación: superhidrófobo (>150°), hidrófobo (>90°), hidrófilo (<90°), superhidrófilo (~0°)' },
  { id: 'oleofobicidad', nombre_es: 'Oleofobicidad', nombre_en: 'Oleofobicidad',
    definicion: 'Repelencia a aceites y liquidaciones tension superficiales',
    propiedades_asociadas: 'Ángulo de contacto con n-hexadecano, energía superficial', norma_metodo: 'ASTM D7490' },
];

export function buscarAtributoPorId(id: string): EntradaAtributo | undefined {
  return ATRIBUTOS.find(a => a.id === id);
}
