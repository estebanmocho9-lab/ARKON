-- ============================================================
-- migracion_esp001.sql
-- Crea las 10 tablas nuevas que usa guardarConocimientoESP001.ts.
-- Correr esto UNA VEZ contra la base de Turso antes de ejecutar
-- las NE con los extractores de ESP-001 conectados.
-- No toca ninguna tabla existente.
-- ============================================================

CREATE TABLE IF NOT EXISTS significado_propiedad (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  material TEXT,
  tipo TEXT,
  contenido TEXT,
  documento TEXT,
  pagina INTEGER,
  confianza REAL,
  estado TEXT,
  creado_en TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS funcion_propiedad (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  material TEXT,
  tipo TEXT,
  contenido TEXT,
  documento TEXT,
  pagina INTEGER,
  confianza REAL,
  estado TEXT,
  creado_en TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS factores_modificadores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  material TEXT,
  tipo TEXT,
  contenido TEXT,
  documento TEXT,
  pagina INTEGER,
  confianza REAL,
  estado TEXT,
  creado_en TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS relaciones_propiedad (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  material TEXT,
  tipo TEXT,
  contenido TEXT,
  documento TEXT,
  pagina INTEGER,
  confianza REAL,
  estado TEXT,
  creado_en TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS procesos_propiedad (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  material TEXT,
  tipo TEXT,
  contenido TEXT,
  documento TEXT,
  pagina INTEGER,
  confianza REAL,
  estado TEXT,
  creado_en TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS aplicaciones_propiedad (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  material TEXT,
  tipo TEXT,
  contenido TEXT,
  documento TEXT,
  pagina INTEGER,
  confianza REAL,
  estado TEXT,
  creado_en TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ventajas_propiedad (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  material TEXT,
  tipo TEXT,
  contenido TEXT,
  documento TEXT,
  pagina INTEGER,
  confianza REAL,
  estado TEXT,
  creado_en TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS limitaciones_propiedad (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  material TEXT,
  tipo TEXT,
  contenido TEXT,
  documento TEXT,
  pagina INTEGER,
  confianza REAL,
  estado TEXT,
  creado_en TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS identidad_extendida (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  material TEXT,
  tipo TEXT,
  contenido TEXT,
  documento TEXT,
  pagina INTEGER,
  confianza REAL,
  estado TEXT,
  creado_en TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bibliografia_propiedad (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  material TEXT,
  tipo TEXT,
  contenido TEXT,
  documento TEXT,
  pagina INTEGER,
  confianza REAL,
  estado TEXT,
  creado_en TEXT DEFAULT CURRENT_TIMESTAMP
);
