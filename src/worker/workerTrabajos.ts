import * as dotenv from 'dotenv';
dotenv.config();

import { supabase } from '../supabase/client';
import { getVectorFromSheet } from '../sheets/syncData';

interface CruceCientifico { nombre_cruce: string; propiedades_requeridas: string[]; formula: string; descripcion: string; problema: string; }
interface ProblemaConfig { nombre_problema: string; cruces_activos: { nombreCruce: string; peso: number }[]; formula_global: string; descripcion: string; }
interface TrizContradiccion { param_triz_mejora: string; param_triz_empeora: string; propiedades_mejora: string[]; propiedades_empeora: string[]; nombres_principios: string[]; }
interface ReglaMezcla { propiedad_nombre: string; formula: string; descripcion: string; }

function evaluarFormula(formula: string, vector: Record<string, number | null>): number | null {
  try {
    const vars: Record<string, number> = {};
    for (const [key, val] of Object.entries(vector)) if (val !== null && val !== undefined && Number.isFinite(Number(val))) vars[`idx_${key}`] = Number(val);
    const varsEnFormula = formula.match(/idx_\w+/g) ?? [];
    for (const v of varsEnFormula) if (vars[v] === undefined) return null;
    const expr = formula.replace(/LEAST\(([^)]+)\)/g, 'Math.min($1)').replace(/GREATEST\(([^)]+)\)/g, 'Math.max($1)');
    const fn = new Function(...Object.keys(vars), `return ${expr}`);
    const resultado = fn(...Object.values(vars));
    if (!Number.isFinite(resultado)) return null;
    return Math.max(0, Math.min(100, resultado));
  } catch { return null; }
}

async function analizarMaterial(materialId: string, contexto: string, vector: Record<string, number | null>) {
  const { data: problemaData } = await supabase.from('problemas').select('*').eq('nombre_problema', contexto).eq('activo', true).maybeSingle();
  const problema = problemaData as ProblemaConfig | null;
  const { data: crucesData } = await supabase.from('cruces_cientificos').select('*').eq('problema', contexto).eq('activo', true);
  const cruces = (crucesData ?? []) as CruceCientifico[];
  const resultadosCruces: Record<string, number> = {};
  const crucesSinDatos: string[] = [];

  for (const cruce of cruces) {
    const valor = evaluarFormula(cruce.formula, vector);
    if (valor !== null) resultadosCruces[cruce.nombre_cruce] = valor;
    else crucesSinDatos.push(cruce.descripcion);
  }

  let indiceGlobal = 0; let pesoTotal = 0;
  const detalleCalculo: Record<string, number> = {};
  if (problema?.cruces_activos) {
    for (const cruceActivo of problema.cruces_activos) {
      const valor = resultadosCruces[cruceActivo.nombreCruce];
      if (valor !== undefined) { indiceGlobal += valor * cruceActivo.peso; pesoTotal += cruceActivo.peso; detalleCalculo[cruceActivo.nombreCruce] = valor; }
    }
    if (pesoTotal > 0) indiceGlobal /= pesoTotal;
  } else {
    const vals = Object.values(resultadosCruces);
    if (vals.length) { indiceGlobal = vals.reduce((a,b) => a+b, 0) / vals.length; Object.assign(detalleCalculo, resultadosCruces); }
  }

  const cobertura = cruces.length ? Object.keys(resultadosCruces).length / cruces.length : 0;
  const causas: string[] = [];
  for (const [nombreCruce, valor] of Object.entries(resultadosCruces)) {
    const cruce = cruces.find(c => c.nombre_cruce === nombreCruce); if (!cruce) continue;
    if (valor > 70) causas.push(`${cruce.descripcion}: índice elevado (${valor.toFixed(1)}/100) — indica problema real`);
    else if (valor < 20 && contexto !== 'aislamiento_termico') causas.push(`${cruce.descripcion}: índice bajo (${valor.toFixed(1)}/100) — propiedad deficiente`);
  }
  if (crucesSinDatos.length) causas.push(`Sin datos para calcular: ${crucesSinDatos.slice(0,2).join(', ')}`);
  if (!causas.length && Object.keys(resultadosCruces).length) causas.push(`Propiedades de ${contexto} dentro de rangos normales — índice: ${indiceGlobal.toFixed(1)}/100`);

  const propConProblema = Object.entries(resultadosCruces).filter(([,v]) => v > 70).map(([k]) => k);
  const soluciones: string[] = [];
  if (propConProblema.length) {
    const { data: reglasData } = await supabase.from('reglas_mejora').select('*').in('neurona_id', propConProblema.map(p => `N_${p.toUpperCase()}_001`)).limit(3);
    for (const regla of (reglasData ?? []) as any[]) soluciones.push(regla.solucion);
  }

  const triz: string[] = [];
  const propAltas = Object.entries(resultadosCruces).filter(([,v]) => v > 65).map(([k]) => k);
  if (propAltas.length) {
    const { data: trizData } = await supabase.from('triz_contradicciones').select('nombres_principios, param_triz_mejora, param_triz_empeora, propiedades_mejora').limit(50);
    for (const contradiccion of (trizData ?? []) as TrizContradiccion[]) {
      const mejora = Array.isArray(contradiccion.propiedades_mejora) ? contradiccion.propiedades_mejora : [];
      if (propAltas.some(p => mejora.some(m => String(m).toLowerCase().includes(p.toLowerCase().replace('idx_','')))) && contradiccion.nombres_principios) {
        for (const p of contradiccion.nombres_principios.slice(0,2)) if (!triz.includes(p)) triz.push(p);
      }
      if (triz.length >= 4) break;
    }
  }

  if (soluciones.length < 2) {
    const { data: mezclaData } = await supabase.from('reglas_mezcla').select('propiedad_nombre, descripcion').limit(10);
    for (const regla of (mezclaData ?? []) as ReglaMezcla[]) {
      const propVec = vector[regla.propiedad_nombre];
      if (propVec !== null && propVec !== undefined) {
        if (contexto === 'absorcion' && Number(propVec) > 50) soluciones.push(`Aplicar regla de mezcla para ${regla.propiedad_nombre}: ${regla.descripcion}`);
        else if (contexto === 'fragilidad' && Number(propVec) < 30) soluciones.push(`Refuerzo por ${regla.propiedad_nombre}: ${regla.descripcion}`);
      }
      if (soluciones.length >= 3) break;
    }
  }

  if (!soluciones.length) soluciones.push(cobertura < 0.4 ? 'Completar propiedades en NORMALIZACION para análisis más preciso' : `Material presenta comportamiento aceptable en ${contexto}`);
  return { indice: Math.round(indiceGlobal*10)/10, cobertura, causas, soluciones, triz, detalle: detalleCalculo };
}

async function procesarTrabajo(trabajo: any): Promise<void> {
  const { id, producto, material_id, contexto } = trabajo;
  console.log(`\n⚙️ Procesando trabajo ${id} — ${producto} (${contexto})`);
  await supabase.from('trabajos').update({ estado:'procesando', actualizado_en:new Date().toISOString() }).eq('id', id);
  try {
    // FUENTE ÚNICA DE VECTORES: Google Sheets / NORMALIZACION.
    console.log('   📊 Leyendo vector REAL directamente desde NORMALIZACION...');
    const vector = await getVectorFromSheet(material_id);
    if (!vector) throw new Error(`No se encontró el vector real de ${material_id} en NORMALIZACION`);
    const propConDatos = Object.values(vector).filter(v => v !== null && v !== undefined).length;
    console.log(`   📊 Vector real: ${propConDatos} propiedades con datos`);
    console.log(`   📊 Muestra: absorcion_agua=${vector.absorcion_agua}, porosidad_total=${vector.porosidad_total}, resistencia_compresion=${vector.resistencia_compresion}`);
    console.log(`   🧠 Ejecutando motor científico para contexto: ${contexto}...`);
    const resultado = await analizarMaterial(material_id, contexto, vector);
    console.log(`   📊 Índice real (${contexto}): ${resultado.indice}/100`);
    console.log(`   📊 Cobertura: ${Math.round(resultado.cobertura*100)}%`);
    console.log(`   📊 Detalle cruces: ${JSON.stringify(resultado.detalle)}`);
    if (resultado.triz.length) console.log(`   🔧 Principios TRIZ: ${resultado.triz.join(', ')}`);
    const { data: resultadoGuardado, error: errorResultado } = await supabase.from('resultados').insert({
      producto, problema_detectado:`Análisis de ${contexto} — índice: ${resultado.indice}/100 (cobertura ${Math.round(resultado.cobertura*100)}%)`,
      causas_fisicas:resultado.causas.slice(0,5),
      soluciones_propuestas:[...resultado.soluciones.slice(0,3), ...(resultado.triz.length ? [`Principios TRIZ aplicables: ${resultado.triz.slice(0,3).join(', ')}`] : [])].slice(0,5),
      compatibilidades:[], mejoras:resultado.triz.slice(0,3), confianza_general:Math.round(resultado.cobertura*100)/100,
      neuronas_activadas:Object.keys(resultado.detalle).length, inferencias_generadas:resultado.causas.length, coherencia_global:resultado.indice/100,
    }).select('id').single();
    if (errorResultado || !resultadoGuardado) throw new Error(`Error guardando resultado: ${errorResultado?.message}`);
    await supabase.from('trabajos').update({ estado:'completado', resultado_id:resultadoGuardado.id, actualizado_en:new Date().toISOString(), error_msg:null }).eq('id',id);
    console.log(`   ✅ Trabajo ${id} completado.`);
  } catch (error:any) {
    console.error(`   ❌ Trabajo ${id} falló:`, error?.message || error);
    await supabase.from('trabajos').update({ estado:'error', error_msg:error?.message || String(error), actualizado_en:new Date().toISOString() }).eq('id',id);
  }
}

async function revisarPendientes(): Promise<void> {
  const { data, error } = await supabase.from('trabajos').select('*').eq('estado','pendiente').order('creado_en',{ascending:true}).limit(1);
  if (error) { console.error('Error leyendo trabajos:', error.message); return; }
  if (data?.length) await procesarTrabajo(data[0]);
}

console.log('═══════════════════════════════════════════');
console.log('🧠 IMPULSO IA — Worker de trabajos activo');
console.log('   Vector fuente: NORMALIZACION de Google Sheets');
console.log('   Motor científico: Supabase (reglas/configuración, no vectores)');
console.log('   Escuchando tabla "trabajos" en Supabase');
console.log('═══════════════════════════════════════════\n');

revisarPendientes();
setInterval(revisarPendientes, 5000);