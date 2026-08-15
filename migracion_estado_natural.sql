-- ============================================================
-- migracion_estado_natural.sql
-- Crea la tabla de estado natural del material (polvo, líquido,
-- granular, etc.). No toca ninguna tabla existente.
-- ============================================================

CREATE TABLE IF NOT EXISTS estado_natural_material (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  material TEXT NOT NULL,
  estado_natural TEXT NOT NULL,
  documento TEXT NOT NULL,
  pagina INTEGER,
  confianza REAL DEFAULT 0.6,
  estado TEXT DEFAULT 'pendiente',
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);
