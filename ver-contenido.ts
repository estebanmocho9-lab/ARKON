// ver-contenido.ts
// Muestra las ultimas filas de una tabla de Turso.
// Uso: npx ts-node ver-contenido.ts nombre_de_la_tabla
// Ejemplo: npx ts-node ver-contenido.ts conocimiento_material

import { turso } from './src/turso/tursoClient';

async function verContenido() {
  const tabla = process.argv[2];

  if (!tabla) {
    console.error('Falta indicar el nombre de la tabla. Ejemplo: npx ts-node ver-contenido.ts conocimiento_material');
    process.exit(1);
  }

  try {
    const resultado = await turso.execute(
      `SELECT * FROM ${tabla} ORDER BY id DESC LIMIT 10`
    );
    console.log(`Ultimas ${resultado.rows.length} filas de "${tabla}":\n`);
    resultado.rows.forEach((fila: any, i: number) => {
      console.log(`--- Fila ${i + 1} ---`);
      console.log(fila);
      console.log('');
    });
  } catch (error) {
    console.error('Error consultando la tabla:', error);
  }
}

verContenido();
