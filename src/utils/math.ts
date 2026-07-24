// ============================================
// IMPULSO IA — UTILIDADES MATEMÁTICAS
// ============================================

export function normalizar(valor: number, min: number, max: number): number {
  if (max === min) return 0;
  return ((valor - min) / (max - min)) * 100;
}

export function desnormalizar(valorNorm: number, min: number, max: number): number {
  return (valorNorm / 100) * (max - min) + min;
}

export function promedioSimple(valores: number[]): number {
  if (valores.length === 0) return 0;
  return valores.reduce((a, b) => a + b, 0) / valores.length;
}

export function promediosPonderado(valores: number[], pesos: number[]): number {
  if (valores.length === 0) return 0;
  const sumaPesos = pesos.reduce((a, b) => a + b, 0);
  if (sumaPesos === 0) return 0;
  const sumaProductos = valores.reduce((acc, val, i) => acc + val * (pesos[i] || 0), 0);
  return sumaProductos / sumaPesos;
}

export function similitudCoseno(vectorA: number[], vectorB: number[]): number {
  if (vectorA.length !== vectorB.length) return 0;
  const dotProduct = vectorA.reduce((acc, val, i) => acc + val * vectorB[i], 0);
  const magnitudA = Math.sqrt(vectorA.reduce((acc, val) => acc + val * val, 0));
  const magnitudB = Math.sqrt(vectorB.reduce((acc, val) => acc + val * val, 0));
  if (magnitudA === 0 || magnitudB === 0) return 0;
  return dotProduct / (magnitudA * magnitudB);
}

export function distanciaEuclidiana(vectorA: number[], vectorB: number[]): number {
  if (vectorA.length !== vectorB.length) return Infinity;
  return Math.sqrt(
    vectorA.reduce((acc, val, i) => acc + Math.pow(val - vectorB[i], 2), 0)
  );
}

export function clamp(valor: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, valor));
}

export function redondear(valor: number, decimales: number = 2): number {
  return Math.round(valor * Math.pow(10, decimales)) / Math.pow(10, decimales);
}
