// crear-tablas-ampliadas.ts
// Crea las 5 tablas nuevas de la taxonomia ampliada en Turso.
// Correr con: npx ts-node crear-tablas-ampliadas.ts

import { turso } from './src/turso/tursoClient';

async function crearTablasAmpliadas() {
  try {
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS especificaciones_diseno (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        material TEXT,
        tipo_especificacion TEXT,
        contenido TEXT,
        documento TEXT,
        pagina INTEGER,
        confianza REAL,
        estado TEXT DEFAULT 'pendiente',
        fecha TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabla especificaciones_diseno: OK');

    await turso.execute(`
      CREATE TABLE IF NOT EXISTS reacciones_quimicas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        material TEXT,
        tipo_reaccion TEXT,
        contenido TEXT,
        documento TEXT,
        pagina INTEGER,
        confianza REAL,
        estado TEXT DEFAULT 'pendiente',
        fecha TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabla reacciones_quimicas: OK');

    await turso.execute(`
      CREATE TABLE IF NOT EXISTS hallazgos_experimentales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        material TEXT,
        tipo_hallazgo TEXT,
        contenido TEXT,
        documento TEXT,
        pagina INTEGER,
        confianza REAL,
        estado TEXT DEFAULT 'pendiente',
        fecha TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabla hallazgos_experimentales: OK');

    await turso.execute(`
      CREATE TABLE IF NOT EXISTS datos_mercado (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        material TEXT,
        tipo_dato TEXT,
        contenido TEXT,
        documento TEXT,
        pagina INTEGER,
        confianza REAL,
        estado TEXT DEFAULT 'pendiente',
        fecha TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabla datos_mercado: OK');

    await turso.execute(`
      CREATE TABLE IF NOT EXISTS datos_comparativos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        documento TEXT,
        pagina INTEGER,
        texto_tabla TEXT,
        materiales_mencionados TEXT,
        propiedades_mencionadas TEXT,
        estado TEXT DEFAULT 'pendiente',
        fecha TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabla datos_comparativos: OK');

    console.log('TABLAS AMPLIADAS CREADAS CORRECTAMENTE');
  } catch (error) {
    console.error('ERROR:', error);
  }
}

crearTablasAmpliadas();
