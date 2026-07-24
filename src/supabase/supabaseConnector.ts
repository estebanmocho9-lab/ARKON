// ============================================================
// supabaseConnector.ts
// Conector entre las 50 neuronas directas y las tablas Supabase
// NO modifica las tablas — solo las lee.
// ============================================================

import { supabase } from '../supabase/client';
import { NeuronInput, NeuronOutput } from '../neurons/base/tipos';

// ─────────────────────────────────────────────────────────────
// TIPOS que reflejan exactamente las columnas de cada tabla CSV
// ─────────────────────────────────────────────────────────────

export interface ReglaMezcla {
  id: number;
  propiedad_nombre: string;   // ej. "resistencia_compresion"
  formula: string;            // ej. "armonica" | "ponderada_lineal" | expr custom
  descripcion: string;
  activo: boolean;
}

export interface TransformacionEstado {
  id: number;
  propiedad_nombre: string;
  material_tipo: string;
  estado_origen: string;      // "E01" | "E02" | "E03"
  estado_destino: string;
  factor_multiplicador: number | null;
  formula_avanzada: string | null;
  descripcion: string;
  activo: boolean;
  creado_en: string;
}

export interface ScientificFormula {
  id: string;                 // "A01", "M01", …
  nombre: string;
  descripcion: string;
  modulo: string;
  categoria: string;
  propiedad_a: string;
  propiedad_b: string;
  tipo_relacion: string;
  ecuacion: string;
  forma_computable: string;
  variables_input: string;
  output_nombre: string;
  output_unidad: string;
  dominio_fisico: string;
  materiales_aplica: string;
  estado_valido: string;
  rango_valido: string;
  restricciones: string;
  peso_cientifico: number;
  confianza: number;
  sensibilidad: number;
  depende_de: string;
  afecta_a: string;
  fuente: string;
  creado_en: string;
}

export interface CruceCientifico {
  nombre_cruce: string;       // ej. "CAP", "DEN"
  propiedades_requeridas: string[];   // JSON array
  formula: string;
  descripcion: string;
  activo: boolean;
  problema: string;           // ej. "humedad", "peso"
}

export interface TrizContradicion {
  id: number;
  param_triz_mejora: string;
  param_triz_empeora: string;
  propiedades_mejora: string[];
  propiedades_empeora: string[];
  principios_triz: string[];
  nombres_principios: string[];
  activo: boolean;
  creado_en: string;
}

export interface ReglaMejora {
  id: number;
  neurona_id: string;         // ej. "N_FRAG_001"
  condicion: string;          // ej. "valor > 60"
  solucion: string;
  prioridad: number;
}

export interface ProblemaConfig {
  nombre_problema: string;
  cruces_activos: { peso: number; nombreCruce: string }[];
  formula_global: string;
  descripcion: string;
  activo: boolean;
}

export interface Producto {
  id: number;
  nombre: string;
  contexto: string;
  composicion: Record<string, number>;  // { "MAT001": 0.75, … }
  created_at: string;
}

export interface MemoriaNeurona {
  id: string;
  neurona_id: string;
  producto: string;
  propiedad: string;
  contexto: string;
  activaciones: number;
  coherencia: number;
  relaciones_detectadas: string[];
  soluciones_aplicadas: string[];
  resultados_obtenidos: string[];
  mejoras_logradas: string[];
  contradicciones: string[];
  patrones_repetidos: string[];
  fecha: string;
}

// ─────────────────────────────────────────────────────────────
// 1. REGLAS DE MEZCLA
//    Usada en NeuronBase.obtenerReglaMezcla()
// ─────────────────────────────────────────────────────────────

/**
 * Obtiene la regla de mezcla activa para una propiedad.
 * Fallback: "ponderada_lineal" si no existe fila.
 */
export async function getReglaMezcla(
  propiedad_nombre: string
): Promise<ReglaMezcla | null> {
  const { data, error } = await supabase
    .from('reglas_mezcla')
    .select('*')
    .eq('propiedad_nombre', propiedad_nombre)
    .eq('activo', true)
    .limit(1)
    .single();

  if (error || !data) return null;
  return data as ReglaMezcla;
}

/**
 * Carga todas las reglas activas de una vez (útil para cachear al inicio).
 * Retorna un Map: propiedad_nombre → ReglaMezcla
 */
export async function getAllReglasMezcla(): Promise<Map<string, ReglaMezcla>> {
  const { data, error } = await supabase
    .from('reglas_mezcla')
    .select('*')
    .eq('activo', true);

  const map = new Map<string, ReglaMezcla>();
  if (error || !data) return map;

  for (const row of data as ReglaMezcla[]) {
    map.set(row.propiedad_nombre, row);
  }
  return map;
}

// ─────────────────────────────────────────────────────────────
// 2. TRANSFORMACIONES DE ESTADO
//    Usada en NeuronBase.aplicarTransformacionEstado()
// ─────────────────────────────────────────────────────────────

/**
 * Obtiene la transformación activa para una propiedad, tipo de material
 * y par estado_origen → estado_destino.
 */
export async function getTransformacionEstado(
  propiedad_nombre: string,
  material_tipo: string,
  estado_origen: string,
  estado_destino: string
): Promise<TransformacionEstado | null> {
  const { data, error } = await supabase
    .from('transformaciones_estado')
    .select('*')
    .eq('propiedad_nombre', propiedad_nombre)
    .eq('material_tipo', material_tipo)
    .eq('estado_origen', estado_origen)
    .eq('estado_destino', estado_destino)
    .eq('activo', true)
    .maybeSingle();

  if (error || !data) return null;
  return data as TransformacionEstado;
}

/**
 * Carga todas las transformaciones activas.
 * Clave del Map: "propiedad|material|estadoOrigen|estadoDestino"
 */
export async function getAllTransformaciones(): Promise<Map<string, TransformacionEstado>> {
  const { data, error } = await supabase
    .from('transformaciones_estado')
    .select('*')
    .eq('activo', true);

  const map = new Map<string, TransformacionEstado>();
  if (error || !data) return map;

  for (const row of data as TransformacionEstado[]) {
    const key = `${row.propiedad_nombre}|${row.material_tipo}|${row.estado_origen}|${row.estado_destino}`;
    map.set(key, row);
  }
  return map;
}

// ─────────────────────────────────────────────────────────────
// 3. FÓRMULAS CIENTÍFICAS
//    Usada por las neuronas para obtener relaciones físicas entre
//    propiedades (ej. densidad ↔ porosidad, calor específico, etc.)
// ─────────────────────────────────────────────────────────────

/**
 * Obtiene todas las fórmulas que involucran una propiedad dada
 * (como propiedad_a o propiedad_b).
 */
export async function getFormulasPorPropiedad(
  propertyName: string
): Promise<ScientificFormula[]> {
  const { data, error } = await supabase
    .from('scientific_formulas')
    .select('*')
    .or(`propiedad_a.eq.${propertyName},propiedad_b.eq.${propertyName}`);

  if (error || !data) return [];
  return data as ScientificFormula[];
}

/**
 * Obtiene fórmulas por módulo (ej. "mecanico", "termico", "hidrico").
 */
export async function getFormulasPorModulo(
  modulo: string
): Promise<ScientificFormula[]> {
  const { data, error } = await supabase
    .from('scientific_formulas')
    .select('*')
    .eq('modulo', modulo);

  if (error || !data) return [];
  return data as ScientificFormula[];
}

/**
 * Carga todas las fórmulas científicas.
 * Retorna un Map: id → ScientificFormula
 */
export async function getAllScientificFormulas(): Promise<Map<string, ScientificFormula>> {
  const { data, error } = await supabase
    .from('scientific_formulas')
    .select('*');

  const map = new Map<string, ScientificFormula>();
  if (error || !data) return map;

  for (const row of data as ScientificFormula[]) {
    map.set(row.id, row);
  }
  return map;
}

// ─────────────────────────────────────────────────────────────
// 4. CRUCES CIENTÍFICOS
//    Usados por el motor de inferencia para combinar propiedades
//    y calcular índices compuestos (CAP, DEN, KTERM, etc.)
// ─────────────────────────────────────────────────────────────

/**
 * Obtiene todos los cruces activos para un problema dado
 * (ej. "humedad", "peso", "aislamiento_termico").
 */
export async function getCrucesPorProblema(
  problema: string
): Promise<CruceCientifico[]> {
  const { data, error } = await supabase
    .from('cruces_cientificos')
    .select('*')
    .eq('problema', problema)
    .eq('activo', true);

  if (error || !data) return [];

  return (data as any[]).map(row => ({
    ...row,
    propiedades_requeridas:
      typeof row.propiedades_requeridas === 'string'
        ? JSON.parse(row.propiedades_requeridas)
        : row.propiedades_requeridas,
  })) as CruceCientifico[];
}

/**
 * Carga todos los cruces activos.
 * Retorna un Map: nombre_cruce → CruceCientifico
 */
export async function getAllCruces(): Promise<Map<string, CruceCientifico>> {
  const { data, error } = await supabase
    .from('cruces_cientificos')
    .select('*')
    .eq('activo', true);

  const map = new Map<string, CruceCientifico>();
  if (error || !data) return map;

  for (const row of data as any[]) {
    const cruce: CruceCientifico = {
      ...row,
      propiedades_requeridas:
        typeof row.propiedades_requeridas === 'string'
          ? JSON.parse(row.propiedades_requeridas)
          : row.propiedades_requeridas,
    };
    map.set(cruce.nombre_cruce, cruce);
  }
  return map;
}

// ─────────────────────────────────────────────────────────────
// 5. CONTRADICCIONES TRIZ
//    Permite a cada neurona consultar qué principios TRIZ aplican
//    cuando su propiedad está en conflicto con otra.
// ─────────────────────────────────────────────────────────────

/**
 * Busca contradicciones donde una propiedad está en propiedades_mejora
 * o propiedades_empeora.
 */
export async function getTrizPorPropiedad(
  propertyName: string
): Promise<TrizContradicion[]> {
  const { data, error } = await supabase
    .from('triz_contradicciones')
    .select('*')
    .eq('activo', true);

  if (error || !data) return [];

  // Filtrar en JS porque las columnas son arrays JSON en Supabase
  return (data as any[])
    .map(row => ({
      ...row,
      propiedades_mejora:
        typeof row.propiedades_mejora === 'string'
          ? JSON.parse(row.propiedades_mejora)
          : row.propiedades_mejora,
      propiedades_empeora:
        typeof row.propiedades_empeora === 'string'
          ? JSON.parse(row.propiedades_empeora)
          : row.propiedades_empeora,
      principios_triz:
        typeof row.principios_triz === 'string'
          ? JSON.parse(row.principios_triz)
          : row.principios_triz,
      nombres_principios:
        typeof row.nombres_principios === 'string'
          ? JSON.parse(row.nombres_principios)
          : row.nombres_principios,
    }))
    .filter(
      row =>
        row.propiedades_mejora.includes(propertyName) ||
        row.propiedades_empeora.includes(propertyName)
    ) as TrizContradicion[];
}

// ─────────────────────────────────────────────────────────────
// 6. REGLAS DE MEJORA
//    Cada neurona consulta sus reglas de mejora por neurona_id
// ─────────────────────────────────────────────────────────────

/**
 * Obtiene todas las reglas de mejora para una neurona dada.
 * Ordenadas por prioridad ascendente.
 */
export async function getReglasMejora(
  neurona_id: string
): Promise<ReglaMejora[]> {
  const { data, error } = await supabase
    .from('reglas_mejora')
    .select('*')
    .eq('neurona_id', neurona_id)
    .order('prioridad', { ascending: true });

  if (error || !data) return [];
  return data as ReglaMejora[];
}

/**
 * Evalúa las reglas de mejora contra un valor numérico de la neurona.
 * Retorna las soluciones aplicables.
 */
export async function evaluarReglasMejora(
  neurona_id: string,
  valor: number
): Promise<string[]> {
  const reglas = await getReglasMejora(neurona_id);
  const soluciones: string[] = [];

  for (const regla of reglas) {
    try {
      // condicion es ej. "valor > 60" o "valor < 30"
      const condicion = regla.condicion.replace(/valor/g, String(valor));
      // eslint-disable-next-line no-new-func
      const resultado = new Function(`return (${condicion})`)();
      if (resultado === true) {
        soluciones.push(regla.solucion);
      }
    } catch {
      // condición inválida: ignorar
    }
  }
  return soluciones;
}

// ─────────────────────────────────────────────────────────────
// 7. PROBLEMAS
//    El motor de inferencia carga configuraciones de problemas
//    (qué cruces y pesos usar para cada tipo de análisis)
// ─────────────────────────────────────────────────────────────

/**
 * Obtiene la configuración de un problema por nombre.
 */
export async function getProblema(
  nombre_problema: string
): Promise<ProblemaConfig | null> {
  const { data, error } = await supabase
    .from('problemas')
    .select('*')
    .eq('nombre_problema', nombre_problema)
    .eq('activo', true)
    .single();

  if (error || !data) return null;

  const row = data as any;
  return {
    ...row,
    cruces_activos:
      typeof row.cruces_activos === 'string'
        ? JSON.parse(row.cruces_activos)
        : row.cruces_activos,
  } as ProblemaConfig;
}

/**
 * Carga todos los problemas activos.
 */
export async function getAllProblemas(): Promise<Map<string, ProblemaConfig>> {
  const { data, error } = await supabase
    .from('problemas')
    .select('*')
    .eq('activo', true);

  const map = new Map<string, ProblemaConfig>();
  if (error || !data) return map;

  for (const row of data as any[]) {
    const prob: ProblemaConfig = {
      ...row,
      cruces_activos:
        typeof row.cruces_activos === 'string'
          ? JSON.parse(row.cruces_activos)
          : row.cruces_activos,
    };
    map.set(prob.nombre_problema, prob);
  }
  return map;
}

// ─────────────────────────────────────────────────────────────
// 8. PRODUCTOS
//    Consulta de composición de productos (qué materiales y en
//    qué fracción) para que las neuronas calculen mezclas.
// ─────────────────────────────────────────────────────────────

/**
 * Obtiene un producto por nombre.
 */
export async function getProducto(nombre: string): Promise<Producto | null> {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('nombre', nombre)
    .single();

  if (error || !data) return null;

  const row = data as any;
  return {
    ...row,
    composicion:
      typeof row.composicion === 'string'
        ? JSON.parse(row.composicion)
        : row.composicion,
  } as Producto;
}

/**
 * Obtiene todos los productos.
 */
export async function getAllProductos(): Promise<Producto[]> {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .order('nombre', { ascending: true });

  if (error || !data) return [];

  return (data as any[]).map(row => ({
    ...row,
    composicion:
      typeof row.composicion === 'string'
        ? JSON.parse(row.composicion)
        : row.composicion,
  })) as Producto[];
}

// ─────────────────────────────────────────────────────────────
// 9. MEMORIAS
//    Lectura de memorias históricas de las neuronas (no escribe
//    aquí — la escritura queda en NeuronBase.guardarMemoria)
// ─────────────────────────────────────────────────────────────

/**
 * Obtiene las memorias de una neurona para un producto dado.
 */
export async function getMemoriasPorNeuronayProducto(
  neurona_id: string,
  producto: string
): Promise<MemoriaNeurona[]> {
  const { data, error } = await supabase
    .from('memorias')
    .select('*')
    .eq('neurona_id', neurona_id)
    .eq('producto', producto)
    .order('fecha', { ascending: false });

  if (error || !data) return [];
  return data as MemoriaNeurona[];
}

/**
 * Obtiene todas las memorias de un producto ordenadas por fecha.
 */
export async function getMemoriasPorProducto(
  producto: string
): Promise<MemoriaNeurona[]> {
  const { data, error } = await supabase
    .from('memorias')
    .select('*')
    .eq('producto', producto)
    .order('fecha', { ascending: false });

  if (error || !data) return [];
  return data as MemoriaNeurona[];
}

// ─────────────────────────────────────────────────────────────
// 10. CACHÉ DE INICIO (preload)
//     Carga todo en una sola pasada al arrancar el sistema.
//     Las neuronas consultan desde los Maps en memoria → cero
//     queries adicionales en tiempo de ejecución.
// ─────────────────────────────────────────────────────────────

export interface SupabaseCache {
  reglasMezcla:        Map<string, ReglaMezcla>;
  transformaciones:    Map<string, TransformacionEstado>;
  formulas:            Map<string, ScientificFormula>;
  cruces:              Map<string, CruceCientifico>;
  problemas:           Map<string, ProblemaConfig>;
}

/**
 * Precarga todas las tablas de conocimiento en memoria.
 * Llamar UNA SOLA VEZ al inicio (ej. en index.ts antes de activarNeuronas).
 *
 * Uso:
 *   const cache = await preloadSupabaseCache();
 *   // pasar cache a activarNeuronas / NeuronBase si se refactoriza
 */
export async function preloadSupabaseCache(): Promise<SupabaseCache> {
  console.log('🔄 Cargando tablas Supabase en caché…');

  const [reglasMezcla, transformaciones, formulas, cruces, problemas] =
    await Promise.all([
      getAllReglasMezcla(),
      getAllTransformaciones(),
      getAllScientificFormulas(),
      getAllCruces(),
      getAllProblemas(),
    ]);

  console.log(`✅ Caché lista:
  · reglas_mezcla          → ${reglasMezcla.size} filas
  · transformaciones_estado→ ${transformaciones.size} filas
  · scientific_formulas    → ${formulas.size} filas
  · cruces_cientificos     → ${cruces.size} filas
  · problemas              → ${problemas.size} filas`);

  return { reglasMezcla, transformaciones, formulas, cruces, problemas };
}

// ─────────────────────────────────────────────────────────────
// 11. HELPERS DE CONSULTA RÁPIDA PARA NeuronBase
//     Estas funciones son drop-in replacements de las queries
//     inline que ya existen en NeuronBase.ts — se pueden
//     importar allí sin romper nada.
// ─────────────────────────────────────────────────────────────

/**
 * Drop-in para NeuronBase.obtenerReglaMezcla()
 * Devuelve { formula } tal como espera NeuronBase.
 */
export async function obtenerReglaMezclaParaNeurona(
  propertyName: string
): Promise<{ formula: string }> {
  const regla = await getReglaMezcla(propertyName);
  return { formula: regla?.formula ?? 'ponderada_lineal' };
}

/**
 * Drop-in para NeuronBase.aplicarTransformacionEstado()
 * Devuelve { factor_multiplicador, formula_avanzada } o null.
 */
export async function obtenerTransformacionParaNeurona(
  propertyName: string,
  materialTipo: string,
  estadoOrigen: string,
  estadoDestino: string
): Promise<{ factor_multiplicador: number | null; formula_avanzada: string | null } | null> {
  const t = await getTransformacionEstado(
    propertyName,
    materialTipo,
    estadoOrigen,
    estadoDestino
  );
  if (!t) return null;
  return {
    factor_multiplicador: t.factor_multiplicador,
    formula_avanzada: t.formula_avanzada,
  };
}

/**
 * Enriquece la salida de una neurona con datos de fórmulas
 * científicas, cruces y contradicciones TRIZ relevantes.
 * Útil en el motor de inferencia para generar recomendaciones.
 */
export async function enriquecerSalidaNeurona(output: NeuronOutput): Promise<{
  formulasRelacionadas: ScientificFormula[];
  crucesRelacionados: CruceCientifico[];
  trizContradicciones: TrizContradicion[];
  reglasMejora: string[];
}> {
  const [formulas, allCruces, triz, mejoras] = await Promise.all([
    getFormulasPorPropiedad(output.propertyName),
    getAllCruces(),
    getTrizPorPropiedad(output.propertyName),
    evaluarReglasMejora(output.neuronId, output.valorCompuesto),
  ]);

  // Cruces que requieren esta propiedad
  const crucesRelacionados = Array.from(allCruces.values()).filter(c =>
    c.propiedades_requeridas.includes(output.propertyName)
  );

  return {
    formulasRelacionadas: formulas,
    crucesRelacionados,
    trizContradicciones: triz,
    reglasMejora: mejoras,
  };
}