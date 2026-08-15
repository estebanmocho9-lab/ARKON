// agregar-columnas-v3.ts
// Agrega las 2 columnas nuevas a fichas_propiedades, sin borrar
// ni tocar los datos que ya estan cargados.
// Correr con: npx ts-node agregar-columnas-v3.ts

import { turso } from './src/turso/tursoClient';

const COLUMNAS_NUEVAS = [
  'componentes_donde_aparece',
  'propiedad_inversa_o_negativa',
];

async function agregarColumnas() {
  for (const columna of COLUMNAS_NUEVAS) {
    try {
      await turso.execute(`ALTER TABLE fichas_propiedades ADD COLUMN ${columna} TEXT`);
      console.log(`Columna agregada: ${columna}`);
    } catch (error: any) {
      if (error.message && error.message.includes('duplicate column')) {
        console.log(`Columna ya existia, se omite: ${columna}`);
      } else {
        console.error(`Error agregando ${columna}:`, error.message);
      }
    }
  }
  console.log('\nListo. 2 columnas nuevas agregadas (o ya existentes).');
}

agregarColumnas();
