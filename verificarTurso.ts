// ============================================================
// verificarTurso.ts
// Verifica que ARKON pueda conectarse realmente a Turso y que la
// tabla propiedades_extraidas tenga el esquema esperado por la NE.
// No inserta, modifica ni borra datos.
// ============================================================

import { turso } from './src/turso/tursoClient';

const COLUMNAS_ESPERADAS = [
  'neurona_id', 'documento', 'drive_file_id', 'pagina', 'capitulo',
  'nombre_propiedad', 'nombre_ingles', 'sinonimos', 'categoria', 'tipo_propiedad',
  'familia_material', 'subfamilia_material', 'material', 'componente',
  'unidad', 'simbolo', 'valor_encontrado', 'valor_minimo', 'valor_maximo',
  'condicion_ensayo', 'metodo_ensayo', 'instrumento_usado', 'norma',
  'ecuacion_formula', 'relacion_otras_propiedades', 'nivel_confianza',
  'origen_dato', 'observaciones', 'fragmento_texto',
];

async function main() {
  console.log('🔌 Verificando conexión con Turso...');

  const tablas = await turso.execute({
    sql: "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'propiedades_extraidas'",
    args: [],
  });

  if (tablas.rows.length === 0) {
    throw new Error('La tabla propiedades_extraidas NO existe en Turso.');
  }

  const columnas = await turso.execute({
    sql: 'PRAGMA table_info(propiedades_extraidas)',
    args: [],
  });

  const existentes = new Set(columnas.rows.map((r: any) => String(r.name)));
  const faltantes = COLUMNAS_ESPERADAS.filter(c => !existentes.has(c));

  const conteo = await turso.execute({
    sql: 'SELECT COUNT(*) AS total FROM propiedades_extraidas',
    args: [],
  });

  console.log('✅ Conexión Turso: OK');
  console.log('✅ Tabla propiedades_extraidas: OK');
  console.log(`📊 Registros actuales: ${conteo.rows[0]?.total ?? 0}`);
  console.log(`📋 Columnas encontradas: ${existentes.size}`);

  if (faltantes.length > 0) {
    console.error(`❌ Faltan columnas: ${faltantes.join(', ')}`);
    process.exitCode = 2;
    return;
  }

  console.log('✅ Esquema compatible con la NE.');
  console.log('🏁 Verificación terminada: no se modificó ningún dato.');
}

main().catch(err => {
  console.error('❌ Verificación Turso falló:', err?.message || err);
  process.exit(1);
});
