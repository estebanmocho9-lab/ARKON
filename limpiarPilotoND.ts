// Borra SOLO los hallazgos/proyecciones de pruebas anteriores con neuron_id ND_TEST_*.
// No toca nd_paginas, porque esas páginas son por documento y pueden ser
// reutilizadas por la corrida productiva. No toca ND-01...ND-10 ni NE/Supabase.
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
  await turso.execute({ sql: `DELETE FROM nd_documentos WHERE neuron_id LIKE 'ND_TEST_%'`, args: [] });
  console.log('✅ Datos ND_TEST_* eliminados. nd_paginas quedó intacta. No se tocó producción.');
}
main().catch(e => { console.error('❌', e?.message || e); process.exit(1); });
