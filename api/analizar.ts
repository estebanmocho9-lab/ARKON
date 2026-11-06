import { createClient } from '@supabase/supabase-js';
import { activarNeuronas } from '../src/core/activationEngine';

type AnyRow = Record<string, any>;

type Componente = {
  id: string;
  fraccion: number;
  porcentaje: number;
  materialId: string;
  datos: string;
};

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function adminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en Vercel.');
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

function resolverMaterialId(id: string): string {
  const value = String(id ?? '').trim();
  const match = value.match(/^MAT(\d+)$/i);
  return match ? `M.${match[1]}` : value;
}

/**
 * Puente servidor-a-servidor hacia el cerebro madre de ARKON.
 * La ruta principal conserva el motor científico existente; esta llamada
 * agrega la evaluación de las 50 neuronas IA cuando el despliegue está listo.
 */
async function consultarCerebroIA(materialId: string, estado: string, neuronIds?: string[]) {
  const baseUrl = process.env.ARKON_BRIDGE_URL?.trim().replace(/\/+$/, '');
  const token = process.env.ARKON_BRIDGE_TOKEN?.trim();
  if (!baseUrl || !token) {
    return { materialId, status: 'bridge_not_configured', message: 'Faltan ARKON_BRIDGE_URL o ARKON_BRIDGE_TOKEN en el servidor Vercel.' };
  }
  if (!['E01', 'E02', 'E03'].includes(estado)) {
    return { materialId, status: 'state_required', message: 'Indica explícitamente E01, E02 o E03; el cerebro no asigna estados por defecto.' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000);
  try {
    const response = await fetch(`${baseUrl}/api/analizar-llama-turso`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ARKON-TOKEN': token,
      },
      body: JSON.stringify({ material_id: materialId, estado, ...(neuronIds?.length ? { neuronIds } : {}) }),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      return { materialId, status: 'brain_request_failed', httpStatus: response.status, message: payload?.error ?? 'El cerebro madre rechazó la solicitud.' };
    }
    return { materialId, status: 'completed', result: payload?.resultado ?? payload };
  } catch (error: any) {
    return {
      materialId,
      status: 'brain_unreachable',
      message: error?.name === 'AbortError' ? 'El cerebro madre superó el límite de 90 segundos.' : 'No se pudo establecer comunicación con el cerebro madre.',
    };
  } finally {
    clearTimeout(timeout);
  }
}

function parseComposicion(value: unknown): Record<string, number> {
  if (!value) return {};
  if (typeof value === 'object' && !Array.isArray(value)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .map(([k, v]) => [k, Number(v)])
        .filter(([, v]) => Number.isFinite(v) && v > 0)
    );
  }
  if (typeof value === 'string') {
    try { return parseComposicion(JSON.parse(value)); } catch { return {}; }
  }
  return {};
}

const MAYOR_ES_PEOR = new Set([
  'absorcion_agua', 'porosidad_total', 'indice_vacios_e', 'indice_vacios',
  'permeabilidad_intrinseca', 'conductividad_hidraulica', 'difusion_agua',
  'difusion_gases', 'difusion_ionica', 'conductividad_termica',
  'expansion_termica', 'huella_carbono', 'energia_incorporada',
  'no_reciclable', 'blandura', 'coef_deslizamiento', 'deflectabilidad',
  'compresibilidad', 'sensibilidad_termica', 'contraccion_termica',
  'temperatura_falla'
]);

const MENOR_ES_PEOR = new Set([
  'resistencia_compresion', 'resistencia_traccion', 'resistencia_flexion',
  'modulo_young', 'modulo_corte', 'modulo_volumetrico', 'cohesion',
  'dureza_mohs', 'angulo_friccion', 'temperatura_servicio',
  'impermeabilidad', 'indice_solidos', 'resistencia_matriz',
  'resistividad_hidraulica', 'resistencia_difusion', 'resistencia_gases',
  'resistencia_ionica', 'estabilidad_cohesiva', 'reciclabilidad'
]);

function esFalla(propiedad: string, valor: number): boolean {
  const p = propiedad.toLowerCase();
  if (MAYOR_ES_PEOR.has(p)) return valor >= 70;
  if (MENOR_ES_PEOR.has(p)) return valor <= 20;
  return valor >= 80;
}

function nivelFalla(propiedad: string, valor: number): 'critica' | 'alta' | 'moderada' | null {
  if (!esFalla(propiedad, valor)) return null;
  if (MAYOR_ES_PEOR.has(propiedad.toLowerCase())) {
    if (valor >= 90) return 'critica';
    if (valor >= 80) return 'alta';
    return 'moderada';
  }
  if (MENOR_ES_PEOR.has(propiedad.toLowerCase())) {
    if (valor <= 10) return 'critica';
    if (valor <= 15) return 'alta';
    return 'moderada';
  }
  return 'alta';
}

function descripcionPropiedad(prop: string, valor: number): string {
  const nombres: Record<string, string> = {
    absorcion_agua: 'absorción de agua',
    porosidad_total: 'porosidad total',
    indice_vacios_e: 'índice de vacíos',
    permeabilidad_intrinseca: 'permeabilidad intrínseca',
    conductividad_hidraulica: 'conductividad hidráulica',
    difusion_agua: 'difusión de agua',
    resistencia_compresion: 'resistencia a compresión',
    resistencia_traccion: 'resistencia a tracción',
    resistencia_flexion: 'resistencia a flexión',
    modulo_young: 'módulo de Young',
    cohesion: 'cohesión',
    dureza_mohs: 'dureza Mohs',
    conductividad_termica: 'conductividad térmica',
    temperatura_servicio: 'temperatura de servicio',
    huella_carbono: 'huella de carbono',
    energia_incorporada: 'energía incorporada',
    reciclabilidad: 'reciclabilidad',
    impermeabilidad: 'impermeabilidad',
  };
  const nombre = nombres[prop] ?? prop.replaceAll('_', ' ');
  if (MAYOR_ES_PEOR.has(prop)) return `${nombre}: índice ${valor.toFixed(1)}/100 — nivel elevado según el umbral operativo del motor.`;
  if (MENOR_ES_PEOR.has(prop)) return `${nombre}: índice ${valor.toFixed(1)}/100 — nivel insuficiente según el umbral operativo del motor.`;
  return `${nombre}: índice ${valor.toFixed(1)}/100 — requiere revisión.`;
}

async function buscarMejoras(
  supabase: ReturnType<typeof adminClient>,
  contexto: string,
  propiedadesProblema: string[],
  materialIds: string[]
) {
  const soluciones: string[] = [];
  const fuentes: AnyRow[] = [];

  const { data: reglasNeuronales } = await supabase
    .from('reglas_mejora')
    .select('neurona_id, condicion, solucion, prioridad')
    .order('prioridad', { ascending: false })
    .limit(100);

  for (const regla of reglasNeuronales ?? []) {
    const coincide = propiedadesProblema.some(p =>
      String(regla.neurona_id ?? '').toLowerCase().includes(p.toLowerCase()) ||
      String(regla.condicion ?? '').toLowerCase().includes(p.toLowerCase())
    );
    if (coincide && regla.solucion) {
      soluciones.push(String(regla.solucion));
      fuentes.push(regla);
    }
    if (soluciones.length >= 5) break;
  }

  const { data: mejoras } = await supabase
    .from('mejoras')
    .select('problema, causa, solucion, material_sugerido, contexto, productos_aplicables')
    .eq('activo', true)
    .limit(100);

  for (const mejora of mejoras ?? []) {
    const texto = [mejora.problema, mejora.causa, mejora.contexto, mejora.material_sugerido]
      .filter(Boolean).join(' ').toLowerCase();
    const coincideContexto = !mejora.contexto || texto.includes(String(contexto).toLowerCase());
    const coincideProp = propiedadesProblema.some(p => texto.includes(p.toLowerCase()));
    const coincideMaterial = materialIds.some(id => texto.includes(id.toLowerCase()));
    if ((coincideProp || coincideMaterial || coincideContexto) && mejora.solucion) {
      const linea = mejora.material_sugerido
        ? `${mejora.solucion} (material sugerido: ${mejora.material_sugerido})`
        : String(mejora.solucion);
      if (!soluciones.includes(linea)) soluciones.push(linea);
      fuentes.push(mejora);
    }
    if (soluciones.length >= 8) break;
  }

  return { soluciones, fuentes };
}

async function buscarMezclas(
  supabase: ReturnType<typeof adminClient>,
  propiedadesProblema: string[],
  composicion: Record<string, number>
) {
  const recomendaciones: string[] = [];
  const { data: reglas } = await supabase
    .from('reglas_mezcla')
    .select('propiedad_nombre, formula, descripcion')
    .eq('activo', true)
    .limit(100);

  for (const regla of reglas ?? []) {
    if (!propiedadesProblema.includes(String(regla.propiedad_nombre))) continue;
    const partes = Object.entries(composicion)
      .map(([id, fraccion]) => `${id} ${(Number(fraccion) * 100).toFixed(1)}%`)
      .join(', ');
    recomendaciones.push(
      `Regla de mezcla para ${regla.propiedad_nombre}: ${regla.descripcion ?? regla.formula ?? 'sin descripción'} | composición evaluada: ${partes}`
    );
  }
  return recomendaciones;
}

async function buscarTriz(
  supabase: ReturnType<typeof adminClient>,
  propiedadesProblema: string[]
) {
  const salida: string[] = [];
  const { data } = await supabase
    .from('triz_contradicciones')
    .select('param_triz_mejora, param_triz_empeora, propiedades_mejora, propiedades_empeora, nombres_principios')
    .eq('activo', true)
    .limit(200);

  for (const fila of data ?? []) {
    const mejora = Array.isArray(fila.propiedades_mejora) ? fila.propiedades_mejora : [];
    const empeora = Array.isArray(fila.propiedades_empeora) ? fila.propiedades_empeora : [];
    const texto = [...mejora, ...empeora].map(String).join(' ').toLowerCase();
    if (!propiedadesProblema.some(p => texto.includes(p.toLowerCase()))) continue;
    const principios = Array.isArray(fila.nombres_principios) ? fila.nombres_principios : [];
    for (const principio of principios.slice(0, 3)) {
      if (!salida.includes(String(principio))) salida.push(String(principio));
    }
    if (salida.length >= 6) break;
  }
  return salida;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido. Usar POST.' });
    return;
  }

  try {
    const supabase = adminClient();
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body ?? {});
    const { trabajoId } = body;

    let producto: AnyRow | null = null;
    if (trabajoId) {
      const { data, error } = await supabase.from('trabajos').select('*').eq('id', trabajoId).single();
      if (error || !data) {
        res.status(404).json({ error: `No se encontró el trabajo ${trabajoId}` });
        return;
      }
      producto = data;
    } else if (body.material_id) {
      const { data } = await supabase
        .from('productos').select('*').eq('material_id', body.material_id).eq('activo', true).limit(1).maybeSingle();
      producto = data;
    }

    if (!producto) {
      res.status(404).json({ error: 'No se encontró el producto real en Supabase para ese material_id.' });
      return;
    }

    const productoId = producto.id;
    const nombreProducto = producto.nombre ?? body.producto;
    const contexto = producto.contexto ?? body.contexto ?? 'general';
    const composicionOriginal = parseComposicion(producto.composicion);
    const composicion = Object.keys(composicionOriginal).length
      ? composicionOriginal
      : { [producto.material_id ?? body.material_id]: 1 };

    const componentes: Componente[] = [];
    const activacionesPorMaterial: AnyRow[] = [];
    const pendientes: string[] = [];

    console.log(`🔬 ARKON ANALIZAR → ${nombreProducto}`);
    console.log(`📦 Composición: ${JSON.stringify(composicion)}`);

    for (const [id, porcentajeRaw] of Object.entries(composicion)) {
      const porcentaje = Number(porcentajeRaw);
      if (!Number.isFinite(porcentaje) || porcentaje <= 0) continue;
      const materialId = resolverMaterialId(id);

      const resultado = await activarNeuronas(materialId, contexto);
      if (resultado.neuronasActivadas.length === 0) {
        pendientes.push(`${materialId}: sin neuronas con datos reales`);
      }

      componentes.push({
        id,
        fraccion: porcentaje,
        porcentaje: porcentaje * 100,
        materialId,
        datos: resultado.neuronasActivadas.length > 0
          ? `${resultado.neuronasActivadas.length} neuronas / ${resultado.coberturaPorc.toFixed(1)}% cobertura`
          : 'sin datos',
      });

      activacionesPorMaterial.push({
        materialId,
        porcentaje,
        resultado,
      });
    }

    const porPropiedad = new Map<string, { suma: number; peso: number; neuronas: AnyRow[] }>();
    for (const item of activacionesPorMaterial) {
      const r = item.resultado;
      for (const neurona of r.neuronasActivadas) {
        const actual = porPropiedad.get(neurona.propertyName) ?? { suma: 0, peso: 0, neuronas: [] };
        const peso = Number(item.porcentaje);
        actual.suma += Number(neurona.valorCompuesto) * peso;
        actual.peso += peso;
        actual.neuronas.push({ ...neurona, componente: item.materialId, fraccion: peso });
        porPropiedad.set(neurona.propertyName, actual);
      }
    }

    const propiedades: AnyRow[] = [];
    const fallas: AnyRow[] = [];
    const anomalías: string[] = [];

    for (const [propertyName, info] of porPropiedad.entries()) {
      const valor = info.peso > 0 ? info.suma / info.peso : 0;
      const confianza = info.neuronas.length
        ? info.neuronas.reduce((s: number, n: AnyRow) => s + Number(n.confianza ?? 0), 0) / info.neuronas.length
        : 0;
      const nivel = nivelFalla(propertyName, valor);
      propiedades.push({
        propiedad: propertyName,
        valor: Math.round(valor * 100) / 100,
        confianza: Math.round(confianza * 1000) / 1000,
        componentes: info.neuronas.map((n: AnyRow) => ({
          materialId: n.componente,
          porcentaje: Math.round(Number(n.fraccion) * 1000) / 10,
          valor: n.valorCompuesto,
        })),
      });

      for (const n of info.neuronas) {
        if (Array.isArray(n.anomalias)) anomalías.push(...n.anomalias);
      }

      if (nivel) {
        fallas.push({
          propiedad: propertyName,
          nivel,
          valor: Math.round(valor * 100) / 100,
          descripcion: descripcionPropiedad(propertyName, valor),
          componentes: info.neuronas.map((n: AnyRow) => ({
            materialId: n.componente,
            porcentaje: Number(n.fraccion) * 100,
            valor: n.valorCompuesto,
          })),
        });
      }
    }

    fallas.sort((a, b) => Number(b.valor) - Number(a.valor));
    const propiedadesProblema = [...new Set(fallas.map(f => String(f.propiedad)))];
    const materialIds = componentes.map(c => c.materialId);

    const { soluciones, fuentes: fuentesMejora } = await buscarMejoras(
      supabase,
      contexto,
      propiedadesProblema,
      materialIds
    );
    const mezclas = await buscarMezclas(supabase, propiedadesProblema, composicion);
    const triz = await buscarTriz(supabase, propiedadesProblema);

    const cobertura = propiedades.length > 0
      ? activacionesPorMaterial.reduce((s, x) => s + Number(x.resultado.coberturaPorc ?? 0) * Number(x.porcentaje), 0) / 100
      : 0;
    const indice = propiedades.length
      ? propiedades.reduce((s, p) => s + Number(p.valor), 0) / propiedades.length
      : 0;

    const causas = fallas.map(f => f.descripcion);
    if (anomalías.length) causas.push(...[...new Set(anomalías)].slice(0, 10).map(String));
    if (pendientes.length) causas.push(`Datos faltantes: ${pendientes.join(' | ')}`);
    if (!causas.length) causas.push('No se detectaron fallas según los umbrales operativos disponibles y los datos reales cargados.');

    const solucionesFinales = [...soluciones];
    solucionesFinales.push(...mezclas);
    if (!solucionesFinales.length && !fuentesMejora.length) {
      solucionesFinales.push('No hay reglas de mejora/mezcla cargadas en Supabase para las fallas detectadas. No se inventa una recomendación.');
    }

    // Persistir activaciones reales de las neuronas del producto.
    const filasNeuronas = propiedades.flatMap(p => {
      const info = porPropiedad.get(p.propiedad);
      return (info?.neuronas ?? []).map((n: AnyRow) => ({
        producto_id: productoId,
        neurona_id: String(n.neuronId),
        valor: Number(n.valorCompuesto),
        diagnostico: n.anomalias?.length ? n.anomalias.join('; ') : `${p.propiedad}: ${Number(n.valorCompuesto).toFixed(2)}`,
      }));
    });
    if (filasNeuronas.length) await supabase.from('resultados_neuronas').insert(filasNeuronas);

    const problemaDetectado = fallas.length
      ? `Se detectaron ${fallas.length} propiedades con alerta en ${nombreProducto} (${contexto}).`
      : `Análisis completo ejecutado para ${nombreProducto} (${contexto}).`;

    const { data: resultadoGuardado, error: errorResultado } = await supabase
      .from('resultados')
      .insert({
        producto: nombreProducto,
        problema_detectado: problemaDetectado,
        causas_fisicas: causas.slice(0, 20),
        soluciones_propuestas: solucionesFinales.slice(0, 20),
        compatibilidades: [],
        mejoras: triz.slice(0, 10),
        confianza_general: Math.round(Math.min(1, cobertura / 100) * 1000) / 1000,
        neuronas_activadas: propiedades.reduce((s, p) => s + Number(p.componentes?.length ?? 0), 0),
        inferencias_generadas: fallas.length,
        coherencia_global: Math.round(Math.min(100, indice) * 100) / 100,
        propiedades_pendientes: pendientes,
        fecha: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (errorResultado || !resultadoGuardado) {
      throw new Error(`Error guardando resultado: ${errorResultado?.message ?? 'resultado no creado'}`);
    }

    if (trabajoId) {
      await supabase.from('trabajos').update({
        estado: 'completado',
        resultado_id: resultadoGuardado.id,
        actualizado_en: new Date().toISOString(),
      }).eq('id', trabajoId);
    }

    // La integración IA es aditiva: no sustituye ni modifica los resultados
    // científicos calculados arriba. Si no hay estado explícito, queda pendiente.
    const aiNeuronsEnabled = body.includeAiNeurons !== false;
    const estadoIA = String(body.estado ?? '').trim().toUpperCase();
    const neuronasIA = aiNeuronsEnabled
      ? await Promise.all(componentes.map(componente =>
          consultarCerebroIA(
            componente.materialId,
            estadoIA,
            Array.isArray(body.neuronIds) ? body.neuronIds.filter((id: unknown): id is string => typeof id === 'string').slice(0, 50) : undefined,
          )
        ))
      : null;

    res.status(200).json({
      ok: true,
      resultado_id: resultadoGuardado.id,
      producto: {
        id: productoId,
        nombre: nombreProducto,
        contexto,
        composicion,
        componentes,
      },
      resumen: {
        indice: Math.round(indice * 10) / 10,
        cobertura: Math.round(cobertura * 10) / 10,
        fallas_detectadas: fallas.length,
        propiedades_evaluadas: propiedades.length,
        neuronas_activadas: filasNeuronas.length,
      },
      fallas,
      propiedades,
      mejoras: solucionesFinales,
      mezclas,
      triz,
      pendientes,
      reglas_mejora_encontradas: fuentesMejora.length,
      ...(neuronasIA ? { neuronasIA } : {}),
    });
  } catch (err: any) {
    console.error('❌ /api/analizar:', err);
    res.status(500).json({ error: err?.message ?? 'Error interno en análisis ARKON' });
  }
}
