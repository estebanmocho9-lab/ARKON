// ============================================
// IMPULSO IA — MOTOR DE INFERENCIA
// ============================================

import { v4 as uuidv4 } from 'uuid';
import { Neurona, Inferencia, ContextoProducto, ResultadoAnalisis } from '../types';
import { supabase } from '../supabase/client';

// --------------------------------------------
// REGLAS DE INFERENCIA FÍSICA
// Si propiedad X tiene valor Y entonces consecuencia Z
// --------------------------------------------

interface ReglaInferencia {
  propiedad: string;
  condicion: (valor: number) => boolean;
  consecuencia: string;
  oportunidad: string;
  confianza: number;
}

const REGLAS: ReglaInferencia[] = [
  {
    propiedad: 'porosidad',
    condicion: (v) => v > 70,
    consecuencia: 'Alta porosidad reduce resistencia mecánica y aumenta absorción de agua',
    oportunidad: 'Puede usarse para aislación térmica y acústica',
    confianza: 0.9,
  },
  {
    propiedad: 'porosidad',
    condicion: (v) => v < 20,
    consecuencia: 'Baja porosidad aumenta densidad y resistencia mecánica',
    oportunidad: 'Ideal para aplicaciones estructurales de alta carga',
    confianza: 0.85,
  },
  {
    propiedad: 'absorcion',
    condicion: (v) => v > 60,
    consecuencia: 'Alta absorción puede causar degradación por humedad en el tiempo',
    oportunidad: 'Útil para materiales filtrantes o absorbentes',
    confianza: 0.88,
  },
  {
    propiedad: 'cohesion',
    condicion: (v) => v < 30,
    consecuencia: 'Baja cohesión genera fragilidad y riesgo de desintegración',
    oportunidad: 'Revisar formulación — agregar aglutinantes o fibras',
    confianza: 0.92,
  },
  {
    propiedad: 'elasticidad',
    condicion: (v) => v > 70,
    consecuencia: 'Alta elasticidad mejora resistencia a impactos y vibraciones',
    oportunidad: 'Aplicable en productos que requieren flexibilidad',
    confianza: 0.87,
  },
  {
    propiedad: 'rigidez',
    condicion: (v) => v > 80,
    consecuencia: 'Alta rigidez puede generar microfisuras bajo cargas dinámicas',
    oportunidad: 'Ideal para estructuras estáticas de alta precisión dimensional',
    confianza: 0.83,
  },
  {
    propiedad: 'humedad',
    condicion: (v) => v > 60,
    consecuencia: 'Alta humedad acelera corrosión y degradación química',
    oportunidad: 'Considerar tratamientos hidrofóbicos o barreras de vapor',
    confianza: 0.91,
  },
  {
    propiedad: 'densidad',
    condicion: (v) => v < 25,
    consecuencia: 'Baja densidad reduce peso pero puede comprometer resistencia',
    oportunidad: 'Excelente para aplicaciones donde el peso es crítico',
    confianza: 0.86,
  },
  {
    propiedad: 'conductividad_termica',
    condicion: (v) => v < 20,
    consecuencia: 'Baja conductividad térmica actúa como buen aislante',
    oportunidad: 'Ideal para paneles térmicos, techos y muros aislantes',
    confianza: 0.93,
  },
  {
    propiedad: 'microfisuracion',
    condicion: (v) => v > 50,
    consecuencia: 'Microfisuras altas comprometen integridad estructural a largo plazo',
    oportunidad: 'Revisar relación agua/material y proceso de curado',
    confianza: 0.94,
  },
];

// --------------------------------------------
// INFERIR DESDE UNA NEURONA
// --------------------------------------------

export function inferirDesdeNeurona(neurona: Neurona): Inferencia[] {
  const inferencias: Inferencia[] = [];
  const nombreNormalizado = neurona.nombre.toLowerCase().replace(/ /g, '_');

  const reglasAplicables = REGLAS.filter(
    (regla) =>
      regla.propiedad === nombreNormalizado &&
      regla.condicion(neurona.valor_activacion)
  );

  reglasAplicables.forEach((regla) => {
    const inferencia: Inferencia = {
      id: uuidv4(),
      descripcion: regla.consecuencia,
      confianza: regla.confianza,
      propiedades_involucradas: [neurona.nombre],
      consecuencias: [regla.consecuencia],
      oportunidades: [regla.oportunidad],
      fecha: new Date().toISOString(),
    };

    inferencias.push(inferencia);
    neurona.inferencias.push(inferencia);
  });

  return inferencias;
}

// --------------------------------------------
// INFERIR DESDE TODA LA RED
// --------------------------------------------

export function inferirDesdeRed(neuronas: Neurona[]): Inferencia[] {
  const todasLasInferencias: Inferencia[] = [];

  neuronas.forEach((neurona) => {
    const inferencias = inferirDesdeNeurona(neurona);
    todasLasInferencias.push(...inferencias);
  });

  console.log(`\n💡 Total de inferencias generadas: ${todasLasInferencias.length}`);

  return todasLasInferencias;
}

// --------------------------------------------
// GENERAR REPORTE DE ANÁLISIS COMPLETO
// --------------------------------------------

export async function generarReporteAnalisis(
  contexto: ContextoProducto,
  neuronas: Neurona[],
  inferencias: Inferencia[]
): Promise<ResultadoAnalisis> {

  const problemas: string[] = [];
  const causas: string[] = [];
  const soluciones: string[] = [];
  const compatibilidades: string[] = [];
  const mejoras: string[] = [];

  // Detectar problemas desde contexto
  problemas.push(...contexto.problemas_conocidos);

  // Extraer causas y soluciones desde inferencias
  inferencias.forEach((inf) => {
    causas.push(...inf.consecuencias);
    soluciones.push(...inf.oportunidades);
  });

  // Detectar compatibilidades desde neuronas
  neuronas.forEach((neurona) => {
    if (neurona.compatibilidades.length > 0) {
      compatibilidades.push(...neurona.compatibilidades);
    }
  });

  // Calcular confianza general
  const confianzaGeneral =
    inferencias.length > 0
      ? inferencias.reduce((acc, inf) => acc + inf.confianza, 0) / inferencias.length
      : 0;

  const resultado: ResultadoAnalisis = {
    id: uuidv4(),
    producto: contexto.nombre,
    problema_detectado: problemas.join(' | '),
    causas_fisicas: [...new Set(causas)],
    soluciones_propuestas: [...new Set(soluciones)],
    compatibilidades: [...new Set(compatibilidades)],
    mejoras,
    confianza_general: confianzaGeneral,
    fecha: new Date().toISOString(),
  };

  // Guardar en Supabase
  const { error } = await supabase.from('resultados').insert({
    id: resultado.id,
    producto: resultado.producto,
    problema_detectado: resultado.problema_detectado,
    causas_fisicas: resultado.causas_fisicas,
    soluciones_propuestas: resultado.soluciones_propuestas,
    compatibilidades: resultado.compatibilidades,
    mejoras: resultado.mejoras,
    confianza_general: resultado.confianza_general,
    fecha: resultado.fecha,
  });

  if (error) {
    console.error('❌ Error guardando resultado:', error.message);
  } else {
    console.log(`✅ Resultado guardado en Supabase — producto: ${contexto.nombre}`);
  }

  return resultado;
}