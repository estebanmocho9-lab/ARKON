import 'dotenv/config';
import { NEURON_MAP } from './neurons/index';
import { NeuronInput } from './neurons/base/tipos';

async function main() {
  console.log('\n========================================');
  console.log('PRUEBA: Índices Intermedios Científicos');
  console.log('========================================\n');

  const input: NeuronInput = {
    materialId: 'MA.001',
    estado: 'E01',
    valorDirecto: 72.5
  };

  const propiedadPrueba = 'densidad_real';
  const neurona = NEURON_MAP[propiedadPrueba];

  if (!neurona) {
    console.error("❌ Neurona 'densidad_real' no encontrada en NEURON_MAP");
    process.exit(1);
  }

  console.log(`▶ Ejecutando neurona: ${neurona.neuronId}`);
  console.log(`  valorDirecto: ${input.valorDirecto}\n`);

  const output = await neurona.process(input);

  console.log('✅ OUTPUT:');
  console.log(`   valorCompuesto  : ${output.valorCompuesto}`);
  console.log(`   valorInverso    : ${output.valorInverso}`);
  console.log(`   confianza       : ${output.confianza}`);
  console.log(`   materialTipo    : ${output.materialTipo ?? '(no está en tabla materiales aún)'}`);

  const cant = Object.keys(output.indicesIntermedios).length;
  console.log(`\n📐 ÍNDICES INTERMEDIOS (${cant} fórmulas evaluadas):`);
  if (cant === 0) {
    console.log('   (ninguno por ahora)');
  } else {
    for (const [k, v] of Object.entries(output.indicesIntermedios)) {
      console.log(`   ${k}: ${v}`);
    }
  }

  console.log('\n📋 METADATOS:', JSON.stringify(output.metadatos, null, 2));
  process.exit(0);
}

main().catch(err => {
  console.error('❌ ERROR:', err);
  process.exit(1);
});
