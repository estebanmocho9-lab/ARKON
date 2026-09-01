// ============================================================
// verificarTurso.ts
// Verifica Turso y prepara TODA la infraestructura documental ND.
// No procesa PDFs ni inserta hallazgos.
// ============================================================

import { turso } from './src/turso/tursoClient';
import { prepararEsquemaND, TABLAS_PROYECCION } from './src/turso/esquemaND';

const COLUMNAS_ESPERADAS_PROPIEDADES = [
  'neurona_id', 'documento', 'drive_file_id', 'pagina', 'capitulo',
  'nombre_propiedad', 'nombre_ingles', 'sinonimos', 'categoria', 'tipo_propiedad',
  'familia_material', 'subfamilia_material', 'material', 'componente',
  'unidad', 'simbolo', 'valor_encontrado', 'valor_minimo', 'valor_maximo',
  'condicion_ensayo', 'metodo_ensayo', 'instrumento_usado', 'norma',
  'ecuacion_formula', 'relacion_otras_propiedades', 'nivel_confianza',
  'origen_dato', 'observaciones', 'fragmento_texto',
];

const COLUMNAS_RAW = [
  'neuron_id','tipo','campo','texto_original','texto_normalizado','entidad_candidata',
  'valor','valor_texto','unidad','simbolo','contexto','idioma','confianza','evidencia_json',
  'metadatos_json','documento_drive_id','pagina','posicion_inicio','posicion_fin','seccion','clave_unica',
];

async function verificarTabla(nombre: string, columnasEsperadas: string[] = []) {
  const existe = await turso.execute({
    sql: "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
    args: [nombre],
  });
  if (!existe.rows.length) throw new Error(`La tabla ${nombre} NO existe en Turso.`);

  const columnas = await turso.execute({ sql: `PRAGMA table_info(${nombre})`, args: [] });
  const existentes = new Set(columnas.rows.map((r: any) => String(r.name)));
  const faltantes = columnasEsperadas.filter(c => !existentes.has(c));
  const conteo = await turso.execute({ sql: `SELECT COUNT(*) AS total FROM ${nombre}`, args: [] });
  return { existentes, faltantes, total: Number(conteo.rows[0]?.total ?? 0) };
}

async function main() {
  console.log('🔌 Verificando conexión con Turso...');
  await turso.execute({ sql: 'SELECT 1', args: [] });
  console.log('✅ Conexión Turso: OK');

  const propiedades = await verificarTabla('propiedades_extraidas', COLUMNAS_ESPERADAS_PROPIEDADES);
  console.log(`📊 propiedades_extraidas: ${propiedades.total} registros`);
  if (propiedades.faltantes.length) {
    console.error(`❌ propiedades_extraidas — faltan: ${propiedades.faltantes.join(', ')}`);
    process.exitCode = 2;
  } else console.log('✅ propiedades_extraidas compatible con NE (solo verificación; ND no escribe aquí).');

  console.log('🧾 Preparando esquema completo ND en Turso...');
  await prepararEsquemaND();

  const raw = await verificarTabla('nd_hallazgos_raw', COLUMNAS_RAW);
  console.log(`✅ nd_hallazgos_raw: ${raw.total} registros / ${raw.existentes.size} columnas`);
  if (raw.faltantes.length) {
    console.error(`❌ nd_hallazgos_raw — faltan: ${raw.faltantes.join(', ')}`);
    process.exitCode = 2;
  }

  const tablas = ['nd_documentos','nd_paginas','nd_hallazgos_raw', ...Object.values(TABLAS_PROYECCION)];
  console.log('\n📚 TABLAS DOCUMENTALES ND:');
  for (const tabla of [...new Set(tablas)]) {
    const r = await verificarTabla(tabla);
    console.log(`   ${tabla.padEnd(24)} ${r.total} registros`);
  }

  if (!process.exitCode) {
    console.log('\n🏁 Turso listo para ND.');
    console.log('   • ND escribe exclusivamente en Turso.');
    console.log('   • Cada página se guarda antes de continuar.');
    console.log('   • Las tablas nd_* son proyecciones del raw; no vuelven a extraer el PDF.');
    console.log('   • Supabase y propiedades_extraidas quedan fuera del flujo ND.');
  }
}

main().catch(err => {
  console.error('❌ Verificación Turso falló:', err?.message || err);
  process.exit(1);
});
