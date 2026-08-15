// crear-tabla-propiedades.ts
// Crea en Turso la tabla gemela de "propiedades_extraidas" de Supabase.
// Correr con: npx ts-node crear-tabla-propiedades.ts

import { turso } from './src/turso/tursoClient';

async function crearTablaPropiedades() {
  try {
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS propiedades_extraidas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        neurona_id TEXT,
        documento TEXT,
        drive_file_id TEXT,
        pagina INTEGER,
        capitulo TEXT,

        nombre_propiedad TEXT,
        nombre_ingles TEXT,
        sinonimos TEXT,
        categoria TEXT,
        tipo_propiedad TEXT,
        familia_material TEXT,
        subfamilia_material TEXT,
        material TEXT,
        componente TEXT,
        unidad TEXT,
        simbolo TEXT,
        valor_encontrado TEXT,
        valor_minimo REAL,
        valor_maximo REAL,
        condicion_ensayo TEXT,
        metodo_ensayo TEXT,
        instrumento_usado TEXT,
        norma TEXT,
        ecuacion_formula TEXT,
        relacion_otras_propiedades TEXT,
        nivel_confianza TEXT,
        origen_dato TEXT,
        observaciones TEXT,

        fecha TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabla propiedades_extraidas (Turso): OK');
  } catch (error) {
    console.error('ERROR:', error);
  }
}

crearTablaPropiedades();
