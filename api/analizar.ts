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

/**
 * Convierte una composición a fracciones físicas 0..1.
 * Acepta dos formatos explícitos:
 *   - fracciones: 0.65 + 0.22 + 0.08 + 0.05 = 1
 *   - porcentajes: 65 + 22 + 8 + 5 = 100
 * Cualquier otra suma se rechaza para no fabricar una dosificación.
 */
function normalizarComposicion(raw: Record<string, number>): Record<string, number> {
  const entries = Object.entries(raw).filter(([, v]) => Number.isFinite(v) && v > 0);
  if (!entries.length) return {};
  const suma = entries.reduce((s, [, v]) => s + v, 0);
  const tolerancia = 1e-6;
  if (Math.abs(suma - 1) <= tolerancia) {
    return Object.fromEntries(entries.map(([id, v]) => [id, v]));
  }
  if (Math.abs(suma - 100) <= 1e-4) {
    return Object.fromEntries(entries.map(([id, v]) => [id, v / 100]));
  }
  throw new Error(`Composición inválida: la suma de fracciones/porcentajes es ${suma}. Debe ser 1 o 100.`);
}

function parseListaJson(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch { return []; }
  }
  return [];
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
    absorcion_agua: 'absorción de agua', porosidad_total: 'porosidad total',
    indice_vacios_e: 'índice de vacíos', permeabilidad_intrinseca: 'permeabilidad intrínseca',
    conductividad_hidraulica: 'conductividad hidráulica', difusion_agua: 'difusión de agua',
    resistencia_compresion: 'resistencia a compresión', resistencia_traccion: 'resistencia a tracción',
    resistencia_flexion: 'resistencia a flexión', modulo_young: 'módulo de Young',
    cohesion: 'cohesión', dureza_mohs: 'dureza Mohs', conductividad_termica: 'conductividad térmica',
    temperatura_servicio: 'temperatura de servicio', huella_carbono: 'huella de carbono',
    energia_incorporada: 'energía incorporada', reciclabilidad: 'reciclabilidad',
    impermeabilidad: 'impermeabilidad',
  };
  const nombre = nombres[prop] ?? prop.replaceAll('_', ' ');
  if (MAYOR_ES_PEOR.has(prop)) return `${nombre}: índice ${valor.toFixed(1)}/100 — nivel elevado según el umbral operativo actual.`;
  if (MENOR_ES_PEOR.has(prop)) return `${nombre}: índice ${valor.toFixed(1)}/100 — nivel insuficiente según el umbral operativo actual.`;
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
    const texto = [mejora.problema, mejora.causa, mejora.material_sugerido]
      .filter(Boolean).join(' ').toLowerCase();
    const contextoRegla = mejora.contexto == null ? null : String(mejora.contexto).trim().toLowerCase();
    const coincideContexto = !contextoRegla || contextoRegla === String(contexto).trim().toLowerCase();
    const coincideProp = propiedadesProblema.some(p => texto.includes(p.toLowerCase()));
    const coincideMaterial = materialIds.some(id => texto.includes(id.toLowerCase()));
    if (coincideContexto && (coincideProp || coincideMaterial) && mejora.solucion) {
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
      .map(([id, fraccion]) => `${id} ${(Number(fraccion) * 100).toFixed(3)}%`)
      .join(', ');
    recomendaciones.push(
      `Regla disponible para ${regla.propiedad_nombre}: ${regla.descripcion ?? regla.formula ?? 'sin descripción'} | composición evaluada: ${partes}`
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
    const mejora = parseListaJson(fila.propiedades_mejora);
    const empeora = parseListaJson(fila.propiedades_empeora);
    const texto = [...mejora, ...empeora].map(String).join(' ').toLowerCase();
    if (!propiedadesProblema.some(p => texto.includes(p.toLowerCase()))) continue;
    const principios = parseListaJson(fila.nombres_principios);
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
    } else if (body.product_id || body.productId) {
      const productId = Number(body.product_id ?? body.productId);
      if (!Number.isInteger(productId)) {
        res.status(400).json({ error: 'productId debe ser un entero de public.productos.' });
        return;
      }
      const { data, error } = await supabase
        .from('productos').select('*').eq('id', productId).eq('activo', true).maybeSingle();
      if (error || !data) {
        res.status(404).json({ error: `No se encontró el producto ${productId} en Supabase.` });
        return;
      }
      producto = data;
    } else if (body.material_id) {
      const { data, error } = await supabase
        .from('productos').select('*').eq('material_id', body.material_id).eq('activo', true).limit(1).maybeSingle();
      if (error) throw error;
      producto = data;
    }

    if (!producto) {
      res.status(404).json({ error: 'No se encontró el producto real en Supabase para la selección recibida.' });
      return;
    }

    const productoId = producto.id;
    const nombreProducto = producto.nombre ?? body.producto;
    const contexto = producto.contexto ?? body.contexto ?? 'general';
    const estado = typeof producto.estado === 'string' ? producto.estado : (typeof body.estado === 'string' ? body.estado : undefined);
    const composicionOriginal = parseComposicion(producto.composicion);
    const composicion = Object.keys(composicionOriginal).length
      ? normalizarComposicion(composicionOriginal)
      : { [producto.material_id ?? body.material_id]: 1 };

    const componentes: Componente[] = [];
    const activacionesPorMaterial: AnyRow[] = [];
    const pendientes: string[] = [];

    console.log(`🔬 ARKON ANALIZAR → ${nombreProducto}`);
    console.log(`📦 Composición normalizada: ${JSON.stringify(composicion)}`);
    console.log(`🧪 Estado: ${estado ?? 'E01 por defecto'}`);

    for (const [id, fraccion] of Object.entries(composicion)) {
      if (!Number.isFinite(fraccion) || fraccion <= 0) continue;
      const materialId = resolverMaterialId(id);
      const resultado = await activarNeuronas(materialId, contexto, estado);
      if (resultado.neuronasActivadas.length === 0) {
        pendientes.push(`${materialId}: sin neuronas con datos reales para el estado/contexto solicitado`);
      }

      componentes.push({
        id,
        fraccion,
        porcentaje: fraccion * 100,
        materialId,
        datos: resultado.neuronasActivadas.length > 0
          ? `${resultado.neuronasActivadas.length} neuronas / ${resultado.coberturaPorc.toFixed(1)}% cobertura`
          : 'sin datos',
      });

      activacionesPorMaterial.push({ materialId, porcentaje: fraccion, resultado });
    }

    if (!activacionesPorMaterial.length) {
      throw new Error('La composición no contiene componentes válidos. No se ejecuta un análisis parcial con pesos inventados.');
    }

    const porPropiedad = new Map<string, { suma: number; peso: number; neuronas: AnyRow[] }>();
    for (const item of activacionesPorMaterial) {
      for (const neurona of item.resultado.neuronasActivadas) {
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

      for (const n of info.neuronas) if (Array.isArray(n.anomalias)) anomalías.push(...n.anomalias);

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

    // Prioridad correcta: la severidad no depende de que el número sea alto.
    const severidad = { critica: 3, alta: 2, moderada: 1 } as const;
    fallas.sort((a, b) => (severidad[b.nivel as keyof typeof severidad] ?? 0) - (severidad[a.nivel as keyof typeof severidad] ?? 0));

    const propiedadesProblema = [...new Set(fallas.map(f => String(f.propiedad)))];
    const materialIds = componentes.map(c => c.materialId);
    const { soluciones, fuentes: fuentesMejora } = await buscarMejoras(supabase, contexto, propiedadesProblema, materialIds);
    const mezclas = await buscarMezclas(supabase, propiedadesProblema, composicion);
    const triz = await buscarTriz(supabase, propiedadesProblema);

    // Cobertura física: promedio ponderado por las fracciones reales (0..1).
    const cobertura = propiedades.length > 0
      ? activacionesPorMaterial.reduce((s, x) => s + Number(x.resultado.coberturaPorc ?? 0) * Number(x.porcentaje), 0)
      : 0;

    // No se mezclan propiedades dimensionalmente distintas para fabricar un "índice" científico.
    // El campo histórico coherencia_global recibe cobertura, no una media sin dimensión.
    const causas = fallas.map(f => f.descripcion);
    if (anomalías.length) causas.push(...[...new Set(anomalías)].slice(0, 10).map(String));
    if (pendientes.length) causas.push(`Datos faltantes: ${pendientes.join(' | ')}`);
    if (!causas.length) causas.push('No se detectaron alertas con los umbrales operativos actuales; esto no equivale a ausencia de falla científica.');

    const solucionesFinales = [...soluciones];
    if (!solucionesFinales.length && fuentesMejora.length === 0) {
      solucionesFinales.push('No hay una solución material/formulación validada disponible en la base de conocimiento para las alertas detectadas. ARKON no inventa una solución.');
    }

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
      : `Análisis ejecutado para ${nombreProducto} (${contexto}).`;

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
        neuronas_activadas: filasNeuronas.length,
        inferencias_generadas: fallas.length,
        coherencia_global: Math.round(Math.min(100, cobertura) * 100) / 100,
        propiedades_pendientes: pendientes,
        fecha: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (errorResultado || !resultadoGuardado) throw new Error(`Error guardando resultado: ${errorResultado?.message ?? 'resultado no creado'}`);

    if (trabajoId) {
      await supabase.from('trabajos').update({ estado: 'completado', resultado_id: resultadoGuardado.id, actualizado_en: new Date().toISOString() }).eq('id', trabajoId);
    }

    res.status(200).json({
      ok: true,
      resultado_id: resultadoGuardado.id,
      producto: { id: productoId, nombre: nombreProducto, contexto, estado: estado ?? null, composicion, componentes },
      resumen: {
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
      advertencias: [
        'Los valores entregados por NORMALIZACION son índices operativos 0..100; no se presentan como magnitudes físicas con unidades.',
        'Los umbrales de falla actuales siguen siendo operativos. La siguiente etapa debe sustituirlos por límites científicos por propiedad, material, estado y condición de ensayo.',
        'Las reglas de mezcla listadas aquí son conocimiento disponible; todavía no constituyen una formulación nueva calculada y validada.',
      ],
    });
  } catch (err: any) {
    console.error('❌ /api/analizar:', err);
    res.status(500).json({ error: err?.message ?? 'Error interno en análisis ARKON' });
  }
}
