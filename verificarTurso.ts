// ============================================================
// verificarTurso.ts
// Verifica conexión con Turso y garantiza los dos destinos
// principales de extracción: propiedades cuantitativas y
// evidencia documental ND.
// No inserta datos de documentos ni borra registros.
// Si falta una tabla de infraestructura, la crea de forma
// idempotente para dejar Turso listo para la extracción.
// ============================================================

import { turso } from './src/turso/tursoClient';
import { prepararTablaND } from './src/turso/guardarHallazgosND';

const COLUMNAS_ESPERADAS_PROPIEDADES = [
  'neurona_id', 'documento', 'drive_file_id', 'pagina', 'capitulo',
  'nombre_propiedad', 'nombre_ingles', 'sinonimos', 'categoria', 'tipo_propiedad',
  'familia_material', 'subfamilia_material', 'material', 'componente',
  'unidad', 'simbolo', 'valor_encontrado', 'valor_minimo', 'valor_maximo',
  'condicion_ensayo', 'metodo_ensayo', 'instrumento_usado', 'norma',
  'ecuacion_formula', 'relacion_otras_propiedades', 'nivel_confianza',
  'origen_dato', 'observaciones', 'fragmento_texto',
];

const COLUMNAS_ESPERADAS_ND = [
  'neuron_id', 'tipo', 'campo', 'texto_original', 'texto_normalizado',
  'entidad_candidata', 'valor', 'valor_texto', 'unidad', 'simbolo',
  'contexto', 'idioma', 'confianza', 'evidencia_json', 'metadatos_json',
  'documento_drive_id', 'pagina', 'posicion_inicio', 'posicion_fin',
  'seccion', 'clave_unica',
];

async function verificarTabla(nombre: string, columnasEsperadas: string[]) {
  const existe = await turso.execute({
    sql: "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
    args: [nombre],
  });
  if (existe.rows.length === 0) throw new Error(`La tabla ${nombre} NO existe en Turso.`);

  const columnas = await turso.execute({ sql: `PRAGMA table_info(${nombre})`, args: [] });
  const existentes = new Set(columnas.rows.map((r: any) => String(r.name)));
  const faltantes = columnasEsperadas.filter(c => !existentes.has(c));
  const conteo = await turso.execute({ sql: `SELECT COUNT(*) AS total FROM ${nombre}`, args: [] });
  return { existentes, faltantes, total: conteo.rows[0]?.total ?? 0 };
}

async function main() {
  console.log('🔌 Verificando conexión con Turso...');
  await turso.execute({ sql: 'SELECT 1', args: [] });
  console.log('✅ Conexión Turso: OK');

  const propiedades = await verificarTabla('propiedades_extraidas', COLUMNAS_ESPERADAS_PROPIEDADES);
  console.log('✅ Tabla propiedades_extraidas: OK');
  console.log(`📊 propiedades_extraidas: ${propiedades.total} registros`);
  console.log(`📋 propiedades_extraidas: ${propiedades.existentes.size} columnas`);
  if (propiedades.faltantes.length) {
    console.error(`❌ propiedades_extraidas — faltan: ${propiedades.faltantes.join(', ')}`);
    process.exitCode = 2;
  } else {
    console.log('✅ Esquema propiedades_extraidas compatible con la NE.');
  }

  // Infraestructura ND: si no existe, se crea ahora de forma idempotente.
  // No se insertan hallazgos ni se borran datos.
  console.log('🧾 Preparando tabla documental nd_hallazgos_raw...');
  await prepararTablaND();
  const nd = await verificarTabla('nd_hallazgos_raw', COLUMNAS_ESPERADAS_ND);
  console.log('✅ Tabla nd_hallazgos_raw: OK');
  console.log(`📊 nd_hallazgos_raw: ${nd.total} registros`);
  console.log(`📋 nd_hallazgos_raw: ${nd.existentes.size} columnas`);
  if (nd.faltantes.length) {
    console.error(`❌ nd_hallazgos_raw — faltan: ${nd.faltantes.join(', ')}`);
    process.exitCode = 2;
  } else {
    console.log('✅ Esquema nd_hallazgos_raw compatible con ND.');
  }

  if (!process.exitCode) console.log('🏁 Verificación terminada: Turso quedó listo; no se modificaron datos de documentos.');
}

main().catch(err => {
  console.error('❌ Verificación Turso falló:', err?.message || err);
  process.exit(1);
});
