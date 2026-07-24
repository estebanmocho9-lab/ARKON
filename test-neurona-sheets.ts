import { N001_DensidadReal } from './src/neurons/physical/N001_densidad_real';

async function test() {
  console.log('?? Probando neurona con datos reales desde Google Sheets...\n');

  const neurona = new N001_DensidadReal();
  const resultado = await neurona.process({
    materialId: 'MA.001',   // Asegurate de que este ID exista en tu hoja NORMALIZACION
    estado: 'E01'
    // No pongas valorDirecto ni componentes
  });

  console.log('Resultado:');
  console.log('  Valor compuesto (0-100):', resultado.valorCompuesto);
  console.log('  Valor inverso:', resultado.valorInverso);
  console.log('  Propiedad pendiente?', resultado.propiedadPendiente);
  console.log('  Anomalías:', resultado.anomalias);
}

test().catch(console.error);