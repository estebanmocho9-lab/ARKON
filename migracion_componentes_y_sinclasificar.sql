-- ============================================================
-- migracion_componentes_y_sinclasificar.sql
-- Corré esto con el mismo truco de siempre (migrarESP001.ts),
-- NO en Supabase — esto es para Turso.
-- ============================================================

CREATE TABLE IF NOT EXISTS propiedades_componentes (
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
  material_asociado TEXT,
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
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS datos_sin_clasificar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  neurona_id TEXT,
  documento TEXT,
  pagina INTEGER,
  fragmento TEXT,
  numero TEXT,
  unidad_o_etiqueta TEXT,
  revisado INTEGER DEFAULT 0,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);
