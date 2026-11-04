import express from 'express';
import { timingSafeEqual } from 'crypto';
import * as dotenv from 'dotenv';
import path from 'path';
import { ALL_NEURONS } from './neurons/index';
import { activarNeuronas } from './core/activationEngine';
import { getVectorFromSheet, listarMaterialesDesdeSheet } from './sheets/syncData';
import { supabase } from './supabase/client';
import { MotorInferencia } from './inference/MotorInferencia';
import { analyzeWithLlamaMotherBrain } from './neurons/ai/motherBrain';

dotenv.config();

const app = express();
const PORT = Number(process.env.INTERNAL_PORT || 3000);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'public')));

interface Producto {
  id: string | number;
  nombre: string;
  material_id: string;
  contexto?: string | null;
  activo?: boolean;
}

async function obtenerProductosActivos(): Promise<Producto[]> {
  const { data, error } = await supabase
    .from('productos')
    .select('id, nombre, material_id, contexto, activo')
    .eq('activo', true)
    .order('id', { ascending: true });
  if (error) throw new Error(`No se pudieron leer productos de Supabase: ${error.message}`);
  return (data ?? []) as Producto[];
}

async function resolverProducto(id: string): Promise<Producto | null> {
  const productos = await obtenerProductosActivos();
  const buscado = id.trim().toUpperCase();
  return productos.find(p =>
    String(p.id).trim().toUpperCase() === buscado ||
    String(p.material_id).trim().toUpperCase() === buscado
  ) ?? null;
}

const MAYOR_ES_PEOR = new Set([
  'absorcion_agua', 'porosidad_total', 'indice_vacios_e', 'indice_vacios',
  'permeabilidad_intrinseca', 'conductividad_hidraulica', 'difusion_agua',
  'difusion_gases', 'difusion_ionica', 'conductividad_termica', 'expansion_termica',
  'huella_carbono', 'energia_incorporada', 'no_reciclable', 'blandura',
  'coef_deslizamiento', 'deflectabilidad', 'compresibilidad', 'sensibilidad_termica',
  'contraccion_termica', 'temperatura_falla'
]);
const MENOR_ES_PEOR = new Set([
  'resistencia_compresion', 'resistencia_traccion', 'resistencia_flexion',
  'modulo_young', 'modulo_corte', 'modulo_volumetrico', 'cohesion', 'dureza_mohs',
  'angulo_friccion', 'temperatura_servicio', 'impermeabilidad', 'indice_solidos',
  'resistencia_matriz', 'resistividad_hidraulica', 'resistencia_difusion',
  'resistencia_gases', 'resistencia_ionica', 'estabilidad_cohesiva', 'reciclabilidad'
]);

function nivelProblema(prop: string, valor: number): string | null {
  const p = prop.toLowerCase();
  if (MAYOR_ES_PEOR.has(p)) {
    if (valor >= 90) return 'CRITICO';
    if (valor >= 80) return 'ALTO';
    if (valor >= 70) return 'MODERADO';
    return null;
  }
  if (MENOR_ES_PEOR.has(p)) {
    if (valor <= 10) return 'CRITICO';
    if (valor <= 15) return 'ALTO';
    if (valor <= 20) return 'MODERADO';
    return null;
  }
  return valor >= 80 ? 'ALTO' : null;
}

app.get('/api/products', async (_req, res) => {
  try {
    const [productos, materiales] = await Promise.all([obtenerProductosActivos(), listarMaterialesDesdeSheet()]);
    const ids = new Set(materiales.map(id => id.trim().toUpperCase()));
    res.json(productos.map(p => ({
      id: p.id, nombre: p.nombre, materialId: p.material_id,
      contexto: p.contexto ?? 'general', vectorDisponible: ids.has(String(p.material_id).trim().toUpperCase())
    })));
  } catch (error) {
    console.error('GET /api/products:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await resolverProducto(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Producto/material no encontrado en Supabase.' });
    const vector = await getVectorFromSheet(product.material_id);
    res.json({ success: true, product: { ...product, materialId: product.material_id, vectorDisponible: vector !== null, vector: vector ?? null } });
  } catch (error) {
    console.error('GET /api/products/:id:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

/**
 * Diagnóstico integral REAL para Impulso Vector.
 * Una sola llamada activa todas las neuronas con datos, detecta problemas,
 * ejecuta todos los problemas científicos configurados, y devuelve las
 * fuentes registradas de mejoras, fórmulas, cruces y TRIZ.
 */
app.post('/api/analizar', async (req, res) => {
  try {
    // Aceptar tanto IDs JSON numéricos como strings y también material_id/materialId.
    // Impulso Vector envía productId como número en su petición real.
    const rawId = req.body?.productId ?? req.body?.material_id ?? req.body?.materialId;
    const requestedId = rawId === undefined || rawId === null ? '' : String(rawId).trim();
    if (!requestedId) return res.status(400).json({ ok: false, error: 'productId, material_id o materialId es obligatorio.' });

    const product = await resolverProducto(requestedId);
    if (!product) return res.status(404).json({ ok: false, error: 'Producto/material no encontrado en Supabase.' });

    const materialId = String(product.material_id ?? '').trim();
    if (!/^M\.\d+$/i.test(materialId)) {
      return res.status(422).json({ ok: false, error: `material_id inválido: "${materialId}". NORMALIZACION usa IDs M.xxx.`, producto: { id: product.id, nombre: product.nombre, materialId } });
    }

    const contexto = typeof req.body?.contexto === 'string' && req.body.contexto.trim() ? req.body.contexto.trim().toLowerCase() : 'general';
    const estado = typeof req.body?.estado === 'string' ? req.body.estado : undefined;

    // Modalidad IA autónoma: no ejecuta el motor anterior ni lee Google Sheets.
    // El broker servidor consulta Turso dedicado y Llama coordina las neuronas clonadas.
    if (req.body?.includeAiNeurons === true) {
      const expectedToken = process.env.ARKON_BRIDGE_TOKEN?.trim();
      const providedToken = String(req.header('x-arkon-token') ?? '').trim();
      const expectedBytes = Buffer.from(expectedToken ?? '');
      const providedBytes = Buffer.from(providedToken);
      const tokenMatches = Boolean(expectedToken && providedToken && expectedBytes.length === providedBytes.length && timingSafeEqual(expectedBytes, providedBytes));
      const authorized = process.env.NODE_ENV !== 'production' ? (!expectedToken || tokenMatches) : tokenMatches;
      if (!authorized) return res.status(401).json({ ok: false, error: 'Modalidad IA no autorizada.' });

      const [rulesResult, formulasResult, crossesResult, trizResult] = await Promise.all([
        supabase.from('reglas_mejora').select('*').limit(300),
        supabase.from('scientific_formulas').select('*').limit(500),
        supabase.from('cruces_cientificos').select('*').eq('activo', true).limit(300),
        supabase.from('triz_contradicciones').select('*').eq('activo', true).limit(500),
      ]);
      const neuronIds = Array.isArray(req.body?.neuronIds)
        ? req.body.neuronIds.filter((id: unknown): id is string => typeof id === 'string')
        : (typeof req.body?.propertyName === 'string' ? [req.body.propertyName] : undefined);
      const aiNeurons = await analyzeWithLlamaMotherBrain({
        productName: product.nombre,
        productId: product.id,
        materialId,
        stateCode: estado ?? null,
        stateName: typeof req.body?.estadoNombre === 'string' ? req.body.estadoNombre : (typeof req.body?.stateName === 'string' ? req.body.stateName : null),
        neuronIds,
        currentProperties: {},
        scientificContext: {
          rules: rulesResult.data ?? [],
          formulas: formulasResult.data ?? [],
          scientificCrosses: crossesResult.data ?? [],
          triz: trizResult.data ?? [],
        },
      });
      return res.json({
        ok: true,
        motor: 'ARKON AI · Llama + Turso dedicado',
        fuente: 'Turso ND dedicado + Supabase científico',
        modalidad: 'ai-neurons',
        producto: { id: product.id, nombre: product.nombre, materialId, contexto },
        neuronasIA: aiNeurons,
        resultado: aiNeurons,
      });
    }

    const vector = await getVectorFromSheet(materialId);
    if (!vector) return res.status(422).json({ ok: false, error: `No existe vector real en NORMALIZACION para ${materialId}.`, producto: { id: product.id, nombre: product.nombre, materialId } });

    const activacion = await activarNeuronas(materialId, 'general', estado);

    const problemasDetectados = activacion.neuronasActivadas
      .map(n => ({
        neuronId: n.neuronId,
        propertyName: n.propertyName,
        valor: n.valorCompuesto,
        confianza: n.confianza,
        nivel: nivelProblema(n.propertyName, n.valorCompuesto),
        anomalias: n.anomalias ?? [],
      }))
      .filter(x => x.nivel !== null)
      .sort((a, b) => ({ CRITICO: 0, ALTO: 1, MODERADO: 2 } as Record<string, number>)[a.nivel!] - ({ CRITICO: 0, ALTO: 1, MODERADO: 2 } as Record<string, number>)[b.nivel!]);

    const propsProblema = problemasDetectados.map(p => p.propertyName);
    const disponibles = new Set(activacion.neuronasActivadas.map(n => n.propertyName));

    const { data: problemasConfig, error: problemasError } = await supabase
      .from('problemas').select('*').order('nombre_problema', { ascending: true });
    if (problemasError) console.warn('⚠️ No se pudieron cargar problemas:', problemasError.message);

    const analisisProblemas: any[] = [];
    for (const problema of problemasConfig ?? []) {
      const nombre = String(problema.nombre_problema ?? '').trim();
      if (!nombre) continue;
      try {
        const motor = new MotorInferencia();
        const resultado = await motor.analizarProblema(nombre, {
          materialId,
          estado: estado === 'E02' || estado === 'E03' ? estado : 'E01',
          componentes: [],
        });
        analisisProblemas.push({ nombreProblema: nombre, ok: true, resultado });
      } catch (error) {
        analisisProblemas.push({ nombreProblema: nombre, ok: false, error: error instanceof Error ? error.message : String(error) });
      }
    }

    const { data: reglas, error: reglasError } = await supabase
      .from('reglas_mejora')
      .select('neurona_id,condicion,solucion,prioridad')
      .order('prioridad', { ascending: false }).limit(200);
    if (reglasError) console.warn('⚠️ No se pudieron cargar reglas_mejora:', reglasError.message);

    const solucionesReglas = (reglas ?? []).filter((r: any) => {
      const texto = `${r.neurona_id ?? ''} ${r.condicion ?? ''}`.toLowerCase();
      return propsProblema.some(p => texto.includes(p.toLowerCase())) && r.solucion;
    }).slice(0, 12);

    const { data: mejoras, error: mejorasError } = await supabase
      .from('mejoras').select('problema,causa,solucion,material_sugerido,contexto,productos_aplicables')
      .eq('activo', true).limit(300);
    if (mejorasError) console.warn('⚠️ No se pudieron cargar mejoras:', mejorasError.message);

    const mejorasReales = (mejoras ?? []).filter((m: any) => {
      const texto = [m.problema, m.causa, m.contexto, m.material_sugerido].filter(Boolean).join(' ').toLowerCase();
      return propsProblema.some(p => texto.includes(p.toLowerCase())) || texto.includes('yeso');
    }).slice(0, 12);

    const { data: formulas, error: formulasError } = await supabase
      .from('scientific_formulas').select('id,nombre,descripcion,propiedad_a,propiedad_b,tipo_relacion,ecuacion,forma_computable,variables_input,output_nombre,output_unidad,dominio_fisico,rango_valido,peso_cientifico,confianza,fuente').limit(500);
    if (formulasError) console.warn('⚠️ No se pudieron cargar scientific_formulas:', formulasError.message);

    const formulasRelacionadas = (formulas ?? []).filter((f: any) => {
      const pa = String(f.propiedad_a ?? '').toLowerCase();
      const pb = String(f.propiedad_b ?? '').toLowerCase();
      return propsProblema.some(p => pa.includes(p.toLowerCase()) || pb.includes(p.toLowerCase()));
    }).slice(0, 50);

    const { data: cruces, error: crucesError } = await supabase
      .from('cruces_cientificos').select('nombre_cruce,propiedades_requeridas,formula,descripcion,problema,activo').eq('activo', true).limit(300);
    if (crucesError) console.warn('⚠️ No se pudieron cargar cruces_cientificos:', crucesError.message);

    const crucesDisponibles = (cruces ?? []).map((c: any) => {
      const requeridas = Array.isArray(c.propiedades_requeridas) ? c.propiedades_requeridas.map(String) : [];
      const presentes = requeridas.filter((p: string) => disponibles.has(p));
      const faltantes = requeridas.filter((p: string) => !disponibles.has(p));
      return { ...c, presentes, faltantes, coberturaPorc: requeridas.length ? presentes.length / requeridas.length * 100 : 0, evaluable: requeridas.length > 0 && faltantes.length === 0 };
    }).filter((c: any) => c.presentes.length > 0).sort((a: any, b: any) => b.coberturaPorc - a.coberturaPorc).slice(0, 100);

    const { data: triz, error: trizError } = await supabase
      .from('triz_contradicciones').select('param_triz_mejora,param_triz_empeora,propiedades_mejora,propiedades_empeora,nombres_principios').eq('activo', true).limit(500);
    if (trizError) console.warn('⚠️ No se pudieron cargar triz_contradicciones:', trizError.message);

    const trizRelacionadas = (triz ?? []).filter((t: any) => {
      const props = [...(Array.isArray(t.propiedades_mejora) ? t.propiedades_mejora : []), ...(Array.isArray(t.propiedades_empeora) ? t.propiedades_empeora : [])].map(String).join(' ').toLowerCase();
      return propsProblema.some(p => props.includes(p.toLowerCase()));
    }).slice(0, 50);

    // Capa IA opcional y aditiva. El motor numérico actual y sus 100 neuronas
    // no se reemplazan ni se modifican. El token solo autoriza esta rama.
    let aiNeurons: any = null;
    if (req.body?.includeAiNeurons === true) {
      const expectedToken = process.env.ARKON_BRIDGE_TOKEN?.trim();
      const providedToken = String(req.header('x-arkon-token') ?? '').trim();
      const expectedBytes = Buffer.from(expectedToken ?? '');
      const providedBytes = Buffer.from(providedToken);
      const tokenMatches = Boolean(expectedToken && providedToken && expectedBytes.length === providedBytes.length && timingSafeEqual(expectedBytes, providedBytes));
      const authorized = process.env.NODE_ENV !== 'production'
        ? (!expectedToken || tokenMatches)
        : tokenMatches;

      if (!authorized) {
        aiNeurons = {
          enabled: true, status: 'unauthorized', provider: 'Cloudflare Workers AI',
          readOnly: true, writesToSupabase: false,
          message: 'La rama de neuronas IA requiere el token servidor-a-servidor configurado en ARKON y Vercel.',
        };
      } else {
        const currentProperties: Record<string, unknown> = {};
        for (const n of activacion.neuronasActivadas) {
          currentProperties[n.propertyName] = { value: n.valorCompuesto, confidence: n.confianza, neuronId: n.neuronId };
        }
        aiNeurons = await analyzeWithLlamaMotherBrain({
          productName: product.nombre,
          productId: product.id,
          materialId,
          stateCode: estado ?? null,
          stateName: typeof req.body?.estadoNombre === 'string' ? req.body.estadoNombre : (typeof req.body?.stateName === 'string' ? req.body.stateName : null),
          neuronIds: Array.isArray(req.body?.neuronIds) ? req.body.neuronIds.filter((id: unknown): id is string => typeof id === 'string').slice(0, 12) : undefined,
          currentProperties,
          scientificContext: {
            rules: [...(reglas ?? []), ...(mejoras ?? [])],
            formulas: formulas ?? [],
            scientificCrosses: cruces ?? [],
            triz: triz ?? [],
          },
        });
      }
    }

    const anomalias = activacion.neuronasActivadas.flatMap((n: any) => (n.anomalias ?? []).map((a: any) => ({ neuronId: n.neuronId, propertyName: n.propertyName, detalle: String(a) })));
    const errores = [
      ...anomalias.map((a: any) => `${a.propertyName}: ${a.detalle}`),
      ...activacion.propiedadesPendientes.map(prop => `Sin dato real en NORMALIZACION: ${prop}`),
      ...analisisProblemas.filter(p => !p.ok).map(p => `${p.nombreProblema}: ${p.error}`),
    ];

    return res.json({
      ok: true,
      motor: 'ARKON REAL',
      fuente: 'Supabase + Google Sheets NORMALIZACION',
      producto: { id: product.id, nombre: product.nombre, materialId, contexto: product.contexto ?? contexto },
      diagnosticoIntegral: {
        cobertura: { neuronasConDatos: activacion.neuronasConDatos, totalNeuronas: activacion.totalNeuronas, coberturaPorc: activacion.coberturaPorc, confianzaPromedio: activacion.confianzaPromedio },
        problemasDetectados,
        anomalias,
        propiedadesPendientes: activacion.propiedadesPendientes,
        soluciones: { reglas_mejora: solucionesReglas, mejoras: mejorasReales },
        formulas: formulasRelacionadas,
        cruces: crucesDisponibles,
        triz: trizRelacionadas,
        analisisProblemas,
        ...(aiNeurons ? { neuronasIA: aiNeurons } : {}),
        resumen: {
          neuronasConDatos: activacion.neuronasConDatos,
          totalNeuronas: activacion.totalNeuronas,
          problemas: problemasDetectados.length,
          anomalías: anomalias.length,
          propiedadesFaltantes: activacion.propiedadesPendientes.length,
          formulasEncontradas: formulasRelacionadas.length,
          crucesUtilizables: crucesDisponibles.filter((c: any) => c.evaluable).length,
          trizEncontrados: trizRelacionadas.length,
        },
      },
      materiales: [{ materialId, resultado: { ...activacion, errores, mejoras: mejorasReales, reglasMejora: solucionesReglas, formulas: formulasRelacionadas, cruces: crucesDisponibles, triz: trizRelacionadas, analisisProblemas } }],
      resultado: { activacion, problemasDetectados, anomalias, errores, propiedadesPendientes: activacion.propiedadesPendientes, soluciones: { reglas_mejora: solucionesReglas, mejoras: mejorasReales }, formulas: formulasRelacionadas, cruces: crucesDisponibles, triz: trizRelacionadas, analisisProblemas, ...(aiNeurons ? { neuronasIA: aiNeurons } : {}) },
      ...(aiNeurons ? { aiNeurons } : {}),
    });
  } catch (error) {
    console.error('POST /api/analizar:', error);
    return res.status(500).json({ ok: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.post('/api/analyze-product', async (req, res) => {
  try {
    const requestedId = typeof req.body?.id === 'string' ? req.body.id : (typeof req.body?.materialId === 'string' ? req.body.materialId : '');
    if (!requestedId.trim()) return res.status(400).json({ success: false, error: 'id o materialId es obligatorio.' });
    const product = await resolverProducto(requestedId);
    if (!product) return res.status(404).json({ success: false, error: 'Producto/material no encontrado en Supabase.' });
    const materialId = String(product.material_id).trim();
    if (!/^M\.\d+$/i.test(materialId)) return res.status(422).json({ success: false, error: `material_id inválido: "${materialId}".` });
    const contexto = typeof req.body?.contexto === 'string' ? req.body.contexto : (product.contexto ?? 'general');
    const estado = typeof req.body?.estado === 'string' ? req.body.estado : undefined;
    const resultado = await activarNeuronas(materialId, contexto, estado);
    return res.json({ success: true, producto: { id: product.id, nombre: product.nombre, materialId, contexto }, resultado });
  } catch (error) {
    console.error('POST /api/analyze-product:', error);
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.post('/api/neural-analysis', async (req, res) => {
  const materialId = typeof req.body?.materialId === 'string' ? req.body.materialId.trim() : '';
  const contexto = typeof req.body?.contexto === 'string' ? req.body.contexto : 'general';
  const estado = typeof req.body?.estado === 'string' ? req.body.estado : undefined;
  if (!/^M\.\d+$/i.test(materialId)) return res.status(400).json({ success: false, error: 'materialId debe ser un ID real de NORMALIZACION con formato M.xxx.' });
  try {
    const resultado = await activarNeuronas(materialId, contexto, estado);
    return res.json({ ok: true, motor: 'ARKON activationEngine', ...resultado });
  } catch (error) {
    console.error('POST /api/neural-analysis:', error);
    return res.status(500).json({ ok: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.post('/api/evaluate-proposal', async (_req, res) => {
  return res.status(501).json({ success: false, error: 'Evaluación de propuestas todavía no está implementada en el motor real; no se devuelve un resultado inventado.' });
});

app.get('/api/neurons', (_req, res) => {
  res.json(ALL_NEURONS.map(n => ({ name: n.constructor.name, propertyName: n.propertyName, group: n.group, unit: n.unidadReferencia })));
});

app.listen(PORT, () => console.log(`✅ ARKON Neural Engine Server running on port ${PORT}`));
