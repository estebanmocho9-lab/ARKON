// ============================================
// IMPULSO IA — RELACIONES: FRAGILIDAD
// ============================================

import { Neurona } from '../../types';

export interface RelacionFragilidad {
  neurona_origen: string;
  neurona_destino: string;
  tipo_relacion: 'amplifica' | 'reduce' | 'activa' | 'contradice';
  peso: number;
  descripcion: string;
}

export const RELACIONES_FRAGILIDAD: RelacionFragilidad[] = [
  {
    neurona_origen: 'fragilidad',
    neurona_destino: 'microfisuracion',
    tipo_relacion: 'amplifica',
    peso: 0.9,
    descripcion: 'Alta fragilidad incrementa riesgo de microfisuras bajo carga',
  },
  {
    neurona_origen: 'fragilidad',
    neurona_destino: 'cohesion',
    tipo_relacion: 'contradice',
    peso: 0.85,
    descripcion: 'Fragilidad alta implica baja cohesión entre partículas',
  },
  {
    neurona_origen: 'fragilidad',
    neurona_destino: 'resistencia_mecanica',
    tipo_relacion: 'reduce',
    peso: 0.8,
    descripcion: 'Mayor fragilidad reduce resistencia mecánica global',
  },
  {
    neurona_origen: 'elasticidad',
    neurona_destino: 'fragilidad',
    tipo_relacion: 'reduce',
    peso: 0.75,
    descripcion: 'Mayor elasticidad reduce tendencia a la fractura frágil',
  },
  {
    neurona_origen: 'porosidad',
    neurona_destino: 'fragilidad',
    tipo_relacion: 'amplifica',
    peso: 0.7,
    descripcion: 'Alta porosidad incrementa fragilidad estructural',
  },
];

export function analizarCadenaFragilidad(
  neuronas: Neurona[],
  valorFragilidad: number
): string[] {
  const cadena: string[] = [];

  if (valorFragilidad > 50) {
    cadena.push(`⚠️ Fragilidad elevada (${valorFragilidad}/100) — analizando cadena de efectos`);

    RELACIONES_FRAGILIDAD
      .filter((r) => r.tipo_relacion === 'amplifica' || r.tipo_relacion === 'reduce')
      .forEach((rel) => {
        cadena.push(`  → ${rel.descripcion} (peso: ${rel.peso})`);
      });
  }

  return cadena;
}
