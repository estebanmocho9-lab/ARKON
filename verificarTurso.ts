// ============================================================
// verificarTurso.ts
// Verifica Turso y prepara TODA la infraestructura documental ND.
// No procesa PDFs ni ejecuta extracción.
// ============================================================

import { turso } from './src/turso/tursoClient';
import { prepararEsquemaNDTurso } from './src/extraction-neurons/turso/ndTursoPersistence';

const TABLAS = [
  'nd_ejecuciones','nd_documentos','nd_paginas','nd_hallazgos_raw','nd_datos_unificados','nd_text_partes',
  'nd_entidades_documentales','nd_datos_entidad','nd_materiales','nd_componentes','nd_propiedades','nd_magnitudes',
  'nd_atributos','nd_relaciones','nd_condiciones','nd_metodos','nd_instrumentos','nd_aplicaciones','nd_comportamientos',
  'nd_normas','nd_definiciones','nd_evidencias','nd_formulas'
];

const PROYECCIONES = ['nd_materiales','nd_componentes','nd_propiedades','nd_magnitudes','nd_atributos','nd_relaciones','nd_condiciones','nd_metodos','nd_instrumentos','nd_aplicaciones','nd_comportamientos','nd_normas','nd_definiciones','nd_evidencias','nd_formulas'];

async function asegurarColumnas(tabla:string, columnas:Record<string,string>) {
  const r = await turso.execute({ sql:`PRAGMA table_info(${tabla})`, args:[] });
  const existentes = new Set(r.rows.map((x:any)=>String(x.name)));
  for (const [nombre,tipo] of Object.entries(columnas)) {
    if (!existentes.has(nombre)) {
      await turso.execute({ sql:`ALTER TABLE ${tabla} ADD COLUMN ${nombre} ${tipo}`, args:[] });
      console.log(`   🔧 ${tabla}.${nombre} creada.`);
    }
  }
}

async function migrarCompatibilidadND() {
  const exec = await turso.execute({ sql:'PRAGMA table_info(nd_ejecuciones)', args:[] });
  const e = exec.rows.map((x:any)=>({name:String(x.name),notnull:Number(x.notnull)}));
  const tieneNeurona=e.some(x=>x.name==='neurona_id');
  const tieneNeuron=e.some(x=>x.name==='neuron_id');
  const neuronaNN=e.some(x=>x.name==='neurona_id'&&x.notnull===1);
  if (tieneNeurona && tieneNeuron && neuronaNN) {
    await turso.executeMultiple(`
      BEGIN;
      CREATE TABLE nd_ejecuciones_compat (
        id INTEGER PRIMARY KEY AUTOINCREMENT, neurona_id TEXT, neuron_id TEXT NOT NULL,
        carpeta_drive TEXT, documento_drive_id TEXT NOT NULL, documento TEXT NOT NULL,
        estado TEXT NOT NULL DEFAULT 'en_proceso', extractor_version TEXT,
        iniciado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, terminado_en TEXT, error TEXT
      );
      INSERT INTO nd_ejecuciones_compat(id,neurona_id,neuron_id,carpeta_drive,documento_drive_id,documento,estado,extractor_version,iniciado_en,terminado_en,error)
      SELECT id,neurona_id,COALESCE(neuron_id,neurona_id),carpeta_drive,documento_drive_id,documento,estado,extractor_version,iniciado_en,terminado_en,error FROM nd_ejecuciones;
      DROP TABLE nd_ejecuciones;
      ALTER TABLE nd_ejecuciones_compat RENAME TO nd_ejecuciones;
      CREATE INDEX IF NOT EXISTS idx_nd_exec_doc ON nd_ejecuciones(documento_drive_id);
      COMMIT;
    `);
    console.log('   🔧 nd_ejecuciones: compatibilidad neurona_id/neuron_id corregida sin borrar datos.');
  } else if (tieneNeurona && !tieneNeuron) {
    await turso.execute({sql:'ALTER TABLE nd_ejecuciones ADD COLUMN neuron_id TEXT',args:[]});
    await turso.execute({sql:'UPDATE nd_ejecuciones SET neuron_id=neurona_id WHERE neuron_id IS NULL',args:[]});
    console.log('   🔧 nd_ejecuciones.neuron_id creada y sincronizada.');
  }

  await asegurarColumnas('nd_paginas', {
    texto:'TEXT', texto_normalizado:'TEXT', palabras:'INTEGER', bloques:'INTEGER', encabezados:'INTEGER', tablas:'INTEGER',
    enlaces:'INTEGER', imagenes:'INTEGER', ocr_usado:'INTEGER NOT NULL DEFAULT 0', ancho:'REAL', alto:'REAL', raw_json:'TEXT'
  });
  await asegurarColumnas('nd_hallazgos_raw', {
    entidad_principal:'TEXT', aspecto:'TEXT', dato_documental:'TEXT', relacion_entidad:'TEXT'
  });
  await asegurarColumnas('nd_datos_entidad', { metadata_json:'TEXT' });
  await asegurarColumnas('nd_entidades_documentales', { descripcion:'TEXT', metadata_json:'TEXT' });
  await asegurarColumnas('nd_datos_unificados', {
    categoria:'TEXT', nombre:'TEXT', nombre_ingles:'TEXT', sinonimos:'TEXT', familia:'TEXT', subfamilia:'TEXT', material:'TEXT', componente:'TEXT',
    campo:'TEXT', aspecto:'TEXT', dato_documental:'TEXT', valor:'REAL', valor_texto:'TEXT', unidad:'TEXT', simbolo:'TEXT', condicion:'TEXT',
    metodo:'TEXT', instrumento:'TEXT', norma:'TEXT', formula:'TEXT', relacion:'TEXT', contexto:'TEXT', seccion:'TEXT', confianza:'REAL', origen:'TEXT', detalle_json:'TEXT'
  });
  await asegurarColumnas('nd_text_partes', { bbox_json:'TEXT', metadata_json:'TEXT' });
  for (const t of PROYECCIONES) await asegurarColumnas(t, {
    hallazgo_id:'INTEGER', entidad_principal:'TEXT', aspecto:'TEXT', dato_documental:'TEXT', texto_normalizado:'TEXT', relacion_entidad:'TEXT',
    contexto:'TEXT', seccion:'TEXT', confianza:'REAL', metadatos_json:'TEXT'
  });
}

async function main() {
  console.log('🔌 Verificando conexión con Turso...');
  await turso.execute({sql:'SELECT 1',args:[]});
  console.log('✅ Conexión Turso: OK');
  console.log('🧾 Preparando esquema completo ND en Turso...');
  await prepararEsquemaNDTurso();
  await migrarCompatibilidadND();

  let fallos=0;
  console.log('\n📚 TABLAS DOCUMENTALES ND:');
  for (const tabla of TABLAS) {
    const r=await turso.execute({sql:`SELECT COUNT(*) AS total FROM ${tabla}`,args:[]});
    console.log(`   ${tabla.padEnd(28)} ${Number(r.rows[0]?.total??0)} registros`);
  }
  const reales=(await turso.execute({sql:"SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'nd_%' ORDER BY name",args:[]})).rows.map((r:any)=>String(r.name));
  const faltantes=TABLAS.filter(t=>!reales.includes(t));
  if(faltantes.length){console.error(`\n❌ Faltan tablas: ${faltantes.join(', ')}`);fallos++;}
  const ex=(await turso.execute({sql:'PRAGMA table_info(nd_ejecuciones)',args:[]})).rows.map((x:any)=>String(x.name));
  if(!ex.includes('neuron_id')){console.error('\n❌ nd_ejecuciones sigue sin neuron_id.');fallos++;}
  const pg=(await turso.execute({sql:'PRAGMA table_info(nd_paginas)',args:[]})).rows.map((x:any)=>String(x.name));
  if(!pg.includes('texto')){console.error('\n❌ nd_paginas sigue sin texto.');fallos++;}
  if(!fallos){
    console.log('\n🏁 Turso listo para ND.');
    console.log('   • Persistencia ND: Turso.');
    console.log('   • Esquema legacy compatibilizado sin borrar tablas ni datos.');
    console.log('   • nd_paginas conserva texto y metadatos ricos.');
    console.log('   • No se toca Supabase ni Sheets.');
  } else process.exitCode=2;
}
main().catch(err=>{console.error('❌ Verificación Turso falló:',err?.message||err);process.exit(1)});
