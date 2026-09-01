// ============================================================
// Esquema persistente de ND en Turso.
//
// ND es la capa documental/exhaustiva. Estas tablas son
// proyecciones del mismo hallazgo bruto: NO vuelven a extraer
// el PDF ni duplican el trabajo de las neuronas NE.
// Todo permanece en Turso; Supabase no participa.
// ============================================================

import { turso } from './tursoClient';

const TABLAS_PROYECCION: Record<string, string> = {
  MATERIAL: 'nd_materiales',
  COMPONENTE: 'nd_componentes',
  PROPIEDAD: 'nd_propiedades',
  MAGNITUD: 'nd_magnitudes',
  ATRIBUTO: 'nd_atributos',
  RELACION: 'nd_relaciones',
  CONDICION: 'nd_condiciones',
  METODO: 'nd_metodos',
  INSTRUMENTO: 'nd_instrumentos',
  APLICACION: 'nd_aplicaciones',
  COMPORTAMIENTO: 'nd_comportamientos',
  NORMA: 'nd_normas',
  DEFINICION: 'nd_definiciones',
  EVIDENCIA: 'nd_evidencias',
  FORMULA: 'nd_formulas',
};

const SQL_BASE = `
  CREATE TABLE IF NOT EXISTS nd_documentos (
    documento_drive_id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    neuron_id TEXT NOT NULL,
    carpeta_drive TEXT,
    estado TEXT NOT NULL DEFAULT 'en_proceso',
    paginas_total INTEGER,
    paginas_procesadas INTEGER NOT NULL DEFAULT 0,
    hallazgos_total INTEGER NOT NULL DEFAULT 0,
    iniciado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    terminado_en TEXT
  );

  CREATE TABLE IF NOT EXISTS nd_paginas (
    documento_drive_id TEXT NOT NULL,
    pagina INTEGER NOT NULL,
    estado TEXT NOT NULL DEFAULT 'procesada',
    hallazgos INTEGER NOT NULL DEFAULT 0,
    procesada_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (documento_drive_id, pagina)
  );

  CREATE TABLE IF NOT EXISTS nd_hallazgos_raw (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    neuron_id TEXT NOT NULL,
    tipo TEXT NOT NULL,
    campo TEXT,
    texto_original TEXT NOT NULL,
    texto_normalizado TEXT NOT NULL,
    entidad_candidata TEXT,
    valor REAL,
    valor_texto TEXT,
    unidad TEXT,
    simbolo TEXT,
    contexto TEXT NOT NULL,
    idioma TEXT NOT NULL,
    confianza REAL NOT NULL,
    evidencia_json TEXT NOT NULL,
    metadatos_json TEXT,
    documento_drive_id TEXT,
    pagina INTEGER,
    posicion_inicio INTEGER,
    posicion_fin INTEGER,
    seccion TEXT,
    clave_unica TEXT UNIQUE,
    creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`;

function sqlTabla(nombre: string): string {
  return `CREATE TABLE IF NOT EXISTS ${nombre} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clave_unica TEXT NOT NULL UNIQUE,
    documento_drive_id TEXT,
    neuron_id TEXT NOT NULL,
    pagina INTEGER,
    campo TEXT,
    entidad_candidata TEXT,
    texto TEXT NOT NULL,
    valor REAL,
    valor_texto TEXT,
    unidad TEXT,
    simbolo TEXT,
    contexto TEXT,
    evidencia_json TEXT NOT NULL,
    creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`;
}

export async function prepararEsquemaND(): Promise<void> {
  await turso.executeMultiple(SQL_BASE);

  for (const tabla of Object.values(TABLAS_PROYECCION)) {
    await turso.execute(sqlTabla(tabla));
  }

  const indices = [
    `CREATE INDEX IF NOT EXISTS idx_nd_doc_estado ON nd_documentos(estado)`,
    `CREATE INDEX IF NOT EXISTS idx_nd_paginas_doc ON nd_paginas(documento_drive_id)`,
    `CREATE INDEX IF NOT EXISTS idx_nd_raw_doc ON nd_hallazgos_raw(documento_drive_id)`,
    `CREATE INDEX IF NOT EXISTS idx_nd_raw_tipo ON nd_hallazgos_raw(tipo)`,
    `CREATE INDEX IF NOT EXISTS idx_nd_raw_entidad ON nd_hallazgos_raw(entidad_candidata)`,
    ...Object.values(TABLAS_PROYECCION).map(t => `CREATE INDEX IF NOT EXISTS idx_${t}_doc ON ${t}(documento_drive_id)`),
    ...Object.values(TABLAS_PROYECCION).map(t => `CREATE INDEX IF NOT EXISTS idx_${t}_entidad ON ${t}(entidad_candidata)`),
  ];
  for (const sql of indices) await turso.execute(sql);
}

export { TABLAS_PROYECCION };
