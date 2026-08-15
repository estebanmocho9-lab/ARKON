// test-agente.ts
// Prueba el motor de encadenamiento con un caso de ejemplo.
// Correr con: npx ts-node test-agente.ts

import { encadenar, imprimirCadena, HechoConocido } from './src/core/motorEncadenamiento';

async function probarAgente() {
  // Hechos de ejemplo: como si fueran las propiedades medidas
  // de un material real (esto despues vendria de tus neuronas)
  const hechosIniciales: HechoConocido[] = [
    { propiedad: 'porosidad', valor: 75, fuente: 'dato_inicial' },
    { propiedad: 'humedad', valor: 65, fuente: 'dato_inicial' },
    { propiedad: 'cohesion', valor: 25, fuente: 'dato_inicial' },
  ];

  const resultado = await encadenar(hechosIniciales);

  imprimirCadena(resultado);

  console.log('\n--- Hechos finales conocidos (incluye los sugeridos por relacion) ---');
  resultado.hechos_finales.forEach((h) =>
    console.log(`  ${h.propiedad}: ${h.valor ?? '(sin valor todavia)'} [${h.fuente}]`)
  );
}

probarAgente();
