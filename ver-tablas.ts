import { turso } from './src/turso/tursoClient';

async function verTablas() {
  const resultado = await turso.execute(
    "SELECT name FROM sqlite_master WHERE type='table'"
  );
  console.log('Tablas en Turso:');
  resultado.rows.forEach((fila: any) => console.log(' -', fila.name));
}

verTablas();
