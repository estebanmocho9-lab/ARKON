// ============================================================
// src/core/activationEngine.ts
// LÓGICA CLAVE: neuronas sin datos se IGNORAN, no bloquean el cálculo.
// El sistema activa con las neuronas disponibles y reporta las faltantes.
// ============================================================

import { ALL_NEURONS, NEURON_MAP, NeuronOutput, NeuronInput } from '../neurons/index';
import { getVectorFromSupabase } from '../sheets/syncData';

// Mapeo contextos → grupos de neuronas
// IMPORTANTE: los nombres de grupo aquí deben coincidir EXACTAMENTE
// con los valores "readonly group = '...'" de cada neurona en /neurons/physical/
// Grupos existentes: absorption, chemical, composition, density, diffusion,
//   elasticity, electrical, environmental, mechanical, particle, permeability,
//   pore, porosity, surface, thermal, thermal_limits
const CONTEXTOS_ACTIVACION: Record<string, string[]> = {
  absorcion:               ['absorption', 'porosity', 'permeability', 'diffusion', 'surface', 'chemical', 'pore'],
  humedad:                 ['absorption', 'porosity', 'permeability', 'diffusion', 'surface', 'chemical', 'pore'],
  fragilidad:              ['mechanical', 'elasticity', 'density', 'porosity', 'pore'],
  aislamiento_termico:     ['thermal', 'thermal_limits', 'density', 'diffusion', 'porosity'],
  termico:                 ['thermal', 'thermal_limits', 'density', 'diffusion', 'porosity'],
  quimico:                 ['chemical', 'composition', 'electrical', 'surface'],
  resistencia_estructural: ['mechanical', 'elasticity', 'density', 'composition'],
  estructural:             ['mechanical', 'elasticity', 'density', 'composition'],
  sustentabilidad:         ['environmental', 'density', 'composition'],
  sostenibilidad:          ['environmental', 'density', 'composition'],
  peso:                    ['density', 'porosity', 'mechanical'],
  general:                 [],  // vacío = activar todas
};

// Umbral mínimo de neuronas activadas para producir resultado
// Si hay menos que este porcentaje de datos, el resultado es poco confiable
const UMBRAL_CONFIANZA_MINIMO = 0.15; // 15% de las neuronas del contexto

export interface ActivationResult {
  materialId: string;
  estado?: string;
  neuronasActivadas: NeuronOutput[];
  neuronasConDatos: number;
  neuronasSinDatos: number;
  totalNeuronas: number;
  coberturaPorc: number;       // % de neuronas que tenían datos
  confianzaPromedio: number;   // promedio de confianza de las neuronas activadas
  propiedadesConDatos: number;
  propiedadesPendientes: string[];
  esResultadoParcial: boolean; // true si faltan datos pero igual se calculó
  timestamp: string;
}

export async function activarNeuronas(
  materialId: string,
  contexto: string = 'general',
  estado?: string   // opcional: 'Polvo', 'Fraguado', etc.
): Promise<ActivationResult> {
  console.log(`\n🧠 Activando neuronas — ${materialId} | contexto: ${contexto}${estado ? ` | estado: ${estado}` : ''}`);

  // 1. Leer vector del material desde Supabase (que vino de Sheets)
  const vector = await getVectorFromSupabase(materialId);

  if (!vector) {
    console.error(`❌ Material ${materialId} no encontrado en Supabase`);
    return {
      materialId, estado,
      neuronasActivadas: [],
      neuronasConDatos: 0,
      neuronasSinDatos: 0,
      totalNeuronas: 0,
      coberturaPorc: 0,
      confianzaPromedio: 0,
      propiedadesConDatos: 0,
      propiedadesPendientes: [],
      esResultadoParcial: false,
      timestamp: new Date().toISOString()
    };
  }

  // 2. Determinar neuronas según contexto
  const gruposActivos = CONTEXTOS_ACTIVACION[contexto] ?? [];
  const neuronasParaActivar = gruposActivos.length === 0
    ? ALL_NEURONS
    : ALL_NEURONS.filter(n => gruposActivos.includes(n.group));

  console.log(`📡 Neuronas del contexto "${contexto}": ${neuronasParaActivar.length}`);

  // 3. ── NÚCLEO DEL CAMBIO ──────────────────────────────────────
  // Las neuronas SIN datos no bloquean nada. Se registran y se ignoran.
  // Las neuronas CON datos se activan normalmente.
  // El cálculo final usa solo las activadas.
  // ─────────────────────────────────────────────────────────────

  const resultados: NeuronOutput[] = [];
  const propiedadesPendientes: string[] = [];
  let neuronasConDatos = 0;
  let neuronasSinDatos = 0;

  for (const neurona of neuronasParaActivar) {
    const prop = neurona.propertyName;
    const valorNormalizado = vector[prop];

    // ── DATO AUSENTE: registrar y continuar (NO bloquear) ──
    if (valorNormalizado === null || valorNormalizado === undefined) {
      neuronasSinDatos++;
      propiedadesPendientes.push(prop);
      // La neurona se omite silenciosamente — no genera error
      continue;
    }

    // ── DATO PRESENTE: activar neurona ──
    neuronasConDatos++;

    // Reunir contexto de propiedades relacionadas (solo las que existen)
    const contextoNeural: Record<string, number> = {};
    for (const propRel of neurona.relatedProperties) {
      const val = vector[propRel];
      if (val !== null && val !== undefined) {
        contextoNeural[propRel] = val as number;
      }
      // Si la propiedad relacionada no tiene datos → simplemente no se incluye
      // La neurona igual se activa con el dato principal que sí tiene
    }

    const input: NeuronInput = {
      materialId,
      estado: 'E01',
      valorDirecto: valorNormalizado as number,
      contexto: contextoNeural
    };

    try {
      const output = await neurona.process(input);
      resultados.push(output);
    } catch (err) {
      console.error(`⚠️  Neurona ${neurona.neuronId} (${prop}) falló:`, err);
      neuronasSinDatos++;
      neuronasConDatos--;
      propiedadesPendientes.push(`${prop} [error]`);
    }
  }

  // 4. Calcular métricas del resultado
  const totalNeuronas = neuronasParaActivar.length;
  const coberturaPorc = totalNeuronas > 0 ? (neuronasConDatos / totalNeuronas) * 100 : 0;
  const confianzaPromedio = resultados.length > 0
    ? resultados.reduce((sum, n) => sum + (n.confianza ?? 0), 0) / resultados.length
    : 0;

  // 5. Log de resultado
  const esResultadoParcial = neuronasSinDatos > 0 && neuronasConDatos > 0;
  const simbolo = coberturaPorc >= 70 ? '✅' : coberturaPorc >= 30 ? '⚠️ ' : '🔴';

  console.log(`${simbolo} Neuronas activadas: ${neuronasConDatos}/${totalNeuronas} (${coberturaPorc.toFixed(0)}%)`);
  if (neuronasSinDatos > 0) {
    console.log(`   ⏭️  Ignoradas por falta de datos: ${neuronasSinDatos}`);
    console.log(`   → Estas neuronas no afectan el cálculo de las demás`);
  }
  if (coberturaPorc < UMBRAL_CONFIANZA_MINIMO * 100) {
    console.log(`   ⚠️  Cobertura muy baja (${coberturaPorc.toFixed(0)}%) — resultado de baja confianza`);
  }

  return {
    materialId,
    estado,
    neuronasActivadas: resultados,
    neuronasConDatos,
    neuronasSinDatos,
    totalNeuronas,
    coberturaPorc,
    confianzaPromedio,
    propiedadesConDatos: neuronasConDatos,
    propiedadesPendientes,
    esResultadoParcial,
    timestamp: new Date().toISOString()
  };
}

// ── Función de análisis cruzado ────────────────────────────────────
// Ejemplo: calcular "fragilidad" cruzando 8 neuronas mecánicas,
// ignorando las que no tienen datos.
export function calcularIndicadorCruzado(
  activaciones: NeuronOutput[],
  propiedadesRequeridas: string[],
  nombre: string
): { valor: number; cobertura: number; propFaltantes: string[] } {
  const disponibles = activaciones.filter(a =>
    propiedadesRequeridas.includes(a.propertyName)
  );
  const faltantes = propiedadesRequeridas.filter(p =>
    !activaciones.some(a => a.propertyName === p)
  );

  if (disponibles.length === 0) {
    return { valor: 0, cobertura: 0, propFaltantes: faltantes };
  }

  // Promedio ponderado por confianza de las neuronas disponibles
  const sumaConfianza = disponibles.reduce((s, n) => s + (n.confianza ?? 1), 0);
  const valorPonderado = disponibles.reduce((s, n) =>
    s + (n.valorCompuesto * (n.confianza ?? 1)), 0
  ) / sumaConfianza;

  const cobertura = (disponibles.length / propiedadesRequeridas.length) * 100;

  if (faltantes.length > 0) {
    console.log(`📊 ${nombre}: ${disponibles.length}/${propiedadesRequeridas.length} propiedades`);
    console.log(`   Faltantes ignoradas: ${faltantes.join(', ')}`);
  }

  return {
    valor: Math.round(valorPonderado * 10) / 10,
    cobertura,
    propFaltantes: faltantes
  };
}