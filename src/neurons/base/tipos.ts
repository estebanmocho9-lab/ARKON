// ============================================================
// src/neurons/base/tipos.ts
// Tipos compartidos entre neuronas y motor de inferencia
// ============================================================

export type EstadoMaterial = 'E01' | 'E02' | 'E03'; // E01=comercial inicial, E02=fraguado/seco, E03=degradado

export interface ComponenteBase {
  materialId: string;   // 'M001', 'M010', etc.
  fraccion: number;     // 0..1, suma total de componentes debe ser 1
}

export interface NeuronInput {
  materialId: string;               // ID del material principal o de la mezcla
  estado: EstadoMaterial;           // estado físico a analizar
  valorDirecto?: number | null;     // si es material puro y ya se conoce el índice normalizado 0-100
  componentes?: ComponenteBase[];   // si es una mezcla
  contexto?: Record<string, any>;   // temperatura, humedad, etc.
}

export interface NeuronOutput {
  neuronId: string;
  propertyName: string;
  materialId: string;
  estado: EstadoMaterial;
  valorCompuesto: number;      // 0-100
  valorInverso: number;        // 0-100
  confianza: number;           // 0-1
  anomalias: string[];
  propiedadPendiente: boolean; // true si no había datos
  metadatos: any;
  // ── NUEVOS ──────────────────────────────────────────────────
  // Resultados de evaluar scientific_formulas durante process().
  // Ej: { "IFM_indice_fragilidad": 0.312, "e_indice_vacios": 0.45 }
  indicesIntermedios: Record<string, number>;
  // Tipo del material leído de la tabla 'materiales' (opcional).
  // Ej: "yeso", "cemento", "perlita". Undefined si no está en la tabla.
  materialTipo?: string;
}

// Para el motor de inferencia
export interface CruceCientifico {
  nombreCruce: string;
  propiedadesRequeridas: string[];
  formula: string;
  peso: number;
}

export interface ProblemaConfig {
  nombre: string;
  crucesActivos: { nombreCruce: string; peso: number }[];
  formulaGlobal?: string;
}