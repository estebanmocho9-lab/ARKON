import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { MotorInferencia } from './src/inference/MotorInferencia';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

async function main() {
  const motor = new MotorInferencia();

  const input = {
    materialId: 'MA.001', // Yeso
    estado: 'E01', // estado comercial/polvo
    componentes: [],
  };

  console.log('\n?? ANALIZANDO FRAGILIDAD del material MA.001 (Yeso)');
  const resultadoFragilidad = await motor.analizarProblema('fragilidad', input);
  console.log('Resultado fragilidad:', resultadoFragilidad);

  console.log('\n?? ANALIZANDO ABSORCI�N del material MA.001');
  const resultadoAbsorcion = await motor.analizarProblema('absorcion', input);
  console.log('Resultado absorci�n:', resultadoAbsorcion);
}

main().catch(console.error);