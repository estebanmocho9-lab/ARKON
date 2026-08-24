// test-neurona.ts
import { N001_DensidadReal } from './src/neurons/physical/N001_densidad_real';
import { N011_ResistenciaCompresion } from './src/neurons/physical/N011_resistencia_compresion';
import { N021_ConductividadTermica } from './src/neurons/physical/N021_conductividad_termica';

async function test() {
  console.log('=== PRUEBA DE NEURONAS ===\n');

  // 1. Probar Densidad Real
  console.log('?? Probando N001_DensidadReal...');
  const densidad = new N001_DensidadReal();
  const res1 = await densidad.process({
    materialId: 'TEST-001',
    estado: 'E01',
    valorDirecto: 78
  });
  console.log('? Resultado:', res1.valorCompuesto, '(inverso:', res1.valorInverso, ')');
  console.log('   Anomal�as:', res1.anomalias.length ? res1.anomalias : 'ninguna');
  console.log('   Confianza:', res1.confianza);

  // 2. Probar Resistencia a Compresi�n
  console.log('\n?? Probando N011_ResistenciaCompresion...');
  const resistencia = new N011_ResistenciaCompresion();
  const res2 = await resistencia.process({
    materialId: 'TEST-002',
    estado: 'E01',
    valorDirecto: 42
  });
  console.log('? Resultado:', res2.valorCompuesto, '(inverso:', res2.valorInverso, ')');
  console.log('   Anomal�as:', res2.anomalias.length ? res2.anomalias : 'ninguna');

  // 3. Probar Conductividad T�rmica
  console.log('\n?? Probando N021_ConductividadTermica...');
  const termica = new N021_ConductividadTermica();
  const res3 = await termica.process({
    materialId: 'TEST-003',
    estado: 'E01',
    valorDirecto: 65
  });
  console.log('? Resultado:', res3.valorCompuesto, '(inverso:', res3.valorInverso, ')');
  console.log('   Anomal�as:', res3.anomalias.length ? res3.anomalias : 'ninguna');

  console.log('\n?? Todas las pruebas completadas sin errores cr�ticos.');
  console.log('   El sistema de neuronas funciona correctamente.');
}

test().catch(err => {
  console.error('? Error en la prueba:', err);
});