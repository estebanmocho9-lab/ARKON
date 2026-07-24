// ============================================================
// src/inference/MotorInferencia.ts
// Coordina neuronas y aplica cruces científicos
// ============================================================

import { supabase } from '../supabase/client';
import { NeuronInput, NeuronOutput, ProblemaConfig } from '../neurons/base/tipos';
import { NEURON_MAP } from '../neurons/index';
import { evaluarExpresion } from '../utils/mathHelpers';

export class MotorInferencia {
  async analizarProblema(
    problemaNombre: string,
    input: NeuronInput
  ): Promise<{
    indiceGlobal: number;
    resultadosCruces: Record<string, number>;
    confianzaGlobal: number;
    detalles: any;
  }> {
    // 1. Obtener configuración del problema
    const { data: problema, error } = await supabase
      .from('problemas')
      .select('*')
      .eq('nombre_problema', problemaNombre)
      .single();

    if (error || !problema) throw new Error(`Problema '${problemaNombre}' no encontrado`);

    const config: ProblemaConfig = {
      nombre: problema.nombre_problema,
      crucesActivos: problema.cruces_activos,
      formulaGlobal: problema.formula_global
    };

    // 2. Obtener definiciones de los cruces
    const nombresCruces = config.crucesActivos.map(c => c.nombreCruce);
    const { data: crucesData, error: crucesError } = await supabase
      .from('cruces_cientificos')
      .select('*')
      .in('nombre_cruce', nombresCruces)
      .eq('activo', true);

    if (crucesError || !crucesData) throw new Error('No se pudieron cargar los cruces');

    // 3. Identificar propiedades únicas
    const propiedadesUnicas = new Set<string>();
    crucesData.forEach((cruce: any) => {
      cruce.propiedades_requeridas.forEach((prop: string) => propiedadesUnicas.add(prop));
    });

    // 4. Ejecutar todas las neuronas necesarias en paralelo
    const resultadosNeuronas = await Promise.all(
      Array.from(propiedadesUnicas).map(async (propName) => {
        const neurona = NEURON_MAP[propName];
        if (!neurona) throw new Error(`Neurona no encontrada para propiedad '${propName}'`);
        const output = await neurona.process(input);
        return { propName, output };
      })
    );

    const valoresPropiedades: Record<string, number> = {};
    for (const r of resultadosNeuronas) {
      valoresPropiedades[r.propName] = r.output.valorCompuesto;
    }

    // 5. Evaluar cada cruce
    const resultadosCruces: Record<string, number> = {};
    for (const cruce of crucesData) {
      const scope: Record<string, number> = {};
      for (const prop of cruce.propiedades_requeridas) {
        const valor = valoresPropiedades[prop];
        if (valor === undefined) {
          throw new Error(`Falta valor para propiedad ${prop} en cruce ${cruce.nombre_cruce}`);
        }
        scope[`idx_${prop}`] = valor;
      }
      const valorCruce = evaluarExpresion(cruce.formula, scope);
      resultadosCruces[cruce.nombre_cruce] = valorCruce;
    }

    // 6. Calcular índice global (suma ponderada por defecto)
    let indiceGlobal = 0;
    for (const activo of config.crucesActivos) {
      const valor = resultadosCruces[activo.nombreCruce];
      if (valor !== undefined) {
        indiceGlobal += activo.peso * valor;
      }
    }
    // Si hay fórmula personalizada, reemplazar
    if (config.formulaGlobal && config.formulaGlobal !== 'sum(weights * values)') {
      const scopeGlobal = { values: resultadosCruces, weights: config.crucesActivos.map(c => c.peso) };
      indiceGlobal = evaluarExpresion(config.formulaGlobal, scopeGlobal);
    }
    indiceGlobal = Math.min(100, Math.max(0, indiceGlobal));

    const confianzaPromedio = resultadosNeuronas.reduce((acc, r) => acc + r.output.confianza, 0) / resultadosNeuronas.length;

    // 7. Recolectar índices intermedios de cada neurona para trazabilidad
    const indicesIntermediosPorPropiedad: Record<string, Record<string, number>> = {};
    for (const r of resultadosNeuronas) {
      const idx = (r.output as any).indicesIntermedios ?? {};
      if (Object.keys(idx).length > 0) {
        indicesIntermediosPorPropiedad[r.propName] = idx;
      }
    }

    return {
      indiceGlobal,
      resultadosCruces,
      confianzaGlobal: confianzaPromedio,
      detalles: {
        valoresPropiedades,
        indicesIntermediosPorPropiedad
      }
    };
  }
}