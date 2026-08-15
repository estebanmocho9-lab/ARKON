// ============================================================
// src/extraction-neurons/diccionarios/normas.ts
// Patrones de normas técnicas. No es una lista cerrada (hay
// miles de normas distintas) — son expresiones regulares que
// reconocen el FORMATO típico de cada organismo.
// ============================================================

export const PATRONES_NORMAS: RegExp[] = [
  /ASTM\s?[A-Z]?\d{2,4}(-\d{2,4})?/gi,
  /ISO\s?\d{3,5}(-\d{1,2})?/gi,
  /EN\s?\d{3,5}(-\d{1,2})?/gi,
  /IRAM\s?\d{3,5}/gi,
  /UNE-?EN\s?\d{3,5}/gi,
  /DIN\s?\d{3,5}/gi,
];

// Busca la primera norma que aparezca en un texto dado
export function buscarNorma(texto: string): string | null {
  for (const patron of PATRONES_NORMAS) {
    patron.lastIndex = 0;
    const match = patron.exec(texto);
    if (match) return match[0];
  }
  return null;
}
