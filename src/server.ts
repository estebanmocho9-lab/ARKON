import express from 'express';
import * as dotenv from 'dotenv';
import path from 'path';
import { ALL_NEURONS } from './neurons/index';
import { activarNeuronas } from './core/activationEngine';
import { getVectorFromSheet, listarMaterialesDesdeSheet } from './sheets/syncData';
import { supabase } from './supabase/client';
import { MotorInferencia } from './inference/MotorInferencia';

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

// Catálogo REAL: Supabase + disponibilidad REAL del vector en NORMALIZACION.
app.get('/api/products', async (_req, res) => {
  try {
    const [productos, materiales] = await Promise.all([
      obtenerProductosActivos(),
      listarMaterialesDesdeSheet(),
    ]);

    const ids = new Set(materiales.map(id => id.trim().toUpperCase()));
    res.json(productos.map(p => ({
      id: p.id,
      nombre: p.nombre,
      materialId: p.material_id,
      contexto: p.contexto ?? 'general',
      vectorDisponible: ids.has(String(p.material_id).trim().toUpperCase()),
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
    res.json({
      success: true,
      product: {
        ...product,
        materialId: product.material_id,
        vectorDisponible: vector !== null,
        vector: vector ?? null,
      },
    });
  } catch (error) {
    console.error('GET /api/products/:id:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

/**
 * Análisis REAL consumido por Impulso Vector.
 *
 * Este endpoint existía en el contrato de la aplicación, pero ARKON no lo
 * exponía en el servidor interno; el gateway terminaba devolviendo el HTML
 * estático y el cliente recibía "Unexpected token '<'". Ahora resolvemos el
 * producto en Supabase, validamos su material_id real y ejecutamos el motor.
 */
app.post('/api/analizar', async (req, res) => {
  try {
    const requestedId = typeof req.body?.productId === 'string' ? req.body.productId :
      (typeof req.body?.material_id === 'string' ? req.body.material_id :
        (typeof req.body?.materialId === 'string' ? req.body.materialId : ''));

    if (!requestedId.trim()) {
      return res.status(400).json({ ok: false, error: 'productId, material_id o materialId es obligatorio.' });
    }

    const product = await resolverProducto(requestedId);
    if (!product) {
      return res.status(404).json({ ok: false, error: 'Producto/material no encontrado en Supabase.' });
    }

    const materialId = String(product.material_id ?? '').trim();
    if (!/^M\.\d+$/i.test(materialId)) {
      return res.status(422).json({
        ok: false,
        error: `material_id inválido: "${materialId}". NORMALIZACION usa IDs M.xxx.`,
        producto: { id: product.id, nombre: product.nombre, materialId },
      });
    }

    const vector = await getVectorFromSheet(materialId);
    if (!vector) {
      return res.status(422).json({
        ok: false,
        error: `No existe vector real en NORMALIZACION para ${materialId}.`,
        producto: { id: product.id, nombre: product.nombre, materialId },
      });
    }

    const contexto = typeof req.body?.contexto === 'string' && req.body.contexto.trim()
      ? req.body.contexto.trim().toLowerCase()
      : 'general';
    const estado = typeof req.body?.estado === 'string' ? req.body.estado : undefined;

    // Primero activamos las neuronas para obtener cobertura, valores reales,
    // anomalías e índices intermedios. Esta ruta siempre lee NORMALIZACION.
    const activacion = await activarNeuronas(materialId, contexto, estado);

    // Después intentamos el análisis científico global configurado en Supabase.
    // Si el contexto no coincide con un problema configurado, no inventamos uno:
    // simplemente devolvemos la activación real y dejamos el análisis global nulo.
    let problemaAnalizado: any = null;
    let inferencia: any = null;
    const { data: problemas } = await supabase
      .from('problemas')
      .select('nombre_problema')
      .eq('activo', true);

    const candidatos = (problemas ?? []).map((p: any) => String(p.nombre_problema)).filter(Boolean);
    const nombreProblema = candidatos.find(nombre => nombre.toLowerCase() === contexto)
      ?? (contexto === 'general' ? candidatos.find(nombre => nombre.toLowerCase() === 'fragilidad') : undefined);

    if (nombreProblema) {
      try {
        const motor = new MotorInferencia();
        inferencia = await motor.analizarProblema(nombreProblema, {
          materialId,
          estado: estado === 'E02' || estado === 'E03' ? estado : 'E01',
          componentes: [],
        });
        problemaAnalizado = nombreProblema;
      } catch (error) {
        console.warn(`⚠️ No se pudo ejecutar el problema científico ${nombreProblema}:`, error);
      }
    }

    const anomalias = activacion.neuronasActivadas.flatMap((n: any) =>
      Array.isArray(n.anomalias) ? n.anomalias.map((a: any) => `${n.propertyName}: ${String(a)}`) : []
    );
    const errores = [
      ...anomalias,
      ...activacion.propiedadesPendientes.map(prop => `Sin dato real en NORMALIZACION: ${prop}`),
    ];

    // Las mejoras salen de las reglas científicas persistidas; si no existen,
    // no se fabrica una recomendación.
    const mejoras: any[] = [];
    for (const neuron of activacion.neuronasActivadas) {
      try {
        const reglas = await (ALL_NEURONS.find(n => n.propertyName === neuron.propertyName) as any)?.consultarMejoras?.(neuron.valorCompuesto);
        if (Array.isArray(reglas)) mejoras.push(...reglas);
      } catch {
        // Una tabla/regla opcional no debe invalidar el análisis real.
      }
    }

    const formulas = activacion.neuronasActivadas.flatMap((n: any) =>
      Object.entries(n.indicesIntermedios ?? {}).map(([nombre, valor]) => ({ nombre, valor, propiedad: n.propertyName }))
    );

    return res.json({
      ok: true,
      motor: 'ARKON REAL',
      fuente: 'Supabase + Google Sheets NORMALIZACION',
      producto: {
        id: product.id,
        nombre: product.nombre,
        materialId,
        contexto: product.contexto ?? 'general',
      },
      materiales: [{
        materialId,
        resultado: {
          ...activacion,
          errores,
          mejoras,
          formulas,
          inferencia,
          problemaAnalizado,
        },
      }],
      resultado: {
        activacion,
        inferencia,
        problemaAnalizado,
        errores,
        mejoras,
        formulas,
      },
    });
  } catch (error) {
    console.error('POST /api/analizar:', error);
    return res.status(500).json({ ok: false, error: error instanceof Error ? error.message : String(error) });
  }
});

// Análisis REAL directo: nunca devuelve un catálogo/mock ni inventa resultados.
app.post('/api/analyze-product', async (req, res) => {
  try {
    const requestedId = typeof req.body?.id === 'string' ? req.body.id :
      (typeof req.body?.materialId === 'string' ? req.body.materialId : '');
    if (!requestedId.trim()) return res.status(400).json({ success: false, error: 'id o materialId es obligatorio.' });

    const product = await resolverProducto(requestedId);
    if (!product) return res.status(404).json({ success: false, error: 'Producto/material no encontrado en Supabase.' });

    const materialId = String(product.material_id).trim();
    if (!/^M\.\d+$/i.test(materialId)) {
      return res.status(422).json({
        success: false,
        error: `material_id inválido: "${materialId}". NORMALIZACION usa IDs de material M.xxx; no se aceptan IDs de producto MA.xxx como vector.`,
      });
    }

    const contexto = typeof req.body?.contexto === 'string' ? req.body.contexto : (product.contexto ?? 'general');
    const estado = typeof req.body?.estado === 'string' ? req.body.estado : undefined;
    const resultado = await activarNeuronas(materialId, contexto, estado);

    return res.json({
      success: true,
      producto: { id: product.id, nombre: product.nombre, materialId, contexto },
      resultado,
    });
  } catch (error) {
    console.error('POST /api/analyze-product:', error);
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.post('/api/neural-analysis', async (req, res) => {
  const materialId = typeof req.body?.materialId === 'string' ? req.body.materialId.trim() : '';
  const contexto = typeof req.body?.contexto === 'string' ? req.body.contexto : 'general';
  const estado = typeof req.body?.estado === 'string' ? req.body.estado : undefined;

  if (!/^M\.\d+$/i.test(materialId)) {
    return res.status(400).json({ success: false, error: 'materialId debe ser un ID real de NORMALIZACION con formato M.xxx.' });
  }

  try {
    const resultado = await activarNeuronas(materialId, contexto, estado);
    return res.json({ ok: true, motor: 'ARKON activationEngine', ...resultado });
  } catch (error) {
    console.error('POST /api/neural-analysis:', error);
    return res.status(500).json({ ok: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.post('/api/evaluate-proposal', async (_req, res) => {
  return res.status(501).json({
    success: false,
    error: 'Evaluación de propuestas todavía no está implementada en el motor real; no se devuelve un resultado inventado.',
  });
});

app.get('/api/neurons', (_req, res) => {
  res.json(ALL_NEURONS.map(n => ({
    name: n.constructor.name,
    propertyName: n.propertyName,
    group: n.group,
    unit: n.unidadReferencia,
  })));
});

app.listen(PORT, () => {
  console.log(`✅ ARKON Neural Engine Server running on port ${PORT}`);
});
