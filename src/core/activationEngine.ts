// ============================================================
// Directas: estructuras IA + cerebro Llama/Turso.
// Inversas: conservan íntegra su fuente original de vectores.
// ============================================================
import { ALL_NEURONS, NeuronOutput, NeuronInput } from '../neurons/index';
import { DIRECT_AI_NEURONS } from '../neurons/ai/neurons';
import { LlamaTursoDataProvider } from '../neurons/ai/llamaTursoDataProvider';
import { EstadoMaterial } from '../neurons/base/tipos';
import { getRealVector } from '../sheets/realVectors';
import { supabase } from '../supabase/client';

const CONTEXTOS_ACTIVACION: Record<string, string[]> = {
  absorcion: ['absorption','porosity','permeability','diffusion','surface','chemical','pore'],
  humedad: ['absorption','porosity','permeability','diffusion','surface','chemical','pore'],
  fragilidad: ['mechanical','elasticity','density','porosity','pore'],
  aislamiento_termico: ['thermal','thermal_limits','density','diffusion','porosity'],
  termico: ['thermal','thermal_limits','density','diffusion','porosity'],
  quimico: ['chemical','composition','electrical','surface'],
  resistencia_estructural: ['mechanical','elasticity','density','composition'],
  estructural: ['mechanical','elasticity','density','composition'],
  sustentabilidad: ['environmental','density','composition'],
  sostenibilidad: ['environmental','density','composition'],
  peso: ['density','porosity','mechanical'],
  general: [],
};
const UMBRAL_CONFIANZA_MINIMO = 0.15;
const ESTADOS_LOGICOS = new Set<EstadoMaterial>(['E01', 'E02', 'E03']);

function normalizarEstadoNeural(estado?: string): EstadoMaterial {
  return estado && ESTADOS_LOGICOS.has(estado as EstadoMaterial) ? estado as EstadoMaterial : 'E01';
}

export interface ActivationResult {
  materialId: string; estado?: string; neuronasActivadas: NeuronOutput[];
  neuronasConDatos: number; neuronasSinDatos: number; totalNeuronas: number;
  coberturaPorc: number; confianzaPromedio: number; propiedadesConDatos: number;
  propiedadesPendientes: string[]; esResultadoParcial: boolean; timestamp: string;
  evidenciaTurso: ReturnType<LlamaTursoDataProvider['getEvidenceAudit']>;
}

export async function activarNeuronas(
  materialId: string, contexto = 'general', estado?: string, providerOverride?: LlamaTursoDataProvider,
): Promise<ActivationResult> {
  console.log(`\n🧠 Activando neuronas — ${materialId} | contexto: ${contexto}${estado ? ` | estado: ${estado}` : ''}`);
  const gruposActivos = CONTEXTOS_ACTIVACION[contexto] ?? [];
  const neuronasDirectas = DIRECT_AI_NEURONS.filter(n =>
    gruposActivos.length === 0 || gruposActivos.includes(n.profile.sourceNeuron?.group ?? '')
  );
  const neuronasInversas = ALL_NEURONS.filter(n =>
    n.orientation === 'inverse' && (gruposActivos.length === 0 || gruposActivos.includes(n.group))
  );
  const estadoNormalizado = normalizarEstadoNeural(estado);
  let provider = providerOverride;
  if (!provider) {
    const { data: material } = await supabase.from('catalogo_materiales')
      .select('nombre').eq('id_material', materialId).maybeSingle();
    provider = new LlamaTursoDataProvider(
      materialId, String(material?.nombre ?? materialId), estadoNormalizado,
      estadoNormalizado === 'E01' ? 'comercial inicial' : estadoNormalizado === 'E02' ? 'fraguado seco' : 'degradado',
    );
  }

  const resultados: NeuronOutput[] = [];
  const propiedadesPendientes: string[] = [];
  let neuronasConDatos = 0;
  let neuronasSinDatos = 0;

  // Solo las directas reciben el proveedor del cerebro. Nunca leen NORMALIZACION.
  for (const neuronaIA of neuronasDirectas) {
    try {
      const output = await neuronaIA.process({ materialId, estado: estadoNormalizado, dataProvider: provider });
      if (output.propiedadPendiente) {
        neuronasSinDatos++;
        propiedadesPendientes.push(output.propertyName);
      } else {
        resultados.push(output);
        neuronasConDatos++;
      }
    } catch (err) {
      console.error(`⚠️ Neurona directa ${neuronaIA.sourceNeuronId} (${neuronaIA.propertyName}) falló:`, err);
      neuronasSinDatos++;
      propiedadesPendientes.push(`${neuronaIA.propertyName} [error]`);
    }
  }

  // Las inversas conservan la fuente vectorial y el comportamiento anteriores.
  const vectorInversas = await getRealVector(materialId, estado);
  for (const neurona of neuronasInversas) {
    const prop = neurona.propertyName;
    const valorNormalizado = vectorInversas?.[prop];
    if (valorNormalizado === null || valorNormalizado === undefined) {
      neuronasSinDatos++;
      propiedadesPendientes.push(prop);
      continue;
    }
    const contextoNeural: Record<string, number> = {};
    for (const propRel of neurona.relatedProperties) {
      const val = vectorInversas?.[propRel];
      if (val !== null && val !== undefined) contextoNeural[propRel] = val as number;
    }
    const input: NeuronInput = {
      materialId, estado: estadoNormalizado, valorDirecto: valorNormalizado as number, contexto: contextoNeural,
    };
    try {
      const output = await neurona.process(input);
      if (output.propiedadPendiente) {
        neuronasSinDatos++;
        propiedadesPendientes.push(prop);
      } else {
        resultados.push(output);
        neuronasConDatos++;
      }
    } catch (err) {
      console.error(`⚠️ Neurona inversa ${neurona.neuronId} (${prop}) falló:`, err);
      neuronasSinDatos++;
      propiedadesPendientes.push(`${prop} [error]`);
    }
  }

  const totalNeuronas = neuronasDirectas.length + neuronasInversas.length;
  const coberturaPorc = totalNeuronas > 0 ? neuronasConDatos / totalNeuronas * 100 : 0;
  const confianzaPromedio = resultados.length > 0
    ? resultados.reduce((sum, n) => sum + (n.confianza ?? 0), 0) / resultados.length : 0;
  const esResultadoParcial = neuronasSinDatos > 0 && neuronasConDatos > 0;
  const simbolo = coberturaPorc >= 70 ? '✅' : coberturaPorc >= 30 ? '⚠️' : '🔴';
  console.log(`${simbolo} Neuronas activadas: ${neuronasConDatos}/${totalNeuronas} (${coberturaPorc.toFixed(0)}%)`);
  if (neuronasSinDatos > 0) console.log(`   ⏭️ Pendientes por falta de datos: ${neuronasSinDatos}`);
  if (coberturaPorc < UMBRAL_CONFIANZA_MINIMO * 100) console.log(`   ⚠️ Cobertura muy baja (${coberturaPorc.toFixed(0)}%)`);

  return {
    materialId, estado, neuronasActivadas: resultados, neuronasConDatos, neuronasSinDatos,
    totalNeuronas, coberturaPorc, confianzaPromedio, propiedadesConDatos: neuronasConDatos,
    propiedadesPendientes, esResultadoParcial, timestamp: new Date().toISOString(),
    evidenciaTurso: provider.getEvidenceAudit(),
  };
}

export function calcularIndicadorCruzado(activaciones: NeuronOutput[], propiedadesRequeridas: string[], nombre: string): { valor: number; cobertura: number; propFaltantes: string[] } {
  const disponibles = activaciones.filter(a => propiedadesRequeridas.includes(a.propertyName));
  const faltantes = propiedadesRequeridas.filter(p => !activaciones.some(a => a.propertyName === p));
  if (!disponibles.length) return { valor: 0, cobertura: 0, propFaltantes: faltantes };
  const sumaConfianza = disponibles.reduce((s, n) => s + (n.confianza ?? 1), 0);
  const valorPonderado = disponibles.reduce((s, n) => s + n.valorCompuesto * (n.confianza ?? 1), 0) / sumaConfianza;
  const cobertura = disponibles.length / propiedadesRequeridas.length * 100;
  if (faltantes.length) console.log(`📊 ${nombre}: ${disponibles.length}/${propiedadesRequeridas.length} propiedades; faltantes: ${faltantes.join(', ')}`);
  return { valor: Math.round(valorPonderado * 10) / 10, cobertura, propFaltantes: faltantes };
}
