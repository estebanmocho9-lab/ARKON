import * as dotenv from 'dotenv';
dotenv.config();

import { supabase } from '../supabase/client';
import { syncMaterialesToSupabase } from '../sheets/syncData';

// ─── TIPOS ────────────────────────────────────────────────────────────────────
interface CruceCientifico {
  nombre_cruce: string;
  propiedades_requeridas: string[];
  formula: string;
  descripcion: string;
  problema: string;
}

interface ProblemaConfig {
  nombre_problema: string;
  cruces_activos: { nombreCruce: string; peso: number }[];
  formula_global: string;
  descripcion: string;
}

interface TrizContradicion {
  param_triz_mejora: string;
  param_triz_empeora: string;
  propiedades_mejora: string[];
  propiedades_empeora: string[];
  nombres_principios: string[];
}

interface ReglaMezcla {
  propiedad_nombre: string;
  formula: string;
  descripcion: string;
}

// ─── EVALUAR FÓRMULA DE CRUCE ─────────────────────────────────────────────────
// Evalúa la fórmula del cruce usando los valores del vector del material
function evaluarFormula(formula: string, vector: Record<string, number | null>): number | null {
  try {
    // Construir variables idx_* desde el vector
    const vars: Record<string, number> = {};
    for (const [key, val] of Object.entries(vector)) {
      if (val !== null && val !== undefined && !isNaN(Number(val))) {
        vars[`idx_${key}`] = Number(val);
      }
    }

    // Verificar que todas las variables necesarias están presentes
    const varsEnFormula = formula.match(/idx_\w+/g) ?? [];
    for (const v of varsEnFormula) {
      if (vars[v] === undefined) return null; // falta dato
    }

    // Reemplazar LEAST() por Math.min()
    let expr = formula
      .replace(/LEAST\(([^)]+)\)/g, 'Math.min($1)')
      .replace(/GREATEST\(([^)]+)\)/g, 'Math.max($1)');

    // Evaluar con las variables
    const fn = new Function(...Object.keys(vars), `return ${expr}`);
    const resultado = fn(...Object.values(vars));

    if (isNaN(resultado) || !isFinite(resultado)) return null;
    return Math.max(0, Math.min(100, resultado)); // clamp 0-100
  } catch {
    return null;
  }
}

// ─── MOTOR PRINCIPAL ──────────────────────────────────────────────────────────
async function analizarMaterial(
  materialId: string,
  contexto: string,
  vector: Record<string, number | null>
): Promise<{
  indice: number;
  cobertura: number;
  causas: string[];
  soluciones: string[];
  triz: string[];
  detalle: Record<string, number>;
}> {

  // 1. Cargar configuración del problema desde Supabase
  const { data: problemaData } = await supabase
    .from('problemas')
    .select('*')
    .eq('nombre_problema', contexto)
    .eq('activo', true)
    .single();

  const problema = problemaData as ProblemaConfig | null;

  // 2. Cargar todos los cruces del contexto
  const { data: crucesData } = await supabase
    .from('cruces_cientificos')
    .select('*')
    .eq('problema', contexto)
    .eq('activo', true);

  const cruces = (crucesData ?? []) as CruceCientifico[];

  // 3. Evaluar cada cruce con los datos del vector
  const resultadosCruces: Record<string, number> = {};
  const crucesSinDatos: string[] = [];

  for (const cruce of cruces) {
    const valor = evaluarFormula(cruce.formula, vector);
    if (valor !== null) {
      resultadosCruces[cruce.nombre_cruce] = valor;
    } else {
      crucesSinDatos.push(cruce.descripcion);
    }
  }

  // 4. Calcular índice global usando pesos del problema
  let indiceGlobal = 0;
  let pesoTotal = 0;
  const detalleCalculo: Record<string, number> = {};

  if (problema?.cruces_activos) {
    for (const cruceActivo of problema.cruces_activos) {
      const valor = resultadosCruces[cruceActivo.nombreCruce];
      if (valor !== undefined) {
        indiceGlobal += valor * cruceActivo.peso;
        pesoTotal += cruceActivo.peso;
        detalleCalculo[cruceActivo.nombreCruce] = valor;
      }
    }
    if (pesoTotal > 0) indiceGlobal = indiceGlobal / pesoTotal;
  } else {
    // fallback: promedio simple de todos los cruces disponibles
    const vals = Object.values(resultadosCruces);
    if (vals.length > 0) {
      indiceGlobal = vals.reduce((a, b) => a + b, 0) / vals.length;
      Object.assign(detalleCalculo, resultadosCruces);
    }
  }

  const cobertura = cruces.length > 0
    ? Object.keys(resultadosCruces).length / cruces.length
    : 0;

  // 5. Generar causas físicas reales basadas en los valores calculados
  const causas: string[] = [];

  for (const [nombreCruce, valor] of Object.entries(resultadosCruces)) {
    const cruce = cruces.find(c => c.nombre_cruce === nombreCruce);
    if (!cruce) continue;

    if (valor > 70) {
      causas.push(`${cruce.descripcion}: índice elevado (${valor.toFixed(1)}/100) — indica problema real`);
    } else if (valor < 20 && contexto !== 'aislamiento_termico') {
      causas.push(`${cruce.descripcion}: índice bajo (${valor.toFixed(1)}/100) — propiedad deficiente`);
    }
  }

  if (crucesSinDatos.length > 0) {
    causas.push(`Sin datos para calcular: ${crucesSinDatos.slice(0, 2).join(', ')}`);
  }

  if (causas.length === 0 && Object.keys(resultadosCruces).length > 0) {
    causas.push(`Propiedades de ${contexto} dentro de rangos normales — índice: ${indiceGlobal.toFixed(1)}/100`);
  }

  // 6. Buscar soluciones desde reglas_mejora
  const propConProblema = Object.entries(resultadosCruces)
    .filter(([, v]) => v > 70)
    .map(([k]) => k);

  const soluciones: string[] = [];

  if (propConProblema.length > 0) {
    const { data: reglasData } = await supabase
      .from('reglas_mejora')
      .select('*')
      .in('neurona_id', propConProblema.map(p => `N_${p.toUpperCase()}_001`))
      .limit(3);

    for (const regla of (reglasData ?? []) as any[]) {
      soluciones.push(regla.solucion);
    }
  }

  // 7. Buscar principios TRIZ para las contradicciones detectadas
  const triz: string[] = [];

  // Encontrar propiedades con valores extremos (problema y su opuesto)
  const propAltas = Object.entries(resultadosCruces)
    .filter(([, v]) => v > 65)
    .map(([k]) => k);

  if (propAltas.length > 0) {
    const { data: trizData } = await supabase
      .from('triz_contradicciones')
      .select('nombres_principios, param_triz_mejora, param_triz_empeora')
      .limit(50);

    for (const contradiccion of (trizData ?? []) as TrizContradicion[]) {
      const mejora = Array.isArray(contradiccion.propiedades_mejora)
        ? contradiccion.propiedades_mejora
        : JSON.parse(contradiccion.propiedades_mejora as any ?? '[]');

      const matchea = propAltas.some(p =>
        mejora.some((m: string) => m.toLowerCase().includes(p.toLowerCase().replace('idx_', '')))
      );

      if (matchea && contradiccion.nombres_principios) {
        const principios = Array.isArray(contradiccion.nombres_principios)
          ? contradiccion.nombres_principios
          : JSON.parse(contradiccion.nombres_principios as any ?? '[]');

        for (const p of principios.slice(0, 2)) {
          if (!triz.includes(p)) triz.push(p);
        }
      }
      if (triz.length >= 4) break;
    }
  }

  // 8. Buscar reglas de mezcla para soluciones adicionales
  if (soluciones.length < 2) {
    const { data: mezclaData } = await supabase
      .from('reglas_mezcla')
      .select('propiedad_nombre, descripcion')
      .limit(10);

    for (const regla of (mezclaData ?? []) as ReglaMezcla[]) {
      const propVec = vector[regla.propiedad_nombre];
      if (propVec !== null && propVec !== undefined) {
        if (contexto === 'absorcion' && Number(propVec) > 50) {
          soluciones.push(`Aplicar regla de mezcla para ${regla.propiedad_nombre}: ${regla.descripcion}`);
        } else if (contexto === 'fragilidad' && Number(propVec) < 30) {
          soluciones.push(`Refuerzo por ${regla.propiedad_nombre}: ${regla.descripcion}`);
        }
      }
      if (soluciones.length >= 3) break;
    }
  }

  if (soluciones.length === 0) {
    if (cobertura < 0.4) {
      soluciones.push('Completar propiedades en NORMALIZACION para análisis más preciso');
    } else {
      soluciones.push(`Material presenta comportamiento aceptable en ${contexto}`);
    }
  }

  return {
    indice: Math.round(indiceGlobal * 10) / 10,
    cobertura,
    causas,
    soluciones,
    triz,
    detalle: detalleCalculo,
  };
}

// ─── PROCESAR TRABAJO ─────────────────────────────────────────────────────────
async function procesarTrabajo(trabajo: any): Promise<void> {
  const { id, producto, material_id, contexto } = trabajo;
  console.log(`\n⚙️  Procesando trabajo ${id} — ${producto} (${contexto})`);

  await supabase
    .from('trabajos')
    .update({ estado: 'procesando', actualizado_en: new Date().toISOString() })
    .eq('id', id);

  try {
    // 1. Sincronizar Google Sheets → Supabase
    console.log('   📥 Sincronizando NORMALIZACION desde Google Sheets...');
    await syncMaterialesToSupabase();

    // 2. Leer vector del material desde Supabase
    console.log(`   📊 Leyendo vector de ${material_id}...`);
    const { data: vectorRows } = await supabase
      .from('materiales_vectores')
      .select('*')
      .eq('id_material', material_id);

    if (!vectorRows || vectorRows.length === 0) {
      throw new Error(`No se encontró el material ${material_id} en Supabase`);
    }

    // Tomar la fila con MÁS propiedades numéricas no nulas
    // Cuenta solo columnas de propiedades físicas (no id, fechas, etc.)
    const COLS_EXCLUIR = new Set(['id_material', 'actualizado_en', 'id', 'estado', 'creado_en']);
    const contarProps = (fila: any) =>
      Object.entries(fila)
        .filter(([k, v]) => !COLS_EXCLUIR.has(k) && v !== null && v !== undefined && !isNaN(Number(v)))
        .length;

    const vectorData = vectorRows.sort((a, b) => contarProps(b) - contarProps(a))[0];
    const propConDatos = contarProps(vectorData);
    console.log(`   📊 Fila seleccionada: ${propConDatos} propiedades con datos`);
    console.log(`   📊 Muestra: absorcion_agua=${vectorData.absorcion_agua}, porosidad_total=${vectorData.porosidad_total}, resistencia_compresion=${vectorData.resistencia_compresion}`);

    const vector = vectorData as Record<string, number | null>;

    // 3. Ejecutar motor neuronal con cruces científicos reales
    console.log(`   🧠 Ejecutando motor neuronal para contexto: ${contexto}...`);
    const resultado = await analizarMaterial(material_id, contexto, vector);

    console.log(`   📊 Índice real (${contexto}): ${resultado.indice}/100`);
    console.log(`   📊 Cobertura: ${Math.round(resultado.cobertura * 100)}%`);
    console.log(`   📊 Detalle cruces: ${JSON.stringify(resultado.detalle)}`);
    if (resultado.triz.length > 0) {
      console.log(`   🔧 Principios TRIZ: ${resultado.triz.join(', ')}`);
    }

    // 4. Guardar resultado
    const { data: resultadoGuardado, error: errorResultado } = await supabase
      .from('resultados')
      .insert({
        producto,
        problema_detectado: `Análisis de ${contexto} — índice: ${resultado.indice}/100 (cobertura ${Math.round(resultado.cobertura * 100)}%)`,
        causas_fisicas:      resultado.causas.slice(0, 5),
        soluciones_propuestas: [
          ...resultado.soluciones.slice(0, 3),
          ...(resultado.triz.length > 0
            ? [`Principios TRIZ aplicables: ${resultado.triz.slice(0, 3).join(', ')}`]
            : []),
        ].slice(0, 5),
        compatibilidades:    [],
        mejoras:             resultado.triz.slice(0, 3),
        confianza_general:   Math.round(resultado.cobertura * 100) / 100,
        neuronas_activadas:  Object.keys(resultado.detalle).length,
        inferencias_generadas: resultado.causas.length,
        coherencia_global:   resultado.indice / 100,
        propiedades_pendientes: [],
        fecha:               new Date().toISOString(),
      })
      .select('id')
      .single();

    if (errorResultado || !resultadoGuardado) {
      throw new Error(`Error guardando resultado: ${errorResultado?.message}`);
    }

    await supabase
      .from('trabajos')
      .update({
        estado:         'completado',
        resultado_id:   resultadoGuardado.id,
        actualizado_en: new Date().toISOString(),
      })
      .eq('id', id);

    console.log(`   ✅ Completado → resultado ${resultadoGuardado.id}`);
    console.log(`      Índice real: ${resultado.indice}/100`);
    console.log(`      Cruces calculados: ${Object.keys(resultado.detalle).length}`);

  } catch (err: any) {
    console.error(`   ❌ Error:`, err.message);
    await supabase
      .from('trabajos')
      .update({ estado: 'error', error_msg: err.message, actualizado_en: new Date().toISOString() })
      .eq('id', id);
  }
}

// ─── LOOP PRINCIPAL ───────────────────────────────────────────────────────────
async function revisarPendientes(): Promise<void> {
  const { data, error } = await supabase
    .from('trabajos')
    .select('*')
    .eq('estado', 'pendiente')
    .order('creado_en', { ascending: true })
    .limit(1);

  if (error) { console.error('Error leyendo trabajos:', error.message); return; }
  if (data && data.length > 0) await procesarTrabajo(data[0]);
}

console.log('═══════════════════════════════════════════');
console.log('🧠 IMPULSO IA — Worker de trabajos activo');
console.log('   Motor neuronal con cruces científicos reales');
console.log('   Escuchando tabla "trabajos" en Supabase');
console.log('═══════════════════════════════════════════\n');

revisarPendientes();
setInterval(revisarPendientes, 5000);