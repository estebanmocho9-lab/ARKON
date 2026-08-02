-- ============================================================
-- crear_tabla_propiedades_componentes.sql
-- Corre esto en Supabase (Dashboard -> SQL Editor -> New query),
-- NO en Turso.
--
-- Tabla separada, exclusiva para propiedades de COMPONENTES
-- (ej. "Calcita" dentro de "Talco Industrial"). No toca
-- propiedades_extraidas, que de ahora en más queda solo para
-- materiales completos.
-- ============================================================

CREATE TABLE IF NOT EXISTS propiedades_componentes (
  id BIGSERIAL PRIMARY KEY,
  neurona_id TEXT,
  documento TEXT,
  drive_file_id TEXT,
  pagina INTEGER,
  capitulo TEXT,
  nombre_propiedad TEXT,
  nombre_ingles TEXT,
  sinonimos TEXT[],
  categoria TEXT,
  tipo_propiedad TEXT,
  familia_material TEXT,
  subfamilia_material TEXT,
  material_asociado TEXT,   -- a qué material pertenece este componente
  componente TEXT,           -- nombre del componente (ej. "Calcita")
  estado_material TEXT,
  agente_exposicion TEXT,
  momento_exposicion TEXT,
  unidad TEXT,
  simbolo TEXT,
  valor_encontrado TEXT,
  valor_minimo DOUBLE PRECISION,
  valor_maximo DOUBLE PRECISION,
  condicion_ensayo TEXT,
  metodo_ensayo TEXT,
  instrumento_usado TEXT,
  norma TEXT,
  ecuacion_formula TEXT,
  relacion_otras_propiedades TEXT,
  nivel_confianza TEXT,
  origen_dato TEXT,
  observaciones TEXT,
  fecha TIMESTAMP DEFAULT now()
);
