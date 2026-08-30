// test-mezcla-simulada.ts
// Prueba de mezcla usando vectores REALES de NORMALIZACION.
// No se inventan valores ni se intercepta Supabase.

import { N002_DensidadAparente } from './physical/N002_densidad_aparente';

async function test() {
  console.log('=== PRUEBA DE MEZCLA REAL (densidad aparente) ===\n');

  const neurona = new N002_DensidadAparente();
  const resultado = await neurona.process({
    materialId: 'MEZCLA-TEST',
    estado: 'E01',
    componentes: [
      { materialId: 'M.001', fraccion: 0.60 },
      { materialId: 'M.002', fraccion: 0.25 },
      { materialId: 'M.003', fraccion: 0.15 }
    ]
  });

  console.log('Resultado de la mezcla:');
  console.log(`  Valor compuesto (0-100): ${resultado.valorCompuesto}`);
  console.log(`  Valor inverso: ${resultado.valorInverso}`);
  console.log(`  Anomalías: ${resultado.anomalias.length ? resultado.anomalias : 'ninguna'}`);
  console.log(`  Componentes usados: ${resultado.metadatos.componentesUsados}`);
  console.log(`  Confianza: ${resultado.confianza}`);
}

test().catch(console.error);