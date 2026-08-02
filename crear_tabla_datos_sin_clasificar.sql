-- ============================================================
-- crear_tabla_datos_sin_clasificar.sql
-- Corre esto en Supabase (Dashboard -> SQL Editor -> New query),
-- NO en Turso.
--
-- "Red de seguridad": todo lo que el motor detecta con forma de
-- dato (número+unidad no catalogada, o "etiqueta: valor") pero
-- que no matcheó ninguna propiedad conocida del catálogo. Para
-- revisar después y, si corresponde, sumar propiedades nuevas.
-- ============================================================

CREATE TABLE IF NOT EXISTS datos_sin_clasificar (
  id BIGSERIAL PRIMARY KEY,
  neurona_id TEXT,
  documento TEXT,
  pagina INTEGER,
  fragmento TEXT,
  numero TEXT,
  unidad_o_etiqueta TEXT,
  revisado BOOLEAN DEFAULT false,
  creado_en TIMESTAMP DEFAULT now()
);
