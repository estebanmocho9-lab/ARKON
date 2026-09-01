import { turso } from './src/turso/tursoClient';
const id=process.argv[2];
if(!id){console.error('Uso: npx ts-node --transpile-only limpiarDocumentoND.ts DRIVE_FILE_ID');process.exit(1)}
const tablas=['nd_datos_entidad','nd_entidades_documentales','nd_hallazgos_raw','nd_materiales','nd_componentes','nd_propiedades','nd_magnitudes','nd_atributos','nd_relaciones','nd_condiciones','nd_metodos','nd_instrumentos','nd_aplicaciones','nd_comportamientos','nd_normas','nd_definiciones','nd_evidencias','nd_formulas'];
(async()=>{for(const t of tablas)await turso.execute({sql:`DELETE FROM ${t} WHERE documento_drive_id=?`,args:[id]});await turso.execute({sql:'DELETE FROM nd_paginas WHERE documento_drive_id=?',args:[id]});await turso.execute({sql:'DELETE FROM nd_documentos WHERE documento_drive_id=?',args:[id]});console.log(`OK: documento ND ${id} limpiado para reprocesar.`)})().catch(e=>{console.error(e);process.exit(1)})
