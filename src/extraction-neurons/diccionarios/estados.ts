// ============================================================
// src/extraction-neurons/diccionarios/estados.ts
// Estado físico o de curado del material en el momento en que se
// midió la propiedad. No es lo mismo la resistencia de un cemento
// "fresco" que "fraguado a 28 días", ni un material "en polvo" que
// el mismo material "húmedo" o "saturado".
// ============================================================

export interface EntradaEstado {
  id: string;
  nombre_es: string;
  nombre_en: string;
  sinonimos: string[];
  categoria: 'fisico' | 'curado' | 'humedad';
}

export const ESTADOS: EntradaEstado[] = [
  // ── estado físico ──
  { id: 'en_polvo', nombre_es: 'En polvo', nombre_en: 'Powder', sinonimos: ['polvo', 'pulverulento'], categoria: 'fisico' },
  { id: 'granular', nombre_es: 'Granular', nombre_en: 'Granular', sinonimos: ['en gránulos'], categoria: 'fisico' },
  { id: 'liquido', nombre_es: 'Líquido', nombre_en: 'Liquid', sinonimos: [], categoria: 'fisico' },
  { id: 'pastoso', nombre_es: 'Pastoso', nombre_en: 'Paste', sinonimos: ['en pasta', 'pasta fresca'], categoria: 'fisico' },
  { id: 'gel', nombre_es: 'Gel', nombre_en: 'Gel', sinonimos: [], categoria: 'fisico' },
  { id: 'suspension', nombre_es: 'Suspensión', nombre_en: 'Suspension', sinonimos: ['disperso', 'dispersión'], categoria: 'fisico' },
  { id: 'solido', nombre_es: 'Sólido', nombre_en: 'Solid', sinonimos: [], categoria: 'fisico' },

  // ── estado de curado/proceso (especialmente materiales cementicios) ──
  { id: 'fresco', nombre_es: 'Fresco', nombre_en: 'Fresh', sinonimos: ['recién mezclado', 'estado fresco'], categoria: 'curado' },
  { id: 'fraguado', nombre_es: 'Fraguado', nombre_en: 'Set', sinonimos: ['fraguado inicial', 'fraguado final'], categoria: 'curado' },
  { id: 'curado', nombre_es: 'Curado', nombre_en: 'Cured', sinonimos: ['curado a 7 días', 'curado a 28 días', 'poscurado'], categoria: 'curado' },
  { id: 'endurecido', nombre_es: 'Endurecido', nombre_en: 'Hardened', sinonimos: ['estado endurecido'], categoria: 'curado' },
  { id: 'plastico_estado', nombre_es: 'Estado plástico', nombre_en: 'Plastic state', sinonimos: ['en estado plástico'], categoria: 'curado' },
  { id: 'verde', nombre_es: 'Verde (cerámica sin cocer)', nombre_en: 'Green (unfired)', sinonimos: ['pieza verde', 'green body'], categoria: 'curado' },
  { id: 'sinterizado', nombre_es: 'Sinterizado', nombre_en: 'Sintered', sinonimos: [], categoria: 'curado' },
  { id: 'calcinado', nombre_es: 'Calcinado', nombre_en: 'Calcined', sinonimos: [], categoria: 'curado' },
  { id: 'recocido', nombre_es: 'Recocido', nombre_en: 'Annealed', sinonimos: ['tratamiento térmico de recocido'], categoria: 'curado' },
  { id: 'templado', nombre_es: 'Templado', nombre_en: 'Quenched / Tempered', sinonimos: [], categoria: 'curado' },

  // ── humedad ──
  { id: 'seco', nombre_es: 'Seco', nombre_en: 'Dry', sinonimos: ['secado', 'condición seca', 'seco al horno'], categoria: 'humedad' },
  { id: 'humedo', nombre_es: 'Húmedo', nombre_en: 'Wet / Moist', sinonimos: ['humedad ambiente'], categoria: 'humedad' },
  { id: 'saturado', nombre_es: 'Saturado', nombre_en: 'Saturated', sinonimos: ['saturado de agua', 'water-saturated'], categoria: 'humedad' },
  { id: 'sumergido', nombre_es: 'Sumergido', nombre_en: 'Submerged / Immersed', sinonimos: ['inmerso', 'inmersión'], categoria: 'humedad' },
  { id: 'absorcion_agua', nombre_es: 'Absorción de agua', nombre_en: 'Water absorption', sinonimos: ['absorbe agua', 'capacidad de absorción', 'water uptake'], categoria: 'humedad' },
  { id: 'higroscopico', nombre_es: 'Higroscópico', nombre_en: 'Hygroscopic', sinonimos: ['higroscopicidad', 'hygroscopicity'], categoria: 'humedad' },

  // ── material seco que, al absorber agua o secarse, ejerce fuerza ──
  { id: 'expansivo', nombre_es: 'Expansivo / Hinchamiento', nombre_en: 'Swelling / Expansive', sinonimos: ['expansión', 'hinchamiento', 'presión de hinchamiento', 'swelling pressure', 'expansión libre'], categoria: 'fisico' },
  { id: 'contractivo', nombre_es: 'Contracción / Retracción', nombre_en: 'Shrinkage', sinonimos: ['retracción', 'contracción por secado', 'drying shrinkage'], categoria: 'fisico' },
];

export function buscarEstadoPorId(id: string): EntradaEstado | undefined {
  return ESTADOS.find(e => e.id === id);
}
