// ============================================================
// verificarTurso.ts
// Verifica Turso y prepara TODA la infraestructura documental ND.
// No procesa PDFs ni ejecuta extracción.
// ============================================================

import { turso } from './src/turso/tursoClient';
import { prepararEsquemaNDTurso } from './src/extraction-neurons/turso/ndTursoPersistence';

const TABLAS = [
  'nd_ejecuciones','nd_documentos','nd_paginas','nd_hallazgos_raw','nd_datos_unificados','nd_text_partes',
  'nd_entidades_documentales','nd_datos_entidad',
  'nd_materiales','nd_componentes','nd_propiedades','nd_magnitudes','nd_atributos','nd_relaciones',
  'nd_condiciones','nd_metodos','nd_instrumentos','nd_aplicaciones','nd_comportamientos','nd_normas',
  'nd_definiciones','nd_evidencias','nd_formulas'
];

async function migrarColumnasND() {
  const r = await turso.execute({ sql: 'PRAGMA table_info(nd_ejecuciones)', args: [] });
  const columnas = new Set(r.rows.map((x:any) => String(x.name)));

  // Versiones anteriores crearon `neurona_id` como NOT NULL, mientras que
  // el flujo actual escribe `neuron_id`. SQLite no permite quitar NOT NULL
  // con ALTER COLUMN, así que reconstruimos solo esta tabla legacy una vez.
  if (columnas.has('neurona_id') && columnas.has('neuron_id')) {
    const neuronaNotNull = r.rows.some((x:any) => String(x.name) === 'neurona_id' && Number(x.notnull) === 1);
    if (neuronaNotNull) {
      await turso.executeMultiple(`
        BEGIN;
        CREATE TABLE nd_ejecuciones_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT, neurona_id TEXT,
          neuron_id TEXT NOT NULL, carpeta_drive TEXT,
          documento_drive_id TEXT NOT NULL, documento TEXT NOT NULL,
          estado TEXT NOT NULL DEFAULT 'en_proceso', extractor_version TEXT,
          iniciado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, terminado_en TEXT, error TEXT
        );
        INSERT INTO nd_ejecuciones_new(
          id,neurona_id,neuron_id,carpeta_drive,documento_drive_id,documento,estado,
          extractor_version,iniciado_en,terminado_en,error
        )
        SELECT id,neurona_id,COALESCE(neuron_id,neurona_id),carpeta_drive,documento_drive_id,
               documento,estado,extractor_version,iniciado_en,terminado_en,error
        FROM nd_ejecuciones;
        DROP TABLE nd_ejecuciones;
        ALTER TABLE nd_ejecuciones_new RENAME TO nd_ejecuciones;
        CREATE INDEX IF NOT EXISTS idx_nd_exec_doc ON nd_ejecuciones(documento_drive_id);
        COMMIT;
      `);
      console.log('   🔧 Migración ND: nd_ejecuciones reconstruida para compatibilidad neuron_id/neurona_id.');
      return;
    }
  }

  if (!columnas.has('neuron_id')) {
    await turso.execute({ sql: 'ALTER TABLE nd_ejecuciones ADD COLUMN neuron_id TEXT', args: [] });
    if (columnas.has('neurona_id')) {
      await turso.execute({ sql: 'UPDATE nd_ejecuciones SET neuron_id=neurona_id WHERE neuron_id IS NULL', args: [] });
    }
    console.log('   🔧 Migración ND: nd_ejecuciones.neuron_id creada y sincronizada.');
  }
}

async function main() {
  console.log('🔌 Verificando conexión con Turso...');
  await turso.execute({ sql: 'SELECT 1', args: [] });
  console.log('✅ Conexión Turso: OK');

  console.log('🧾 Preparando esquema completo ND en Turso...');
  await prepararEsquemaNDTurso();
  await migrarColumnasND();

  let fallos = 0;
  console.log('\n📚 TABLAS DOCUMENTALES ND:');
  for (const tabla of TABLAS) {
    const r = await turso.execute({ sql: `SELECT COUNT(*) AS total FROM ${tabla}`, args: [] });
    const total = Number(r.rows[0]?.total ?? 0);
    console.log(`   ${tabla.padEnd(28)} ${total} registros`);
  }

  const prueba = await turso.execute({
    sql: "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'nd_%' ORDER BY name",
    args: []
  });
  const reales = prueba.rows.map((r:any) => String(r.name));
  const faltantes = TABLAS.filter(t => !reales.includes(t));
  if (faltantes.length) {
    console.error(`\n❌ Faltan tablas: ${faltantes.join(', ')}`);
    fallos++;
  }

  const columnasExec = await turso.execute({ sql: 'PRAGMA table_info(nd_ejecuciones)', args: [] });
  const nombresExec = columnasExec.rows.map((x:any) => String(x.name));
  if (!nombresExec.includes('neuron_id')) {
    console.error('\n❌ nd_ejecuciones sigue sin neuron_id.');
    fallos++;
  }

  if (!fallos) {
    console.log('\n🏁 Turso listo para ND.');
    console.log('   • Persistencia ND: Turso.');
    console.log('   • Datos crudos: nd_hallazgos_raw.');
    console.log('   • Páginas ricas: nd_paginas.');
    console.log('   • Proyección semántica: tablas nd_* por tipo.');
    console.log('   • Entidades, datos de entidad, texto y ejecuciones preservados.');
    console.log('   • No se toca Supabase ni Sheets durante el flujo ND.');
  } else process.exitCode = 2;
}

main().catch(err => {
  console.error('❌ Verificación Turso falló:', err?.message || err);
  process.exit(1);
});
