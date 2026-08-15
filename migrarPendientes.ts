// ============================================================
// migrarPendientes.ts
// Crea en Turso las 3 tablas que todavía faltaban:
//   - propiedades_componentes
//   - datos_sin_clasificar
//   - estado_natural_material
// Usa las mismas credenciales del .env, sin login de CLI.
// Solo CREATE TABLE IF NOT EXISTS — no toca ninguna tabla que
// ya tengas con datos.
//
// Uso: npx ts-node --transpile-only migrarPendientes.ts
// ============================================================

import * as fs from 'fs';
import * as path from 'path';
import { turso } from './src/turso/tursoClient';

const ARCHIVOS = [
  'migracion_componentes_y_sinclasificar.sql',
  'migracion_estado_natural.sql',
];

async function main() {
  for (const archivo of ARCHIVOS) {
    const ruta = path.join(__dirname, archivo);
    if (!fs.existsSync(ruta)) {
      console.log(`⚠️  No encontré ${archivo} en esta carpeta, lo salteo.`);
      continue;
    }
    console.log(`\n📄 ${archivo}`);
    const sql = fs.readFileSync(ruta, 'utf8');
    const sentencias = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.replace(/--.*$/gm, '').trim().length > 0);

    for (const sentencia of sentencias) {
      const primeraLinea = sentencia.replace(/--.*$/gm, '').trim().split('\n')[0];
      try {
        await turso.execute(sentencia);
        console.log(`   ✅ OK: ${primeraLinea.slice(0, 70)}...`);
      } catch (err: any) {
        console.error(`   ❌ ERROR en: ${primeraLinea.slice(0, 70)}...`);
        console.error(`      ${err.message}`);
      }
    }
  }
  console.log('\n🏁 Migración terminada.');
}

main().catch((err) => {
  console.error('Error general:', err);
  process.exit(1);
});
