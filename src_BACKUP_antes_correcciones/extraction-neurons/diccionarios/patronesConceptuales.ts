// ============================================================
// src/extraction-neurons/diccionarios/patronesConceptuales.ts
// Patrones de texto narrativo (no numerico) para detectar
// conocimiento conceptual de un material: identidad, origen,
// composicion, proposito, compatibilidad cuantificada.
// Mismo enfoque que el resto del sistema: regex + diccionario,
// nada de IA.
// ============================================================

export interface PatronConceptual {
  tipo: 'identidad' | 'origen' | 'composicion' | 'proposito' | 'compatibilidad';
  regex: RegExp;
}

export const PATRONES_CONCEPTUALES: PatronConceptual[] = [
  // -- Identidad: "es un/una...", "se define como..." --
  { tipo: 'identidad', regex: /\bes\s+(?:un|una|el|la)\s+[^.;\n]{5,120}/i },
  { tipo: 'identidad', regex: /\bse\s+define\s+como\s+[^.;\n]{5,120}/i },

  // -- Origen: "se obtiene de...", "proviene de...", "se forma por..." --
  { tipo: 'origen', regex: /\bse\s+obtiene\s+(?:de|a partir de)\s+[^.;\n]{5,120}/i },
  { tipo: 'origen', regex: /\bproviene\s+de\s+[^.;\n]{5,120}/i },
  { tipo: 'origen', regex: /\bse\s+forma\s+(?:por|a partir de|mediante)\s+[^.;\n]{5,120}/i },

  // -- Composicion: "se compone de...", "contiene...", "esta formado por..." --
  { tipo: 'composicion', regex: /\bse\s+compone\s+de\s+[^.;\n]{5,120}/i },
  { tipo: 'composicion', regex: /\bcontiene\s+[^.;\n]{5,120}/i },
  { tipo: 'composicion', regex: /\bestá\s+formado\s+por\s+[^.;\n]{5,120}/i },
  { tipo: 'composicion', regex: /\besta\s+formado\s+por\s+[^.;\n]{5,120}/i },

  // -- Proposito: "se utiliza para...", "su aplicacion principal es..." --
  { tipo: 'proposito', regex: /\bse\s+utiliza\s+para\s+[^.;\n]{5,120}/i },
  { tipo: 'proposito', regex: /\bse\s+usa\s+(?:para|en)\s+[^.;\n]{5,120}/i },
  { tipo: 'proposito', regex: /\bsu\s+aplicaci[oó]n\s+principal\s+es\s+[^.;\n]{5,120}/i },

  // -- Compatibilidad cuantificada: "compatible con... hasta un X%..." --
  { tipo: 'compatibilidad', regex: /\bcompatible\s+con\s+[^.;\n]{2,60}?hasta\s+(?:un\s+)?(\d{1,3}(?:[.,]\d+)?)\s*%[^.;\n]{0,100}/i },
  { tipo: 'compatibilidad', regex: /\bpor\s+encima\s+de\s+(\d{1,3}(?:[.,]\d+)?)\s*%[^.;\n]{5,120}/i },
  { tipo: 'compatibilidad', regex: /\bincompatible\s+con\s+[^.;\n]{5,120}/i },
];
