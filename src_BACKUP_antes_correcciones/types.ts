// ============================================
// IMPULSO IA — TIPOS CENTRALES DEL SISTEMA
// ============================================

import { v4 as uuidv4 } from 'uuid';

// --------------------------------------------
// ESTADOS FUNCIONALES
// --------------------------------------------

export type EstadoFuncional =
  | 'Base'
  | 'Procesado'
  | 'Integrado'
  | 'Operacion'
  | 'Degradado';

// --------------------------------------------
// TIPO DE NEURONA
// --------------------------------------------

export type TipoNeurona = 'directa' | 'inversa';

// --------------------------------------------
// GRUPOS FÍSICOS
// --------------------------------------------

export type GrupoFisico =
  | 'mecanico'
  | 'termico'
  | 'hidrico'
  | 'quimico'
  | 'superficial'
  | 'estructural'
  | 'acustico'
  | 'electrico';

// --------------------------------------------
// MEMORIA DE UNA NEURONA
// --------------------------------------------

export interface MemoriaNeuronal {
  id: string;
  neurona_id: string;
  producto: string;
  propiedad: string;
  contexto: string;
  activaciones: number;
  coherencia: number;
  relaciones_detectadas: string[];
  soluciones_aplicadas: string[];
  resultados_obtenidos: string[];
  mejoras_logradas: string[];
  contradicciones: string[];
  patrones_repetidos: string[];
  fecha: string;
}

// --------------------------------------------
// EXPERIENCIA ACUMULADA
// --------------------------------------------

export interface Experiencia {
  id: string;
  descripcion: string;
  propiedad: string;
  material: string;
  resultado: string;
  confirmaciones: number;
  fecha: string;
}

// --------------------------------------------
// INFERENCIA GENERADA
// --------------------------------------------

export interface Inferencia {
  id: string;
  descripcion: string;
  confianza: number;
  propiedades_involucradas: string[];
  consecuencias: string[];
  oportunidades: string[];
  fecha: string;
}

// --------------------------------------------
// NEURONA — ESTRUCTURA COMPLETA
// --------------------------------------------

export interface Neurona {
  id: string;
  nombre: string;
  tipo: TipoNeurona;
  grupo_fisico: GrupoFisico;
  estado: EstadoFuncional;
  valor_activacion: number;        // 0 a 100
  coherencia: number;              // 0 a 1
  confianza: number;               // 0 a 1
  relaciones: string[];            // IDs de neuronas relacionadas
  memoria: MemoriaNeuronal[];
  historial: string[];
  experiencias: Experiencia[];
  inferencias: Inferencia[];
  compatibilidades: string[];      // IDs de materiales compatibles
  contradicciones: string[];       // IDs de propiedades contradictorias
  conexiones_neuronales: string[]; // IDs de neuronas conectadas
}

// --------------------------------------------
// MATERIAL
// --------------------------------------------

export interface Material {
  id: string;
  nombre: string;
  propiedades: Record<string, number>; // propiedad → valor normalizado 0-100
  estado: EstadoFuncional;
  vector: number[];
}

// --------------------------------------------
// RESULTADO DE ACTIVACIÓN
// --------------------------------------------

export interface ResultadoActivacion {
  neurona_id: string;
  valor: number;
  coherencia: number;
  consecuencias: string[];
  oportunidades: string[];
  neuronas_activadas: string[];
  inferencias: Inferencia[];
}

// --------------------------------------------
// RESULTADO DE ANÁLISIS
// --------------------------------------------

export interface ResultadoAnalisis {
  id: string;
  producto: string;
  problema_detectado: string;
  causas_fisicas: string[];
  soluciones_propuestas: string[];
  compatibilidades: string[];
  mejoras: string[];
  confianza_general: number;
  fecha: string;
}

// --------------------------------------------
// CONTEXTO DE PRODUCTO
// --------------------------------------------

export interface ContextoProducto {
  nombre: string;
  tipo: string;
  propiedades_actuales: Record<string, number>;
  problemas_conocidos: string[];
  objetivo: string;
}

// --------------------------------------------
// HELPER — CREAR ID ÚNICO
// --------------------------------------------

export function crearId(): string {
  return uuidv4();
}