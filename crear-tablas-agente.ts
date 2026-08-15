import { turso } from './src/turso/tursoClient';

async function crearTablasAgente() {
  try {
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS reglas_extraidas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        propiedad_causa TEXT,
        direccion_causa TEXT,
        propiedad_efecto TEXT,
        direccion_efecto TEXT,
        condicion TEXT,
        documento TEXT,
        pagina INTEGER,
        confianza REAL,
        estado TEXT DEFAULT 'pendiente',
        fecha TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabla reglas_extraidas: OK');

    await turso.execute(`
      CREATE TABLE IF NOT EXISTS conocimiento_material (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        material TEXT,
        tipo_conocimiento TEXT,
        contenido TEXT,
        porcentaje REAL,
        mecanismo TEXT,
        documento TEXT,
        pagina INTEGER,
        confianza REAL,
        estado TEXT DEFAULT 'pendiente',
        fecha TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabla conocimiento_material: OK');

    await turso.execute(`
      CREATE TABLE IF NOT EXISTS terminos_candidatos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        termino TEXT UNIQUE,
        veces_visto INTEGER DEFAULT 1,
        primer_documento TEXT,
        ejemplo_contexto TEXT,
        grupo_sugerido TEXT,
        estado TEXT DEFAULT 'pendiente'
      )
    `);
    console.log('Tabla terminos_candidatos: OK');

    console.log('TABLAS DEL AGENTE CREADAS CORRECTAMENTE');
  } catch (error) {
    console.error('ERROR:', error);
  }
}

crearTablasAgente();
