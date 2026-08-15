// ============================================================
// migrarComponentesYSinClasificar.ts
// Corre migracion_componentes_y_sinclasificar.sql contra Turso,
// usando las mismas credenciales del .env. Mismo patrón que
// migrarESP001.ts.
//
// Uso: npx ts-node --transpile-only migrarComponentesYSinClasificar.ts
// ============================================================

import * as fs from 'fs';
import * as path from 'path';
import { turso } from './src/turso/tursoClient';

async function main() {
  const ruta = path.join(__dirname, 'migracion_componentes_y_sinclasificar.sql');
  const sql = fs.readFileSync(ruta, 'utf8');

  const sentencias = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.replace(/--.*$/gm, '').trim().length > 0);

  console.log(`Encontré ${sentencias.length} sentencias para ejecutar.\n`);

  for (const sentencia of sentencias) {
    const primeraLinea = sentencia.replace(/--.*$/gm, '').trim().split('\n')[0];
    try {
      await turso.execute(sentencia);
      console.log(`✅ OK: ${primeraLinea.slice(0, 70)}...`);
    } catch (err: any) {
      console.error(`❌ ERROR en: ${primeraLinea.slice(0, 70)}...`);
      console.error(`   ${err.message}`);
    }
  }

  console.log('\n🏁 Migración terminada.');
}

main().catch((err) => {
  console.error('Error general:', err);
  process.exit(1);
});
