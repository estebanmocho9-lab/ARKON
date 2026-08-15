// src/extraction-neurons/runDefiniciones.ts
// Uso: npx ts-node --transpile-only src/extraction-neurons/runDefiniciones.ts 01
//      npx ts-node --transpile-only src/extraction-neurons/runDefiniciones.ts 07
//      npx ts-node --transpile-only src/extraction-neurons/runDefiniciones.ts todas

import { ND01 } from './neuronas/ND01';
import { ND02 } from './neuronas/ND02';
import { ND03 } from './neuronas/ND03';
import { ND04 } from './neuronas/ND04';
import { ND05 } from './neuronas/ND05';
import { ND06 } from './neuronas/ND06';
import { ND07 } from './neuronas/ND07';
import { ND08 } from './neuronas/ND08';
import { ND09 } from './neuronas/ND09';
import { ND10 } from './neuronas/ND10';

const NEURONAS: Record<string, () => { ejecutar: (limite?: number) => Promise<void> }> = {
  '01': () => new ND01(),
  '02': () => new ND02(),
  '03': () => new ND03(),
  '04': () => new ND04(),
  '05': () => new ND05(),
  '06': () => new ND06(),
  '07': () => new ND07(),
  '08': () => new ND08(),
  '09': () => new ND09(),
  '10': () => new ND10(),
};

async function main() {
  const cual = process.argv[2];
  const limiteArg = process.argv[3];
  const limite = limiteArg ? parseInt(limiteArg, 10) : undefined;

  if (!cual) {
    console.error('Falta indicar que neurona correr: 01-10, o todas');
    process.exit(1);
  }

  console.log(`Corriendo neurona(s) de DEFINICIONES: ${cual}`);

  if (cual === 'todas') {
    for (const key of Object.keys(NEURONAS)) {
      await NEURONAS[key]().ejecutar(limite);
    }
  } else if (NEURONAS[cual]) {
    await NEURONAS[cual]().ejecutar(limite);
  } else {
    console.error(`Opcion no reconocida: ${cual}. Usa 01-10 o todas.`);
    process.exit(1);
  }

  console.log('Ejecucion finalizada.');
}

main();
