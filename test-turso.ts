import { turso } from './src/turso/tursoClient';

async function probarConexion() {
  try {
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS prueba_conexion (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mensaje TEXT,
        fecha TEXT
      )
    `);

    await turso.execute({
      sql: 'INSERT INTO prueba_conexion (mensaje, fecha) VALUES (?, ?)',
      args: ['Conexion exitosa a Turso', new Date().toISOString()],
    });

    const resultado = await turso.execute('SELECT * FROM prueba_conexion');

    console.log('CONEXION EXITOSA A TURSO');
    console.log('Filas encontradas:', resultado.rows);
  } catch (error) {
    console.error('ERROR conectando a Turso:', error);
  }
}

probarConexion()
