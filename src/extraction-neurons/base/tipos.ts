// ============================================================
// src/extraction-neurons/base/tipos.ts
// Interfaces compartidas por todo el módulo de extracción.
// Módulo independiente: no importa nada de src/neurons.
// ============================================================

// ── Entrada del diccionario de propiedades ─────────────────────
export interface EntradaPropiedad {
  id: string;                  // clave interna, ej. 'densidad_real'
  nombre_es: string;
  nombre_en: string;
  sinonimos: string[];         // términos ES + EN adicionales
  simbolos: string[];          // ej. ['ρ', 'ρs']
  categoria: string;           // 'Propiedad' | 'Constante' | 'Parámetro' | 'Ecuación' | 'Ley' | 'Relación'
  tipo_propiedad: string;      // 'Física' | 'Mecánica' | 'Térmica' | 'Química' | 'Eléctrica' | 'Económica' | 'Ambiental' | 'Acústica' | 'Superficial'
  magnitudes: string[];        // claves de magnitud en unidades.ts, ej. ['densidad']
}

// ── Entrada del diccionario de materiales ──────────────────────
export interface EntradaMaterial {
  nombre_es: string;
  nombre_en: string;
  sinonimos: string[];
  familia: string;
  subfamilia: string;
  materialAsociado?: string | null; // solo lo usan los componentes: el material padre, vía id_material
}

// ── Entrada del diccionario de unidades ─────────────────────────
export interface EntradaUnidad {
  unidad: string;               // forma canónica, ej. 'kg/m3'
  variantes_texto: string[];    // formas como aparece en texto real
  magnitud: string;              // clave de magnitud física
}

// ── Entrada de instrumentos / métodos de ensayo ─────────────────
export interface EntradaInstrumento {
  nombre_es: string;
  nombre_en: string;
  sinonimos: string[];
  tipo: 'instrumento' | 'metodo';
}

// ── Entrada de atributo/cualidad descriptiva (no numérica) ───────
// Ej. "Soldabilidad", "Ductilidad", "Resistente", "Frágil" — cosas
// que un libro describe con palabras, no con un número.
export interface EntradaAtributo {
  nombre_es: string;
  nombre_en: string;
  definicion: string;               // puede venir vacío para las etiquetas simples de la matriz
  propiedades_asociadas: string;    // texto libre: qué propiedades numéricas se relacionan
  norma: string;
}

// ── Entrada de controversia científica conocida ──────────────────
// Sirve para anotar automáticamente "observaciones" cuando el texto
// toca un tema de debate real en ciencia de materiales.
export interface EntradaControversia {
  nombre_es: string;
  nombre_en: string;
  propiedad_involucrada: string;
  descripcion: string;
  relevancia: string;
}

// ── Registro final, los 26 campos + trazabilidad ────────────────
export interface PropiedadExtraida {
  neurona_id: string;
  documento: string;
  drive_file_id: string;
  pagina: number;
  capitulo: string | null;

  nombre_propiedad: string;
  nombre_ingles: string | null;
  sinonimos: string[];
  categoria: string | null;
  tipo_propiedad: string | null;
  familia_material: string | null;
  subfamilia_material: string | null;
  material: string | null;
  componente: string | null;
  estado_material: string | null;
  agente_exposicion: string | null;
  momento_exposicion: 'Antes' | 'Después' | null;
  unidad: string | null;
  simbolo: string | null;
  valor_encontrado: string | null;
  valor_minimo: number | null;
  valor_maximo: number | null;
  condicion_ensayo: string | null;
  metodo_ensayo: string | null;
  instrumento_usado: string | null;
  norma: string | null;
  ecuacion_formula: string | null;
  relacion_otras_propiedades: string | null;
  nivel_confianza: 'Explícito' | 'Inferido';
  origen_dato: 'Tabla' | 'Texto' | 'Gráfico';
  observaciones: string | null;
}

// ── Checkpoint local por neurona (para reanudar) ────────────────
export interface CheckpointNeurona {
  carpetaDriveIdResuelta?: string;
  documentosCompletos: string[];     // drive_file_id de documentos ya terminados
  documentoEnProgreso?: {
    driveFileId: string;
    ultimaPaginaCompletada: number;
  };
}

// ── Página de texto extraída de un PDF ───────────────────────────
export interface PaginaTexto {
  pagina: number;
  texto: string;
}
