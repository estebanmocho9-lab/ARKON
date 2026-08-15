import { turso } from './src/turso/tursoClient';

async function crearTablas() {
  try {
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS neuronas (
        id TEXT PRIMARY KEY,
        nombre TEXT,
        tipo TEXT,
        grupo_fisico TEXT,
        estado TEXT,
        valor_activacion REAL,
        coherencia REAL,
        confianza REAL,
        relaciones TEXT,
        compatibilidades TEXT,
        contradicciones TEXT,
        conexiones_neuronales TEXT,
        historial TEXT,
        creado_en TEXT DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TEXT
      )
    `);
    console.log('Tabla neuronas: OK');

    await turso.execute(`
      CREATE TABLE IF NOT EXISTS memorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        neurona_id TEXT,
        producto TEXT,
        propiedad TEXT,
        contexto TEXT,
        activaciones INTEGER,
        coherencia REAL,
        relaciones_detectadas TEXT,
        soluciones_aplicadas TEXT,
        resultados_obtenidos TEXT,
        mejoras_logradas TEXT,
        contradicciones TEXT,
        patrones_repetidos TEXT,
        fecha TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabla memorias: OK');

    await turso.execute(`
      CREATE TABLE IF NOT EXISTS experiencias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        neurona_id TEXT,
        descripcion TEXT,
        propiedad TEXT,
        material TEXT,
        resultado TEXT,
        confirmaciones INTEGER DEFAULT 1,
        fecha TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabla experiencias: OK');

    await turso.execute(`
      CREATE TABLE IF NOT EXISTS inferencias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        neurona_id TEXT,
        descripcion TEXT,
        confianza REAL,
        propiedades_involucradas TEXT,
        consecuencias TEXT,
        oportunidades TEXT,
        fecha TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabla inferencias: OK');

    await turso.execute(`
      CREATE TABLE IF NOT EXISTS resultados (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        producto TEXT,
        problema_detectado TEXT,
        causas_fisicas TEXT,
        soluciones_propuestas TEXT,
        compatibilidades TEXT,
        mejoras TEXT,
        confianza_general REAL,
        fecha TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabla resultados: OK');

    console.log('TODAS LAS TABLAS CREADAS CORRECTAMENTE');
  } catch (error) {
    console.error('ERROR creando tablas:', error);
  }
}

crearTablas();
