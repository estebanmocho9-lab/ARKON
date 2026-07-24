// ============================================================
// test-formulacion.ts
// Prueba real: en vez de darle al sistema la receta (como en
// test-mezcla-simulada.ts), le damos el OBJETIVO y dejamos que
// el motor de LP encuentre las proporciones solo.
//
// Correr con: npx ts-node --transpile-only test-formulacion.ts
// ============================================================

import { generarFormulacion } from './src/formulacion/generarFormulacion';
import { ObjetivoFormulacion } from './src/formulacion/tipos';

async function main() {
  const objetivo: ObjetivoFormulacion = {
    propiedadObjetivo: 'resistencia_compresion',
    direccion: 'maximizar',
    restricciones: [
      { propiedad: 'densidad_aparente', tipo: 'max', valor: 50 }, // no más pesado que esto (escala 0-100)
      { propiedad: 'absorcion_agua', tipo: 'max', valor: 40 },
    ],
    maxComponentes: 3,
  };

  const resultado = await generarFormulacion(objetivo);

  console.log('\n=== RESULTADO ===');
  console.log(JSON.stringify(resultado, null, 2));
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
