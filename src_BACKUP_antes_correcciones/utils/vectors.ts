// ============================================
// IMPULSO IA — OPERACIONES CON VECTORES
// ============================================

import { Material } from '../types';
import { similitudCoseno, distanciaEuclidiana } from './math';

export function crearVectorMaterial(
  propiedades: Record<string, number>,
  orden: string[]
): number[] {
  return orden.map((prop) => propiedades[prop] ?? 0);
}

export function compararMateriales(
  materialA: Material,
  materialB: Material
): {
  similitud_coseno: number;
  distancia_euclidiana: number;
  compatibles: boolean;
} {
  if (materialA.vector.length !== materialB.vector.length) {
    return { similitud_coseno: 0, distancia_euclidiana: Infinity, compatibles: false };
  }

  const similitud = similitudCoseno(materialA.vector, materialB.vector);
  const distancia = distanciaEuclidiana(materialA.vector, materialB.vector);

  return {
    similitud_coseno: similitud,
    distancia_euclidiana: distancia,
    compatibles: similitud > 0.7,
  };
}

export function encontrarMaterialMasSimilar(
  materialObjetivo: Material,
  materiales: Material[]
): Material | null {
  if (materiales.length === 0) return null;

  let mejorMaterial = materiales[0];
  let mejorSimilitud = similitudCoseno(materialObjetivo.vector, materiales[0].vector);

  materiales.slice(1).forEach((material) => {
    const similitud = similitudCoseno(materialObjetivo.vector, material.vector);
    if (similitud > mejorSimilitud) {
      mejorSimilitud = similitud;
      mejorMaterial = material;
    }
  });

  return mejorMaterial;
}