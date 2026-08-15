// ============================================================
// src/extraction-neurons/runExtraccion.ts
// Orquestador — punto de entrada por consola.
//
// Uso (ver LEEME.md para el detalle completo en PowerShell):
//   npx ts-node src/extraction-neurons/runExtraccion.ts 01
//   npx ts-node src/extraction-neurons/runExtraccion.ts 01 05 09
//   npx ts-node src/extraction-neurons/runExtraccion.ts todas
//   npx ts-node src/extraction-neurons/runExtraccion.ts paralelo
//   (agregar --reprocesar al final para reprocesar desde cero)
// ============================================================

import * as dotenv from 'dotenv';
dotenv.config();

import { NE01 } from './neuronas/NE01';
import { NE02 } from './neuronas/NE02';
import { NE03 } from './neuronas/NE03';
import { NE04 } from './neuronas/NE04';
import { NE05 } from './neuronas/NE05';
import { NE06 } from './neuronas/NE06';
import { NE07 } from './neuronas/NE07';
import { NE08 } from './neuronas/NE08';
import { NE09 } from './neuronas/NE09';
import { NE10 } from './neuronas/NE10';
import { NeuronExtraccionBase } from './base/NeuronExtraccionBase';

const TODAS_LAS_NEURONAS: Record<string, () => NeuronExtraccionBase> = {
  '01': () => new NE01(),
  '02': () => new NE02(),
  '03': () => new NE03(),
  '04': () => new NE04(),
  '05': () => new NE05(),
  '06': () => new NE06(),
  '07': () => new NE07(),
  '08': () => new NE08(),
  '09': () => new NE09(),
  '10': () => new NE10(),
};

const CONCURRENCIA = parseInt(process.env.CONCURRENCIA || '3', 10);

async function correrSecuencial(ids: string[], reprocesar: boolean) {
  for (const id of ids) {
    const neurona = TODAS_LAS_NEURONAS[id]();
    await neurona.ejecutar({ reprocesar });
  }
}

async function correrEnParalelo(ids: string[], reprocesar: boolean) {
  const cola = [...ids];
  const trabajadores = Array.from({ length: Math.min(CONCURRENCIA, ids.length) }, async () => {
    while (cola.length > 0) {
      const id = cola.shift();
      if (!id) return;
      const neurona = TODAS_LAS_NEURONAS[id]();
      await neurona.ejecutar({ reprocesar });
    }
  });
  await Promise.all(trabajadores);
}

async function main() {
  const args = process.argv.slice(2);
  const reprocesar = args.includes('--reprocesar');
  const argsLimpios = args.filter(a => a !== '--reprocesar');

  if (argsLimpios.length === 0) {
    console.error('❌ Falta indicar qué correr. Ejemplos: "01", "01 05", "todas", "paralelo"');
    process.exit(1);
  }

  if (argsLimpios[0] === 'todas') {
    console.log('▶️  Corriendo las 10 neuronas, una por una (secuencial)...');
    await correrSecuencial(Object.keys(TODAS_LAS_NEURONAS), reprocesar);
  } else if (argsLimpios[0] === 'paralelo') {
    console.log(`▶️  Corriendo las 10 neuronas en paralelo (concurrencia ${CONCURRENCIA})...`);
    await correrEnParalelo(Object.keys(TODAS_LAS_NEURONAS), reprocesar);
  } else {
    const idsValidos = argsLimpios.filter(a => TODAS_LAS_NEURONAS[a]);
    const idsInvalidos = argsLimpios.filter(a => !TODAS_LAS_NEURONAS[a]);
    if (idsInvalidos.length > 0) {
      console.warn(`⚠️  Se ignoran argumentos no reconocidos: ${idsInvalidos.join(', ')}`);
    }
    if (idsValidos.length === 0) {
      console.error('❌ Ningún ID de carpeta válido (usar 01 a 10, "todas" o "paralelo")');
      process.exit(1);
    }
    console.log(`▶️  Corriendo neurona(s): ${idsValidos.join(', ')}`);
    await correrSecuencial(idsValidos, reprocesar);
  }

  console.log('\n🏁 Ejecución finalizada.');
}

main().catch(err => {
  console.error('❌ Error inesperado:', err);
  process.exit(1);
});
