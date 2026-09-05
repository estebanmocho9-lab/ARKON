import { turso } from '../../turso/tursoClient';
import { HallazgoND } from '../memoria-nd/tipos';

const PROYECCIONES: Record<string,string> = {
  MATERIAL: 'nd_materiales', COMPONENTE: 'nd_componentes', PROPIEDAD: 'nd_propiedades',
  MAGNITUD: 'nd_magnitudes', ATRIBUTO: 'nd_atributos', RELACION: 'nd_relaciones',
  CONDICION: 'nd_condiciones', METODO: 'nd_metodos', INSTRUMENTO: 'nd_instrumentos',
  APLICACION: 'nd_aplicaciones', COMPORTAMIENTO: 'nd_comportamientos', NORMA: 'nd_normas',
  DEFINICION: 'nd_definiciones', EVIDENCIA: 'nd_evidencias', FORMULA: 'nd_formulas',
};

let preparado = false;
const ahora = () => new Date().toISOString();
const s = (v: unknown) => v == null ? null : String(v);
const j = (v: unknown) => { try { return JSON.stringify(v ?? {}); } catch { return '{}'; } };
const datoSeguro = (h: HallazgoND): string => {
  const dato = s(h.datoDocumental);
  if (dato) return dato;
  const valor = s(h.valorTexto);
  if (valor) return valor;
  const aspecto = s(h.aspecto);
  if (aspecto) return aspecto;
  return s(h.textoOriginal) ?? '';
};

export async function prepararEsquemaNDTurso(): Promise<void> {
  if (preparado) return;
  await turso.executeMultiple(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS nd_ejecuciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT, neurona_id TEXT NOT NULL, carpeta_drive TEXT,
      documento_drive_id TEXT NOT NULL, documento TEXT NOT NULL, estado TEXT NOT NULL DEFAULT 'en_proceso',
      extractor_version TEXT, iniciado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      terminado_en TEXT, error TEXT
    );
    CREATE TABLE IF NOT EXISTS nd_documentos (
      documento_drive_id TEXT PRIMARY KEY, nombre TEXT NOT NULL, neuron_id TEXT NOT NULL,
      carpeta_drive TEXT, estado TEXT NOT NULL DEFAULT 'en_proceso', paginas_total INTEGER,
      paginas_procesadas INTEGER NOT NULL DEFAULT 0, hallazgos_total INTEGER NOT NULL DEFAULT 0,
      idioma TEXT, titulo TEXT, autor TEXT, asunto TEXT, checksum TEXT, metadata_json TEXT,
      extractor_version TEXT, iniciado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, terminado_en TEXT
    );
    CREATE TABLE IF NOT EXISTS nd_paginas (
      documento_drive_id TEXT NOT NULL, pagina INTEGER NOT NULL, estado TEXT NOT NULL DEFAULT 'procesada',
      hallazgos INTEGER NOT NULL DEFAULT 0, texto TEXT, texto_normalizado TEXT, palabras INTEGER,
      bloques INTEGER, encabezados INTEGER, tablas INTEGER, enlaces INTEGER, imagenes INTEGER,
      ocr_usado INTEGER NOT NULL DEFAULT 0, ancho REAL, alto REAL, raw_json TEXT,
      procesada_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(documento_drive_id,pagina)
    );
    CREATE TABLE IF NOT EXISTS nd_hallazgos_raw (
      id INTEGER PRIMARY KEY AUTOINCREMENT, clave_unica TEXT NOT NULL UNIQUE, neuron_id TEXT NOT NULL,
      tipo TEXT NOT NULL, campo TEXT, entidad_candidata TEXT, entidad_principal TEXT, aspecto TEXT,
      dato_documental TEXT, texto_original TEXT NOT NULL, texto_normalizado TEXT NOT NULL,
      valor REAL, valor_texto TEXT, unidad TEXT, simbolo TEXT, relacion_entidad TEXT, contexto TEXT,
      idioma TEXT NOT NULL, confianza REAL NOT NULL, evidencia_json TEXT NOT NULL, metadatos_json TEXT,
      documento_drive_id TEXT, pagina INTEGER, posicion_inicio INTEGER, posicion_fin INTEGER,
      seccion TEXT, creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS nd_datos_unificados (
      id INTEGER PRIMARY KEY AUTOINCREMENT, clave_unica TEXT NOT NULL UNIQUE, documento_drive_id TEXT,
      pagina INTEGER, tipo TEXT, categoria TEXT, nombre TEXT, nombre_ingles TEXT, sinonimos TEXT,
      familia TEXT, subfamilia TEXT, material TEXT, componente TEXT, campo TEXT, aspecto TEXT,
      dato_documental TEXT, valor REAL, valor_texto TEXT, unidad TEXT, simbolo TEXT, condicion TEXT,
      metodo TEXT, instrumento TEXT, norma TEXT, formula TEXT, relacion TEXT, contexto TEXT,
      seccion TEXT, confianza REAL, origen TEXT, detalle_json TEXT, creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS nd_text_partes (
      id INTEGER PRIMARY KEY AUTOINCREMENT, clave_unica TEXT NOT NULL UNIQUE, documento_drive_id TEXT NOT NULL,
      pagina INTEGER, origen TEXT, campo TEXT, parte INTEGER, total_partes INTEGER, texto TEXT NOT NULL,
      bbox_json TEXT, metadata_json TEXT, creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS nd_entidades_documentales (
      id INTEGER PRIMARY KEY AUTOINCREMENT, documento_drive_id TEXT NOT NULL, neuron_id TEXT NOT NULL,
      tipo TEXT NOT NULL, entidad TEXT NOT NULL, clave_entidad TEXT NOT NULL UNIQUE,
      primera_pagina INTEGER, ultima_pagina INTEGER, descripcion TEXT, metadata_json TEXT,
      creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS nd_datos_entidad (
      id INTEGER PRIMARY KEY AUTOINCREMENT, clave_unica TEXT NOT NULL UNIQUE, clave_entidad TEXT NOT NULL,
      documento_drive_id TEXT NOT NULL, pagina INTEGER, aspecto TEXT, dato_documental TEXT,
      valor REAL, valor_texto TEXT, unidad TEXT, relacion_entidad TEXT, evidencia_json TEXT NOT NULL,
      metadata_json TEXT, creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    ${Object.values(PROYECCIONES).map(t => `CREATE TABLE IF NOT EXISTS ${t} (
      id INTEGER PRIMARY KEY AUTOINCREMENT, clave_unica TEXT NOT NULL UNIQUE, hallazgo_id INTEGER,
      documento_drive_id TEXT, neuron_id TEXT NOT NULL, pagina INTEGER, campo TEXT,
      entidad_candidata TEXT, entidad_principal TEXT, aspecto TEXT, dato_documental TEXT,
      texto TEXT NOT NULL, texto_normalizado TEXT, valor REAL, valor_texto TEXT, unidad TEXT, simbolo TEXT,
      relacion_entidad TEXT, contexto TEXT, seccion TEXT, confianza REAL, evidencia_json TEXT NOT NULL,
      metadatos_json TEXT, creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`).join('\n')}
    CREATE INDEX IF NOT EXISTS idx_nd_exec_doc ON nd_ejecuciones(documento_drive_id);
    CREATE INDEX IF NOT EXISTS idx_nd_doc_estado ON nd_documentos(estado);
    CREATE INDEX IF NOT EXISTS idx_nd_pag_doc ON nd_paginas(documento_drive_id);
    CREATE INDEX IF NOT EXISTS idx_nd_raw_doc_pag ON nd_hallazgos_raw(documento_drive_id,pagina);
    CREATE INDEX IF NOT EXISTS idx_nd_raw_tipo ON nd_hallazgos_raw(tipo);
    CREATE INDEX IF NOT EXISTS idx_nd_raw_entidad ON nd_hallazgos_raw(entidad_principal);
    CREATE INDEX IF NOT EXISTS idx_nd_unif_doc ON nd_datos_unificados(documento_drive_id);
    CREATE INDEX IF NOT EXISTS idx_nd_ent_doc ON nd_entidades_documentales(documento_drive_id);
    CREATE INDEX IF NOT EXISTS idx_nd_ent_nombre ON nd_entidades_documentales(entidad);
    CREATE INDEX IF NOT EXISTS idx_nd_dato_ent ON nd_datos_entidad(clave_entidad);
    ${Object.values(PROYECCIONES).map(t => `CREATE INDEX IF NOT EXISTS idx_${t}_doc ON ${t}(documento_drive_id); CREATE INDEX IF NOT EXISTS idx_${t}_ent ON ${t}(entidad_principal);`).join('\n')}
  `);
  preparado = true;
}

export function resetNDTursoContext(): void { preparado = false; }

export async function documentoYaProcesadoNDTurso(documentoDriveId: string): Promise<boolean> {
  await prepararEsquemaNDTurso();
  const r = await turso.execute({ sql: 'SELECT 1 AS ok FROM nd_documentos WHERE documento_drive_id=? AND estado=\'completo\' LIMIT 1', args: [documentoDriveId] });
  return r.rows.length > 0;
}

export async function iniciarDocumentoNDTurso(a: { documentoDriveId:string; nombre:string; neuronId:string; carpetaDrive?:string; paginasTotal?:number }): Promise<number> {
  await prepararEsquemaNDTurso();
  const r = await turso.execute({
    sql: `INSERT INTO nd_documentos(documento_drive_id,nombre,neuron_id,carpeta_drive,estado,paginas_total,iniciado_en,terminado_en)
          VALUES(?,?,?,?,?,?,?,NULL)
          ON CONFLICT(documento_drive_id) DO UPDATE SET nombre=excluded.nombre,neuron_id=excluded.neuron_id,
          carpeta_drive=excluded.carpeta_drive,paginas_total=excluded.paginas_total,estado='en_proceso',terminado_en=NULL
          RETURNING rowid AS id`,
    args: [a.documentoDriveId,a.nombre,a.neuronId,a.carpetaDrive ?? null,'en_proceso',a.paginasTotal ?? null,ahora()]
  });
  const ex = await turso.execute({ sql: `INSERT INTO nd_ejecuciones(neuron_id,carpeta_drive,documento_drive_id,documento,estado,extractor_version,iniciado_en) VALUES(?,?,?,?,?,?,?) RETURNING id`, args: [a.neuronId,a.carpetaDrive ?? null,a.documentoDriveId,a.nombre,'en_proceso','nd-turso-v1',ahora()] });
  return Number(ex.rows[0]?.id ?? r.rows[0]?.id ?? 0);
}

export async function paginaYaProcesadaNDTurso(documentoDriveId:string, pagina:number):Promise<boolean> {
  await prepararEsquemaNDTurso();
  const r = await turso.execute({ sql: `SELECT estado FROM nd_paginas WHERE documento_drive_id=? AND pagina=?`, args: [documentoDriveId,pagina] });
  return String(r.rows[0]?.estado ?? '') === 'procesada';
}

async function guardarRaw(h: HallazgoND, documentoDriveId:string, pagina:number, clave:string):Promise<number> {
  const e = { ...(h.evidencia || {}), pagina };
  const m = { ...(h.metadatos || {}), documentoDriveId, persistencia:'turso' };
  const r = await turso.execute({
    sql: `INSERT INTO nd_hallazgos_raw(clave_unica,neuron_id,tipo,campo,entidad_candidata,entidad_principal,aspecto,dato_documental,texto_original,texto_normalizado,valor,valor_texto,unidad,simbolo,relacion_entidad,contexto,idioma,confianza,evidencia_json,metadatos_json,documento_drive_id,pagina,posicion_inicio,posicion_fin,seccion)
          VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
          ON CONFLICT(clave_unica) DO UPDATE SET confianza=excluded.confianza,metadatos_json=excluded.metadatos_json,evidencia_json=excluded.evidencia_json
          RETURNING id`,
    args: [clave,h.neuronId,h.tipo,h.campo ?? null,h.entidadCandidata ?? null,h.entidadPrincipal ?? null,h.aspecto ?? null,h.datoDocumental ?? null,h.textoOriginal,h.textoNormalizado,h.valor ?? null,h.valorTexto ?? null,h.unidad ?? null,h.simbolo ?? null,h.relacionEntidad ?? null,h.contexto,h.idioma,h.confianza,j(e),j(m),documentoDriveId,pagina,e.posicionInicio ?? null,e.posicionFin ?? null,e.seccion ?? null]
  });
  return Number(r.rows[0]?.id ?? 0);
}

function clave(h:HallazgoND, doc:string, pagina:number):string {
  const e=h.evidencia||{};
  return [doc,pagina,h.tipo,h.campo||'',h.entidadPrincipal||h.entidadCandidata||'',h.aspecto||'',h.textoNormalizado||'',h.valorTexto||'',h.unidad||'',e.posicionInicio??'',e.posicionFin??''].join('¦').toLowerCase();
}

function categoria(tipo:string):string {
  const m:Record<string,string>={MATERIAL:'Material',COMPONENTE:'Componente',PROPIEDAD:'Propiedad',MAGNITUD:'Magnitud',ATRIBUTO:'Atributo',RELACION:'Relación',CONDICION:'Condición',METODO:'Método',INSTRUMENTO:'Instrumento',APLICACION:'Aplicación',COMPORTAMIENTO:'Comportamiento',NORMA:'Norma',DEFINICION:'Definición',EVIDENCIA:'Evidencia',FORMULA:'Fórmula'};
  return m[tipo]||tipo;
}

export async function guardarPaginaNDTurso(hallazgos:HallazgoND[], documentoDriveId:string, documento:string, neuronId:string, carpetaDrive:string, pagina:number, paginaDatos?:any):Promise<number> {
  await prepararEsquemaNDTurso();
  const raw = paginaDatos ?? {};
  const texto = s(raw.text ?? raw.texto ?? '') ?? '';
  const words = Array.isArray(raw.words) ? raw.words : [];
  const blocks = Array.isArray(raw.blocks) ? raw.blocks : [];
  const headings = Array.isArray(raw.headings) ? raw.headings : [];
  const tables = Array.isArray(raw.tables) ? raw.tables : [];
  const links = Array.isArray(raw.links) ? raw.links : [];
  const images = Array.isArray(raw.images) ? raw.images : [];
  await turso.execute({ sql:`INSERT INTO nd_paginas(documento_drive_id,pagina,estado,hallazgos,texto,texto_normalizado,palabras,bloques,encabezados,tablas,enlaces,imagenes,ocr_usado,ancho,alto,raw_json,procesada_en)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(documento_drive_id,pagina) DO UPDATE SET estado='procesada',hallazgos=excluded.hallazgos,texto=excluded.texto,texto_normalizado=excluded.texto_normalizado,palabras=excluded.palabras,bloques=excluded.bloques,encabezados=excluded.encabezados,tablas=excluded.tablas,enlaces=excluded.enlaces,imagenes=excluded.imagenes,ocr_usado=excluded.ocr_usado,ancho=excluded.ancho,alto=excluded.alto,raw_json=excluded.raw_json,procesada_en=excluded.procesada_en`, args:[documentoDriveId,pagina,'procesada',hallazgos.length,texto,texto.replace(/\s+/g,' ').trim(),words.length,blocks.length,headings.length,tables.length,links.length,images.length,raw.ocrUsed||raw.ocr_usado?1:0,raw.width??raw.ancho??null,raw.height??raw.alto??null,j(raw),ahora()] });

  let guardados=0;
  for(const h of hallazgos){
    const k=clave(h,documentoDriveId,pagina);
    const id=await guardarRaw(h,documentoDriveId,pagina,k);
    const kind=String(h.tipo||'');
    const tabla=PROYECCIONES[kind];
    const m:any=h.metadatos||{};
    const dato = datoSeguro(h);
    const vals=[k,id,documentoDriveId,neuronId,pagina,h.campo??null,h.entidadCandidata??null,h.entidadPrincipal??null,h.aspecto??null,dato,h.textoOriginal,h.textoNormalizado,h.valor??null,h.valorTexto??null,h.unidad??null,h.simbolo??null,h.relacionEntidad??null,h.contexto,h.evidencia?.seccion??null,h.confianza,j(h.evidencia||{}),j(m)];
    if(tabla) await turso.execute({sql:`INSERT INTO ${tabla}(clave_unica,hallazgo_id,documento_drive_id,neuron_id,pagina,campo,entidad_candidata,entidad_principal,aspecto,dato_documental,texto,texto_normalizado,valor,valor_texto,unidad,simbolo,relacion_entidad,contexto,seccion,confianza,evidencia_json,metadatos_json) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(clave_unica) DO UPDATE SET hallazgo_id=excluded.hallazgo_id,confianza=excluded.confianza,metadatos_json=excluded.metadatos_json,evidencia_json=excluded.evidencia_json`,args:vals});
    const unifKey=`${k}¦unif`;
    await turso.execute({sql:`INSERT INTO nd_datos_unificados(clave_unica,documento_drive_id,pagina,tipo,categoria,nombre,nombre_ingles,sinonimos,familia,subfamilia,material,componente,campo,aspecto,dato_documental,valor,valor_texto,unidad,simbolo,condicion,metodo,instrumento,norma,formula,relacion,contexto,seccion,confianza,origen,detalle_json)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(clave_unica) DO UPDATE SET detalle_json=excluded.detalle_json,confianza=excluded.confianza`,args:[unifKey,documentoDriveId,pagina,kind,categoria(kind),h.entidadPrincipal||h.entidadCandidata||h.campo||'',m.english??m.nombre_ingles??null,m.synonyms??m.sinonimos??null,m.family??m.familia??null,m.subfamily??m.subfamilia??null,m.material??null,m.component??m.componente??null,h.campo??null,h.aspecto??null,dato,h.valor??null,h.valorTexto??null,h.unidad??null,h.simbolo??null,m.condition??m.condicion??null,m.method??m.metodo??null,m.instrument??m.instrumento??null,m.standard??m.norma??null,m.formula??m.equation??(kind==='FORMULA'?h.textoOriginal:null),m.relation??m.relacion??h.relacionEntidad??null,h.contexto,h.evidencia?.seccion??null,h.confianza,m.origin??m.origen??'ND',j({evidencia:h.evidencia,metadatos:m})]});
    if(h.entidadPrincipal||h.entidadCandidata){
      const entidad=String(h.entidadPrincipal||h.entidadCandidata);
      const ck=`${documentoDriveId}¦${entidad.toLowerCase()}`;
      await turso.execute({sql:`INSERT INTO nd_entidades_documentales(documento_drive_id,neuron_id,tipo,entidad,clave_entidad,primera_pagina,ultima_pagina,descripcion,metadata_json) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(clave_entidad) DO UPDATE SET ultima_pagina=CASE WHEN excluded.ultima_pagina>nd_entidades_documentales.ultima_pagina THEN excluded.ultima_pagina ELSE nd_entidades_documentales.ultima_pagina END,metadata_json=excluded.metadata_json`,args:[documentoDriveId,neuronId,kind,entidad,ck,pagina,pagina,null,j(m)]});
      await turso.execute({sql:`INSERT INTO nd_datos_entidad(clave_unica,clave_entidad,documento_drive_id,pagina,aspecto,dato_documental,valor,valor_texto,unidad,relacion_entidad,evidencia_json,metadata_json) VALUES(?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(clave_unica) DO UPDATE SET evidencia_json=excluded.evidencia_json,metadata_json=excluded.metadata_json`,args:[`${k}¦ent`,ck,documentoDriveId,pagina,h.aspecto??null,dato,h.valor??null,h.valorTexto??null,h.unidad??null,h.relacionEntidad??null,j(h.evidencia||{}),j(m)]});
    }
    const partes=[h.textoOriginal,h.contexto,dato].filter(Boolean) as string[];
    for(const campo of partes){
      const max=45000;
      const total=Math.max(1,Math.ceil(campo.length/max));
      for(let i=0;i<total;i++) await turso.execute({sql:`INSERT INTO nd_text_partes(clave_unica,documento_drive_id,pagina,origen,campo,parte,total_partes,texto,bbox_json,metadata_json) VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(clave_unica) DO UPDATE SET texto=excluded.texto,metadata_json=excluded.metadata_json`,args:[`${k}¦${campo.slice(0,20)}¦${i}`,documentoDriveId,pagina,'hallazgo',h.campo??null,i+1,total,campo.slice(i*max,(i+1)*max),j(h.evidencia||{}),j(m)]});
    }
    guardados++;
  }
  return guardados;
}

export async function finalizarDocumentoNDTurso(a:{documentoDriveId:string;nombre:string;neuronId:string;carpetaDrive:string;paginasTotal:number;paginasProcesadas:number;hallazgosTotal:number;ejecucionId?:number}):Promise<void>{
  await prepararEsquemaNDTurso();
  await turso.execute({sql:`UPDATE nd_documentos SET estado='completo',paginas_total=?,paginas_procesadas=?,hallazgos_total=?,terminado_en=? WHERE documento_drive_id=?`,args:[a.paginasTotal,a.paginasProcesadas,a.hallazgosTotal,ahora(),a.documentoDriveId]});
  if(a.ejecucionId) await turso.execute({sql:`UPDATE nd_ejecuciones SET estado='completo',terminado_en=? WHERE id=?`,args:[ahora(),a.ejecucionId]});
}

export async function fallarDocumentoNDTurso(documentoDriveId:string, ejecucionId:number|undefined, error:string):Promise<void>{
  await prepararEsquemaNDTurso();
  await turso.execute({sql:`UPDATE nd_documentos SET estado='error',terminado_en=? WHERE documento_drive_id=?`,args:[ahora(),documentoDriveId]});
  if(ejecucionId) await turso.execute({sql:`UPDATE nd_ejecuciones SET estado='error',terminado_en=?,error=? WHERE id=?`,args:[ahora(),error,ejecucionId]});
}