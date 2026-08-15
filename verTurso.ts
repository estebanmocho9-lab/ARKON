// ============================================================
// verTurso.ts
// Solo lectura — no borra, no modifica nada. Muestra qué tablas
// hay en tu base de Turso, cuántas filas tiene cada una, y
// (para las tablas principales) cuántos documentos distintos y
// cuáles son.
//
// Uso: npx ts-node --transpile-only verTurso.ts
// ============================================================

import { turso } from './src/turso/tursoClient';

async function main() {
  console.log('📋 Tablas en tu base de Turso:\n');

  const tablas = await turso.execute(
    `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`
  );

  const nombresTablas = tablas.rows.map((r: any) => r.name as string);
  for (const nombre of nombresTablas) {
    const conteo = await turso.execute(`SELECT COUNT(*) as total FROM ${nombre}`);
    const total = (conteo.rows[0] as any).total;
    console.log(`  - ${nombre}: ${total} filas`);
  }

  // Para las tablas que tienen columna "documento", mostramos
  // cuántos documentos distintos hay y sus nombres.
  console.log('\n📚 Documentos distintos por tabla (donde aplica):\n');
  for (const nombre of nombresTablas) {
    try {
      const cols = await turso.execute(`PRAGMA table_info(${nombre})`);
      const tieneDocumento = cols.rows.some((c: any) => c.name === 'documento');
      if (!tieneDocumento) continue;

      const docs = await turso.execute(
        `SELECT DISTINCT documento FROM ${nombre} WHERE documento IS NOT NULL ORDER BY documento`
      );
      console.log(`  ${nombre}: ${docs.rows.length} documentos distintos`);
      for (const d of docs.rows) {
        console.log(`     - ${(d as any).documento}`);
      }
      console.log('');
    } catch (err: any) {
      console.log(`  ⚠️  No pude revisar "${nombre}": ${err.message}`);
    }
  }

  console.log('🏁 Listo.');
}

main().catch((err) => {
  console.error('Error general:', err);
  process.exit(1);
});
