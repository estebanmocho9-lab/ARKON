import { turso } from './src/turso/tursoClient';

function raw(v: any): any {
  if (v && typeof v === 'object' && 'value' in v) return v.value;
  return v;
}

async function main() {
  const r = await turso.execute({ sql: "SELECT sql FROM sqlite_master WHERE type='table' AND name='nd_datos_entidad'", args: [] });
  const original = String(raw(r.rows[0]?.sql) ?? '');
  if (!original) throw new Error('No existe nd_datos_entidad.');
  if (!/dato_documental\s+TEXT\s+NOT\s+NULL/i.test(original)) {
    console.log('✅ nd_datos_entidad.dato_documental ya es nullable. No se modifica nada.');
    return;
  }
  const nuevo = original.replace(/dato_documental\s+TEXT\s+NOT\s+NULL/ig, 'dato_documental TEXT');
  if (nuevo === original) throw new Error('No se pudo localizar la definición legacy de dato_documental.');

  await turso.execute({ sql: 'BEGIN', args: [] });
  try {
    await turso.execute({ sql: nuevo.replace(/^CREATE TABLE\s+/i, 'CREATE TABLE nd_datos_entidad_new '), args: [] });
    const cols = await turso.execute({ sql: 'PRAGMA table_info(nd_datos_entidad)', args: [] });
    const names = cols.rows.map((x:any) => String(raw(x.name)));
    const list = names.map((n:string) => '"' + n.replace(/"/g, '""') + '"').join(', ');
    await turso.execute({ sql: `INSERT INTO nd_datos_entidad_new (${list}) SELECT ${list} FROM nd_datos_entidad`, args: [] });
    await turso.execute({ sql: 'DROP TABLE nd_datos_entidad', args: [] });
    await turso.execute({ sql: 'ALTER TABLE nd_datos_entidad_new RENAME TO nd_datos_entidad', args: [] });
    await turso.execute({ sql: 'COMMIT', args: [] });
  } catch (e) {
    try { await turso.execute({ sql: 'ROLLBACK', args: [] }); } catch {}
    throw e;
  }
  const v = await turso.execute({ sql: 'PRAGMA table_info(nd_datos_entidad)', args: [] });
  const col = v.rows.find((x:any) => String(raw(x.name)) === 'dato_documental');
  if (Number(raw(col?.notnull)) !== 0) throw new Error('La migración no consiguió hacer nullable dato_documental.');
  console.log('🔧 nd_datos_entidad.dato_documental: NOT NULL -> nullable.');
  console.log('   • Datos existentes preservados.');
  console.log('   • Tabla reconstruida sin writable_schema.');
}
main().catch(err => { console.error('❌ Reparación ND:', err?.message || err); process.exit(1); });
