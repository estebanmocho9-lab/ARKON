// crear-tabla-pendientes-revision.ts
// Crea en Turso la tabla propiedades_pendientes_revision — mismo
// patrón que tus scripts existentes (crear-tabla-propiedades.ts,
// etc.): un script suelto que se corre una sola vez a mano, no una
// migración automática.
// Correr con: npx ts-node crear-tabla-pendientes-revision.ts

import { turso } from './src/turso/tursoClient';

async function crearTablaPendientesRevision() {
  try {
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS propiedades_pendientes_revision (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        neurona_id TEXT,
        documento TEXT,
        drive_file_id TEXT,
        pagina INTEGER,
        capitulo TEXT,
        nombre_propiedad TEXT,
        material TEXT,
        valor_encontrado TEXT,
        unidad TEXT,
        fragmento_texto TEXT,
        validacion_documental TEXT,
        validacion_semantica TEXT,
        validacion_dimensional TEXT,
        validacion_fisica TEXT,
        motivo_pendiente TEXT,
        fecha TEXT DEFAULT (datetime('now')),
        revisado INTEGER DEFAULT 0,
        decision_manual TEXT
      )
    `);
    console.log('✅ Tabla propiedades_pendientes_revision creada (o ya existía).');
  } catch (error) {
    console.error('❌ Error creando la tabla:', error);
    process.exitCode = 1;
  }
}

crearTablaPendientesRevision();
