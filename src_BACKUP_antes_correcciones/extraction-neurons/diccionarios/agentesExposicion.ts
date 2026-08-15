// ============================================================
// src/extraction-neurons/diccionarios/agentesExposicion.ts
// Agentes o condiciones a los que se expone un material en un
// ensayo: qué le pasa a una placa de cemento Portland cuando
// entra en contacto con humedad, agua, cloruros, corrosión,
// pinturas, etc. Sin esto, un dato de "resistencia a compresión"
// no dice si fue medido antes o después de ese contacto.
// ============================================================

export interface EntradaAgente {
  id: string;
  nombre_es: string;
  nombre_en: string;
  sinonimos: string[];
  tipo: 'quimico' | 'ambiental' | 'mecanico' | 'recubrimiento' | 'biologico';
}

export const AGENTES_EXPOSICION: EntradaAgente[] = [
  // ── agua / humedad (con la distinción líquido vs vapor, clave
  //    para productos como placas antihumedad) ──
  { id: 'humedad_ambiente', nombre_es: 'Humedad ambiente', nombre_en: 'Ambient humidity', sinonimos: ['humedad relativa', 'vapor de agua', 'humedad del aire'], tipo: 'ambiental' },
  { id: 'agua_liquida', nombre_es: 'Agua líquida (contacto directo)', nombre_en: 'Direct liquid water contact', sinonimos: ['contacto con agua', 'inmersión en agua', 'goteo', 'salpicadura'], tipo: 'quimico' },
  { id: 'agua_de_mar', nombre_es: 'Agua de mar', nombre_en: 'Seawater', sinonimos: ['ambiente marino', 'niebla salina'], tipo: 'quimico' },
  { id: 'condensacion', nombre_es: 'Condensación', nombre_en: 'Condensation', sinonimos: [], tipo: 'ambiental' },
  { id: 'capilaridad', nombre_es: 'Ascenso capilar', nombre_en: 'Capillary rise', sinonimos: ['humedad de capilaridad', 'humedad ascendente'], tipo: 'quimico' },
  { id: 'contacto_con_suelo', nombre_es: 'Contacto con el suelo/tierra', nombre_en: 'Ground/soil contact', sinonimos: ['enterrado', 'bajo nivel de suelo'], tipo: 'ambiental' },

  // ── químicos ──
  { id: 'cloruros', nombre_es: 'Cloruros', nombre_en: 'Chlorides', sinonimos: ['ataque por cloruros', 'penetración de cloruros'], tipo: 'quimico' },
  { id: 'sulfatos', nombre_es: 'Sulfatos', nombre_en: 'Sulfates', sinonimos: ['ataque por sulfatos'], tipo: 'quimico' },
  { id: 'carbonatacion', nombre_es: 'Carbonatación', nombre_en: 'Carbonation', sinonimos: ['CO2', 'dióxido de carbono'], tipo: 'quimico' },
  { id: 'acidos', nombre_es: 'Ácidos', nombre_en: 'Acids', sinonimos: ['ataque ácido', 'medio ácido', 'lluvia ácida'], tipo: 'quimico' },
  { id: 'alcalis', nombre_es: 'Álcalis', nombre_en: 'Alkalis', sinonimos: ['medio alcalino', 'reacción álcali-sílice'], tipo: 'quimico' },
  { id: 'sales_deshielo', nombre_es: 'Sales de deshielo / sales en general', nombre_en: 'De-icing / general salts', sinonimos: ['salinidad', 'contacto con sales'], tipo: 'quimico' },
  { id: 'corrosion', nombre_es: 'Corrosión', nombre_en: 'Corrosion', sinonimos: ['ambiente corrosivo', 'ataque corrosivo'], tipo: 'quimico' },
  { id: 'oxidacion', nombre_es: 'Oxidación', nombre_en: 'Oxidation', sinonimos: [], tipo: 'quimico' },
  { id: 'aceites_hidrocarburos', nombre_es: 'Aceites / Hidrocarburos', nombre_en: 'Oils / Hydrocarbons', sinonimos: ['grasas', 'combustibles', 'derivados del petróleo'], tipo: 'quimico' },
  { id: 'solventes', nombre_es: 'Solventes / Disolventes', nombre_en: 'Solvents', sinonimos: ['disolventes orgánicos'], tipo: 'quimico' },
  { id: 'detergentes_limpieza', nombre_es: 'Detergentes / Productos de limpieza', nombre_en: 'Detergents / Cleaning agents', sinonimos: [], tipo: 'quimico' },
  { id: 'gases_contaminantes', nombre_es: 'Gases contaminantes / Polución atmosférica', nombre_en: 'Air pollutants', sinonimos: ['contaminación industrial', 'SO2', 'NOx'], tipo: 'quimico' },

  // ── ambientales/físicos (sin asumir clima costero) ──
  { id: 'rayos_uv', nombre_es: 'Radiación UV / Exposición solar', nombre_en: 'UV radiation / Sun exposure', sinonimos: ['rayos ultravioleta', 'intemperie'], tipo: 'ambiental' },
  { id: 'ciclos_hielo_deshielo', nombre_es: 'Ciclos de hielo-deshielo', nombre_en: 'Freeze-thaw cycles', sinonimos: [], tipo: 'ambiental' },
  { id: 'altas_temperaturas', nombre_es: 'Altas temperaturas', nombre_en: 'High temperature exposure', sinonimos: ['exposición térmica', 'calor extremo'], tipo: 'ambiental' },
  { id: 'bajas_temperaturas', nombre_es: 'Bajas temperaturas', nombre_en: 'Low temperature exposure', sinonimos: ['frío extremo', 'congelamiento'], tipo: 'ambiental' },
  { id: 'fuego', nombre_es: 'Fuego', nombre_en: 'Fire exposure', sinonimos: ['ensayo de fuego', 'resistencia al fuego'], tipo: 'ambiental' },
  { id: 'ciclos_termicos', nombre_es: 'Ciclos térmicos', nombre_en: 'Thermal cycling', sinonimos: [], tipo: 'ambiental' },
  { id: 'viento_arena', nombre_es: 'Viento / Arena / Polvo', nombre_en: 'Wind / Sand / Dust', sinonimos: ['erosión eólica', 'abrasión por arena', 'ambiente polvoriento'], tipo: 'ambiental' },
  { id: 'vacio_presion', nombre_es: 'Vacío / Presión (hidrostática o de aire)', nombre_en: 'Vacuum / Pressure (hydrostatic or air)', sinonimos: ['presión hidrostática', 'depresión'], tipo: 'ambiental' },
  { id: 'radiacion_ionizante', nombre_es: 'Radiación ionizante', nombre_en: 'Ionizing radiation', sinonimos: ['radiación gamma', 'radiación nuclear'], tipo: 'ambiental' },

  // ── mecánicos ──
  { id: 'abrasion', nombre_es: 'Abrasión', nombre_en: 'Abrasion', sinonimos: ['desgaste por fricción'], tipo: 'mecanico' },
  { id: 'impacto', nombre_es: 'Impacto', nombre_en: 'Impact', sinonimos: ['carga de impacto'], tipo: 'mecanico' },
  { id: 'carga_ciclica', nombre_es: 'Carga cíclica / Fatiga', nombre_en: 'Cyclic loading / Fatigue', sinonimos: [], tipo: 'mecanico' },
  { id: 'vibracion', nombre_es: 'Vibración', nombre_en: 'Vibration', sinonimos: [], tipo: 'mecanico' },

  // ── recubrimientos/tratamientos ──
  { id: 'pintura', nombre_es: 'Pintura', nombre_en: 'Paint / Coating', sinonimos: ['recubrimiento', 'pintado'], tipo: 'recubrimiento' },
  { id: 'sellador', nombre_es: 'Sellador / Impermeabilizante', nombre_en: 'Sealer / Sealant', sinonimos: ['sellado'], tipo: 'recubrimiento' },
  { id: 'galvanizado', nombre_es: 'Galvanizado', nombre_en: 'Galvanized coating', sinonimos: [], tipo: 'recubrimiento' },

  // ── biológicos ──
  { id: 'hongos_moho', nombre_es: 'Hongos / Moho', nombre_en: 'Fungi / Mold', sinonimos: ['ataque biológico', 'biodeterioro'], tipo: 'biologico' },
  { id: 'insectos_xilofagos', nombre_es: 'Insectos xilófagos (termitas, etc.)', nombre_en: 'Wood-boring insects (termites, etc.)', sinonimos: ['termitas', 'polilla de la madera'], tipo: 'biologico' },
  { id: 'roedores', nombre_es: 'Roedores', nombre_en: 'Rodents', sinonimos: [], tipo: 'biologico' },
];

export function buscarAgentePorId(id: string): EntradaAgente | undefined {
  return AGENTES_EXPOSICION.find(a => a.id === id);
}
