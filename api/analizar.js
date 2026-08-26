// api/analizar.js
// Endpoint invocable UNA VEZ (sin loop) — Motor B con cruces científicos reales.
// Lee materiales_vectores/cruces_cientificos/reglas_mejora/triz_contradicciones/reglas_mezcla.
// Escribe en resultados. Usa SUPABASE_SERVICE_ROLE_KEY (nunca la anon key).

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function evaluarFormula(formula, vector) {
  try {
    const vars = {};
    for (const [key, val] of Object.entries(vector)) {
      if (val !== null && val !== undefined && !isNaN(Number(val))) {
        vars[`idx_${key}`] = Number(val);
      }
    }
    const varsEnFormula = formula.match(/idx_\w+/g) ?? [];
    for (const v of varsEnFormula) {
      if (vars[v] === undefined) return null;
    }
    let expr = formula
      .replace(/LEAST\(([^)]+)\)/g, 'Math.min($1)')
      .replace(/GREATEST\(([^)]+)\)/g, 'Math.max($1)');
    const fn = new Function(...Object.keys(vars), `return ${expr}`);
    const resultado = fn(...Object.values(vars));
    if (isNaN(resultado) || !isFinite(resultado)) return null;
    return Math.max(0, Math.min(100, resultado));
  } catch {
    return null;
  }
}

async function analizarMaterial(supabase, materialId, contexto, vector) {
  const { data: problemaData } = await supabase
    .from('problemas').select('*')
    .eq('nombre_problema', contexto).eq('activo', true).single();
  const problema = problemaData;

  const { data: crucesData } = await supabase
    .from('cruces_cientificos').select('*')
    .eq('problema', contexto).eq('activo', true);
  const cruces = crucesData ?? [];

  const resultadosCruces = {};
  const crucesSinDatos = [];
  for (const cruce of cruces) {
    const valor = evaluarFormula(cruce.formula, vector);
    if (valor !== null) resultadosCruces[cruce.nombre_cruce] = valor;
    else crucesSinDatos.push(cruce.descripcion);
  }

  let indiceGlobal = 0, pesoTotal = 0;
  const detalleCalculo = {};
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
    const vals = Object.values(resultadosCruces);
    if (vals.length > 0) {
      indiceGlobal = vals.reduce((a, b) => a + b, 0) / vals.length;
      Object.assign(detalleCalculo, resultadosCruces);
    }
  }

  const cobertura = cruces.length > 0 ? Object.keys(resultadosCruces).length / cruces.length : 0;

  const causas = [];
  for (const [nombreCruce, valor] of Object.entries(resultadosCruces)) {
    const cruce = cruces.find((c) => c.nombre_cruce === nombreCruce);
    if (!cruce) continue;
    if (valor > 70) causas.push(`${cruce.descripcion}: índice elevado (${valor.toFixed(1)}/100) — indica problema real`);
    else if (valor < 20 && contexto !== 'aislamiento_termico') causas.push(`${cruce.descripcion}: índice bajo (${valor.toFixed(1)}/100) — propiedad deficiente`);
  }
  if (crucesSinDatos.length > 0) causas.push(`Sin datos para calcular: ${crucesSinDatos.slice(0, 2).join(', ')}`);
  if (causas.length === 0 && Object.keys(resultadosCruces).length > 0) causas.push(`Propiedades de ${contexto} dentro de rangos normales — índice: ${indiceGlobal.toFixed(1)}/100`);

  const propConProblema = Object.entries(resultadosCruces).filter(([, v]) => v > 70).map(([k]) => k);
  const soluciones = [];
  if (propConProblema.length > 0) {
    const { data: reglasData } = await supabase
      .from('reglas_mejora').select('*')
      .in('neurona_id', propConProblema.map((p) => `N_${p.toUpperCase()}_001`)).limit(3);
    for (const regla of reglasData ?? []) soluciones.push(regla.solucion);
  }

  const triz = [];
  const propAltas = Object.entries(resultadosCruces).filter(([, v]) => v > 65).map(([k]) => k);
  if (propAltas.length > 0) {
    const { data: trizData } = await supabase
      .from('triz_contradicciones')
      .select('nombres_principios, param_triz_mejora, param_triz_empeora')
      .limit(50);
    for (const contradiccion of trizData ?? []) {
      const mejora = Array.isArray(contradiccion.propiedades_mejora)
        ? contradiccion.propiedades_mejora
        : JSON.parse(contradiccion.propiedades_mejora ?? '[]');
      const matchea = propAltas.some((p) => mejora.some((m) => m.toLowerCase().includes(p.toLowerCase().replace('idx_', ''))));
      if (matchea && contradiccion.nombres_principios) {
        const principios = Array.isArray(contradiccion.nombres_principios)
          ? contradiccion.nombres_principios
          : JSON.parse(contradiccion.nombres_principios ?? '[]');
        for (const p of principios.slice(0, 2)) if (!triz.includes(p)) triz.push(p);
      }
      if (triz.length >= 4) break;
    }
  }

  if (soluciones.length < 2) {
    const { data: mezclaData } = await supabase.from('reglas_mezcla').select('propiedad_nombre, descripcion').limit(10);
    for (const regla of mezclaData ?? []) {
      const propVec = vector[regla.propiedad_nombre];
      if (propVec !== null && propVec !== undefined) {
        if (contexto === 'absorcion' && Number(propVec) > 50) soluciones.push(`Aplicar regla de mezcla para ${regla.propiedad_nombre}: ${regla.descripcion}`);
        else if (contexto === 'fragilidad' && Number(propVec) < 30) soluciones.push(`Refuerzo por ${regla.propiedad_nombre}: ${regla.descripcion}`);
      }
      if (soluciones.length >= 3) break;
    }
  }
  if (soluciones.length === 0) {
    soluciones.push(cobertura < 0.4
      ? 'Completar propiedades en NORMALIZACION para análisis más preciso'
      : `Material presenta comportamiento aceptable en ${contexto}`);
  }

  return { indice: Math.round(indiceGlobal * 10) / 10, cobertura, causas, soluciones, triz, detalle: detalleCalculo };
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Método no permitido. Usar POST.' }); return; }
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    res.status(500).json({ error: 'Faltan variables de entorno SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en Vercel.' });
    return;
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { trabajoId, producto, material_id, contexto } = body;

    let productoFinal = producto, materialIdFinal = material_id, contextoFinal = contexto;

    if (trabajoId) {
      const { data: trabajo, error: errorTrabajo } = await supabase.from('trabajos').select('*').eq('id', trabajoId).single();
      if (errorTrabajo || !trabajo) { res.status(404).json({ error: `No se encontró el trabajo ${trabajoId}` }); return; }
      productoFinal = trabajo.producto; materialIdFinal = trabajo.material_id; contextoFinal = trabajo.contexto;
      await supabase.from('trabajos').update({ estado: 'procesando', actualizado_en: new Date().toISOString() }).eq('id', trabajoId);
    }

    if (!productoFinal || !materialIdFinal || !contextoFinal) {
      res.status(400).json({ error: 'Faltan datos: producto, material_id y contexto (o pasar trabajoId).' });
      return;
    }

    const { data: vectorRows, error: errorVector } = await supabase
      .from('materiales_vectores').select('*').eq('id_material', materialIdFinal);

    if (errorVector || !vectorRows || vectorRows.length === 0) {
      const msg = `Información insuficiente: no hay vector real para ${materialIdFinal} en materiales_vectores.`;
      if (trabajoId) await supabase.from('trabajos').update({ estado: 'error', error_msg: msg, actualizado_en: new Date().toISOString() }).eq('id', trabajoId);
      res.status(404).json({ error: msg });
      return;
    }

    const COLS_EXCLUIR = new Set(['id_material', 'actualizado_en', 'id', 'estado', 'creado_en']);
    const contarProps = (fila) => Object.entries(fila).filter(([k, v]) => !COLS_EXCLUIR.has(k) && v !== null && v !== undefined && !isNaN(Number(v))).length;
    const vector = vectorRows.sort((a, b) => contarProps(b) - contarProps(a))[0];

    const resultado = await analizarMaterial(supabase, materialIdFinal, contextoFinal, vector);

    const { data: resultadoGuardado, error: errorResultado } = await supabase
      .from('resultados')
      .insert({
        producto: productoFinal,
        problema_detectado: `Análisis de ${contextoFinal} — índice: ${resultado.indice}/100 (cobertura ${Math.round(resultado.cobertura * 100)}%)`,
        causas_fisicas: resultado.causas.slice(0, 5),
        soluciones_propuestas: [...resultado.soluciones.slice(0, 3), ...(resultado.triz.length > 0 ? [`Principios TRIZ aplicables: ${resultado.triz.slice(0, 3).join(', ')}`] : [])].slice(0, 5),
        compatibilidades: [],
        mejoras: resultado.triz.slice(0, 3),
        confianza_general: Math.round(resultado.cobertura * 100) / 100,
        neuronas_activadas: Object.keys(resultado.detalle).length,
        inferencias_generadas: resultado.causas.length,
        coherencia_global: resultado.indice / 100,
        propiedades_pendientes: [],
        fecha: new Date().toISOString(),
      })
      .select('id').single();

    if (errorResultado || !resultadoGuardado) {
      const msg = `Error guardando resultado: ${errorResultado?.message}`;
      if (trabajoId) await supabase.from('trabajos').update({ estado: 'error', error_msg: msg, actualizado_en: new Date().toISOString() }).eq('id', trabajoId);
      res.status(500).json({ error: msg });
      return;
    }

    if (trabajoId) {
      await supabase.from('trabajos').update({ estado: 'completado', resultado_id: resultadoGuardado.id, actualizado_en: new Date().toISOString() }).eq('id', trabajoId);
    }

    res.status(200).json({ ok: true, resultado_id: resultadoGuardado.id, indice: resultado.indice, cobertura: resultado.cobertura, causas: resultado.causas, soluciones: resultado.soluciones, triz: resultado.triz });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error interno' });
  }
};
