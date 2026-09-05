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

async function main() {
  console.log('🔌 Verificando conexión con Turso...');
  await turso.execute({ sql: 'SELECT 1', args: [] });
  console.log('✅ Conexión Turso: OK');

  console.log('🧾 Preparando esquema completo ND en Turso...');
  await prepararEsquemaNDTurso();

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
