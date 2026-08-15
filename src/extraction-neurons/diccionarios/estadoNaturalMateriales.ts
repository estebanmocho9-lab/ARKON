// ============================================================
// src/extraction-neurons/diccionarios/estadoNaturalMateriales.ts
// Estado físico NATURAL/inherente de cada material — es decir,
// cómo se presenta el material en sí (más allá de lo que diga el
// texto en ese párrafo puntual). Esto es distinto de ESTADOS
// (estados.ts), que detecta menciones puntuales en el texto
// ("fraguado", "húmedo", etc.) — acá clasificamos el material.
//
// Semilla inicial a partir de la lista que pasaste. Para agregar
// materiales nuevos, solo hay que sumar una línea acá.
// ============================================================

export type EstadoNatural = 'polvo' | 'liquido' | 'granular' | 'solido' | 'pastoso' | 'fibroso';

export interface EntradaEstadoNatural {
  material: string;
  estado_natural: EstadoNatural;
}

export const ESTADO_NATURAL_MATERIALES: EntradaEstadoNatural[] = [
  { material: 'Talco Industrial', estado_natural: 'polvo' },
  { material: 'Cemento Portland', estado_natural: 'polvo' },
  { material: 'Arcilla Expandida', estado_natural: 'granular' },
  { material: 'Cal Hidráulica', estado_natural: 'polvo' },
  { material: 'Perlita Expandida', estado_natural: 'granular' },
  { material: 'Bentonita Sódica', estado_natural: 'polvo' },
  { material: 'Vermiculita expandida', estado_natural: 'granular' },
  { material: 'Humo de Sílice', estado_natural: 'polvo' },
  { material: 'Vidrio Molido', estado_natural: 'polvo' },
  { material: 'Yeso Molido', estado_natural: 'polvo' },
  { material: 'Resina Epoxi', estado_natural: 'liquido' },
  { material: 'Resina Poliéster', estado_natural: 'liquido' },
  { material: 'Tiza Molida', estado_natural: 'polvo' },
  { material: 'Fibra de Vidrio', estado_natural: 'fibroso' },
  { material: 'Cartón Triturado', estado_natural: 'fibroso' },
  { material: 'Queratina', estado_natural: 'liquido' },
  { material: 'Piedra Pómez', estado_natural: 'granular' },
  { material: 'Bagazo de Caña', estado_natural: 'fibroso' },
  { material: 'Carbón Activado', estado_natural: 'granular' },
  { material: 'Ocre Rojo', estado_natural: 'polvo' },
  { material: 'Ocre Amarillo', estado_natural: 'polvo' },
];

export function buscarEstadoNaturalPorMaterial(nombreMaterial: string): EstadoNatural | null {
  const encontrado = ESTADO_NATURAL_MATERIALES.find(
    (e) => e.material.toLowerCase() === nombreMaterial.toLowerCase()
  );
  return encontrado ? encontrado.estado_natural : null;
}
