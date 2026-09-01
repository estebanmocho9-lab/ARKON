// ============================================================
// runND.ts
// Runner EXCLUSIVO de las neuronas documentales ND.
// No importa ni ejecuta NE, Supabase ni propiedades_extraidas.
//
// Uso:
//   npx ts-node --transpile-only src/extraction-neurons/runND.ts 01
//   npx ts-node --transpile-only src/extraction-neurons/runND.ts todas
// ============================================================

import * as dotenv from 'dotenv';
dotenv.config();

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
import { prepararEsquemaND } from '../turso/esquemaND';

const NEURONAS: Record<string, () => { ejecutar: (limite?: number) => Promise<void> }> = {
  '01': () => new ND01(), '02': () => new ND02(), '03': () => new ND03(), '04': () => new ND04(), '05': () => new ND05(),
  '06': () => new ND06(), '07': () => new ND07(), '08': () => new ND08(), '09': () => new ND09(), '10': () => new ND10(),
};

async function main() {
  const objetivo = process.argv[2] || '01';
  const limite = process.argv[3] ? Number(process.argv[3]) : undefined;
  if (limite !== undefined && (!Number.isInteger(limite) || limite < 1)) throw new Error('El límite de documentos debe ser un entero positivo.');

  await prepararEsquemaND();

  const ids = objetivo === 'todas' ? Object.keys(NEURONAS) : [objetivo.padStart(2, '0')];
  for (const id of ids) {
    const crear = NEURONAS[id];
    if (!crear) throw new Error(`ND no disponible para la carpeta ${id}.`);
    await crear().ejecutar(limite);
  }

  console.log('\n🏁 ND finalizada.');
  console.log('   Persistencia: Turso únicamente.');
  console.log('   NE-01...NE-10 no fueron ejecutadas.');
}

main().catch(err => { console.error('❌ ND:', err?.message || err); process.exit(1); });
