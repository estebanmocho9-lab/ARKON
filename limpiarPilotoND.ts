// Borra SOLO los datos de pruebas anteriores con neuron_id ND_TEST_*.
// No toca documentos productivos ND-01...ND-10 ni ninguna tabla NE/Supabase.
import { turso } from './src/turso/tursoClient';

async function main() {
  const tablas = [
    'nd_hallazgos_raw','nd_materiales','nd_componentes','nd_propiedades','nd_magnitudes',
    'nd_atributos','nd_relaciones','nd_condiciones','nd_metodos','nd_instrumentos',
    'nd_aplicaciones','nd_comportamientos','nd_normas','nd_definiciones','nd_evidencias','nd_formulas',
  ];
  for (const tabla of tablas) {
    await turso.execute({ sql: `DELETE FROM ${tabla} WHERE neuron_id LIKE 'ND_TEST_%'`, args: [] });
  }
  await turso.execute({ sql: `DELETE FROM nd_paginas WHERE documento_drive_id IN (SELECT documento_drive_id FROM nd_documentos WHERE neuron_id LIKE 'ND_TEST_%')`, args: [] });
  await turso.execute({ sql: `DELETE FROM nd_documentos WHERE neuron_id LIKE 'ND_TEST_%'`, args: [] });
  console.log('✅ Datos ND_TEST_* eliminados. No se tocó producción.');
}
main().catch(e => { console.error('❌', e?.message || e); process.exit(1); });
