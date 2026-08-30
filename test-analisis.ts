import 'dotenv/config';
import { MotorInferencia } from './src/inference/MotorInferencia';

async function main() {
  const motor = new MotorInferencia();

  // M.001 es el ID real presente en NORMALIZACION (Talco industrial en polvo).
  const input = {
    materialId: 'M.001',
    estado: 'E01',
    componentes: [],
  };

  console.log('\n🔬 ANALIZANDO FRAGILIDAD del material M.001 (Talco industrial)');
  const resultadoFragilidad = await motor.analizarProblema('fragilidad', input);
  console.log('Resultado fragilidad:', resultadoFragilidad);

  console.log('\n🔬 ANALIZANDO ABSORCIÓN del material M.001');
  const resultadoAbsorcion = await motor.analizarProblema('absorcion', input);
  console.log('Resultado absorción:', resultadoAbsorcion);
}

main().catch(console.error);