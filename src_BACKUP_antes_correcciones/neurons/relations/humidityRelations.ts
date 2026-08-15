
// ============================================
// IMPULSO IA — RELACIONES: HUMEDAD
// ============================================

import { Neurona } from '../../types';

export interface RelacionHumedad {
  neurona_origen: string;
  neurona_destino: string;
  tipo_relacion: 'amplifica' | 'reduce' | 'activa' | 'contradice';
  peso: number;
  descripcion: string;
}

export const RELACIONES_HUMEDAD: RelacionHumedad[] = [
  {
    neurona_origen: 'humedad',
    neurona_destino: 'absorcion',
    tipo_relacion: 'amplifica',
    peso: 0.9,
    descripcion: 'Alta humedad ambiental incrementa absorción del material',
  },
  {
    neurona_origen: 'humedad',
    neurona_destino: 'microfisuracion',
    tipo_relacion: 'activa',
    peso: 0.8,
    descripcion: 'Ciclos de humedad/secado generan microfisuras por expansión',
  },
  {
    neurona_origen: 'humedad',
    neurona_destino: 'cohesion',
    tipo_relacion: 'reduce',
    peso: 0.7,
    descripcion: 'Humedad sostenida debilita enlaces entre partículas',
  },
  {
    neurona_origen: 'humedad',
    neurona_destino: 'corrosion',
    tipo_relacion: 'amplifica',
    peso: 0.85,
    descripcion: 'Humedad acelera procesos de corrosión química',
  },
  {
    neurona_origen: 'hidrofobicidad',
    neurona_destino: 'humedad',
    tipo_relacion: 'reduce',
    peso: 0.9,
    descripcion: 'Alta hidrofobicidad reduce impacto de humedad ambiental',
  },
];

export function analizarImpactoHumedad(
  neuronas: Neurona[],
  valorHumedad: number
): string[] {
  const impactos: string[] = [];

  if (valorHumedad > 60) {
    impactos.push(`⚠️ Humedad crítica (${valorHumedad}/100) — activando cadena de consecuencias`);

    RELACIONES_HUMEDAD
      .filter((r) => r.tipo_relacion === 'amplifica' || r.tipo_relacion === 'activa')
      .forEach((rel) => {
        const neuronaDestino = neuronas.find((n) => n.nombre === rel.neurona_destino);
        if (neuronaDestino) {
          impactos.push(
            `  → ${rel.descripcion} (peso: ${rel.peso})`
          );
        }
      });
  }

  return impactos;
}