// ============================================================
// runND.ts — runner EXCLUSIVO de las neuronas documentales ND.
// No importa ni ejecuta NE.
//
// Uso:
//   npx ts-node --transpile-only src/extraction-neurons/runND.ts 01
//   npx ts-node --transpile-only src/extraction-neurons/runND.ts 01 --doc "1057.pdf"
//   npx ts-node --transpile-only src/extraction-neurons/runND.ts 01 --doc <DRIVE_ID>
//   npx ts-node --transpile-only src/extraction-neurons/runND.ts 01 1 5
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

const NEURONAS: Record<string, () => {
  ejecutar: (limiteDocumentos?: number, limitePaginas?: number) => Promise<void>
}> = {
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
  const args = process.argv.slice(2);
  const objetivo = args[0] || '01';

  const docIndex = args.indexOf('--doc');
  const documentoSeleccionado =
    docIndex >= 0 && args[docIndex + 1]
      ? args[docIndex + 1]
      : undefined;

  let limiteDocumentos: number | undefined;
  let limitePaginas: number | undefined;

  if (!documentoSeleccionado) {
    const posicionados = args.slice(1);
    if (posicionados[0] !== undefined) limiteDocumentos = Number(posicionados[0]);
    if (posicionados[1] !== undefined) limitePaginas = Number(posicionados[1]);

    if (
      limiteDocumentos !== undefined &&
      (!Number.isInteger(limiteDocumentos) || limiteDocumentos < 1)
    ) {
      throw new Error('El límite de documentos debe ser un entero positivo.');
    }

    if (
      limitePaginas !== undefined &&
      (!Number.isInteger(limitePaginas) || limitePaginas < 1)
    ) {
      throw new Error('El límite de páginas debe ser un entero positivo.');
    }
  }

  if (documentoSeleccionado) {
    process.env.ND_DOCUMENTO_SELECCIONADO = documentoSeleccionado;
  } else {
    delete process.env.ND_DOCUMENTO_SELECCIONADO;
  }

  const ids = objetivo === 'todas'
    ? Object.keys(NEURONAS)
    : [objetivo.padStart(2, '0')];

  for (const id of ids) {
    const crear = NEURONAS[id];
    if (!crear) throw new Error(`ND no disponible para la carpeta ${id}.`);
    await crear().ejecutar(limiteDocumentos, limitePaginas);
  }

  console.log('\n🏁 ND finalizada.');
  console.log('   Persistencia: Google Sheets.');
  console.log('   NE-01...NE-10 no fueron ejecutadas.');
}

main().catch(err => {
  console.error('❌ ND:', err?.message || err);
  process.exit(1);
});
