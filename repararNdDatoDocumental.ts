import { turso } from './src/turso/tursoClient';

async function main() {
  const r = await turso.execute({ sql: "SELECT sql FROM sqlite_master WHERE type='table' AND name='nd_datos_entidad'", args: [] });
  const original = String(r.rows[0]?.sql ?? '');
  if (!original) throw new Error('No existe nd_datos_entidad.');

  if (!/dato_documental\s+TEXT\s+NOT\s+NULL/i.test(original)) {
    console.log('✅ nd_datos_entidad.dato_documental ya es nullable. No se modifica nada.');
    return;
  }

  const nuevo = original.replace(/dato_documental\s+TEXT\s+NOT\s+NULL/ig, 'dato_documental TEXT');
  if (nuevo === original) throw new Error('No se pudo localizar la definición legacy de dato_documental.');

  await turso.execute({ sql: 'PRAGMA writable_schema=ON', args: [] });
  try {
    await turso.execute({
      sql: "UPDATE sqlite_master SET sql=? WHERE type='table' AND name='nd_datos_entidad'",
      args: [nuevo]
    });
    await turso.execute({ sql: 'PRAGMA schema_version = schema_version + 1', args: [] });
  } finally {
    await turso.execute({ sql: 'PRAGMA writable_schema=OFF', args: [] });
  }

  const v = await turso.execute({ sql: 'PRAGMA table_info(nd_datos_entidad)', args: [] });
  const col = v.rows.find((x:any) => String(x.name) === 'dato_documental');
  if (Number(col?.notnull) !== 0) throw new Error('La migración no consiguió hacer nullable dato_documental.');

  console.log('🔧 nd_datos_entidad.dato_documental: NOT NULL -> nullable.');
  console.log('   • Datos existentes preservados.');
  console.log('   • No se borró ni recreó la tabla.');
}

main().catch(err => { console.error('❌ Reparación ND:', err?.message || err); process.exit(1); });
