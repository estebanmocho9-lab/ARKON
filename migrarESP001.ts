// ============================================================
// migrarESP001.ts
// Corre migracion_esp001.sql contra Turso usando las MISMAS
// credenciales que ya usa la app (TURSO_DATABASE_URL /
// TURSO_AUTH_TOKEN en .env). No requiere el CLI de turso ni
// ningún login por navegador.
//
// Uso:
//   npx ts-node --transpile-only migrarESP001.ts
//
// Solo crea tablas nuevas (CREATE TABLE IF NOT EXISTS), no toca
// ninguna tabla existente.
// ============================================================

import * as fs from 'fs';
import * as path from 'path';
import { turso } from './src/turso/tursoClient';

async function main() {
  const ruta = path.join(__dirname, 'migracion_esp001.sql');
  const sql = fs.readFileSync(ruta, 'utf8');

  // Separa por ';' y descarta sentencias vacías o solo-comentario
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
