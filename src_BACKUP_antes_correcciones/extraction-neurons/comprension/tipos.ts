// ============================================================
// src/extraction-neurons/comprension/tipos.ts
// Estructuras de datos de la Neurona de Comprensión Documental.
// Basado 1 a 1 en "Diseño de la Neurona de Comprensión
// Documental v1.0". Esta neurona NO extrae, NO guarda, NO
// calcula — solo construye esta memoria en RAM, que después se
// descarta (nunca se escribe en Turso, tal como pide el diseño).
// ============================================================

// ── Un nodo del árbol jerárquico del documento (Etapa 2) ────────
// tipo: qué clase de bloque es. posicionInicio/Fin: offsets de
// caracteres dentro del texto completo del documento (todas las
// páginas concatenadas), para poder ubicar rápido en qué nodo
// cae cualquier hallazgo posterior.
export type TipoNodo =
  | 'titulo'
  | 'capitulo'
  | 'subcapitulo'
  | 'seccion'
  | 'subseccion'
  | 'tabla'
  | 'figura'
  | 'nota'
  | 'referencias'
  | 'bibliografia'
  | 'anexo'
  | 'indice'
  | 'apendice';

export interface NodoEstructura {
  tipo: TipoNodo;
  titulo: string;
  nivel: number;              // profundidad en el árbol (1 = capítulo, 2 = subcapítulo, ...)
  posicionInicio: number;     // offset en el texto completo del documento
  posicionFin: number;
  hijos: NodoEstructura[];
}

// ── Un "checkpoint" de contexto: el estado de lectura en un punto
//    determinado del documento (Etapa 3, 4 y 5). En vez de
//    reconstruir el árbol cada vez, guardamos una lista ordenada
//    por posición: cuando otra neurona pregunta "¿qué material
//    está activo en el carácter 48.200?", buscamos el checkpoint
//    más reciente con posicion <= 48.200. ────────────────────────
export interface CheckpointContexto {
  posicion: number;           // desde qué offset del texto rige este estado
  materialActivo: string | null;
  familiaActiva: string | null;
  subfamiliaActiva: string | null;
  capituloActivo: string | null;
  seccionActiva: string | null;
  propiedadActiva: string | null;
  unidadActiva: string | null;
  enTabla: boolean;
  enFigura: boolean;
  // Tipo de nodo estructural que contiene esta posición (índice,
  // bibliografía, referencias, tabla, capítulo, texto corrido...).
  // null = no hay ningún nodo declarado ahí (texto corrido normal).
  tipoNodoActivo: TipoNodo | null;
  // Cómo se determinó el material activo, para que las neuronas de
  // extracción puedan decidir el nivel_confianza sin recalcular nada:
  //  - 'titulo_seccion': el material está declarado en el título del
  //    capítulo/sección actual (señal fuerte).
  //  - 'mencion_repetida': el material no está en ningún título, pero
  //    se repite varias veces en el bloque actual (señal media).
  //  - 'sin_determinar': no se pudo establecer con confianza.
  origenMaterialActivo: 'titulo_seccion' | 'mencion_repetida' | 'sin_determinar';
}

// ── La Memoria Temporal completa de un documento (Etapa 4) ──────
export interface MemoriaTemporalDocumento {
  documento: string;              // nombre del archivo
  driveFileId: string;
  idioma: 'es' | 'en' | 'mixto' | 'desconocido';
  temaPrincipal: string | null;   // mejor estimación de "de qué trata el documento en general"
  autor: string | null;
  norma: string | null;
  anio: number | null;
  tipoDocumento: string | null;   // 'Libro' | 'Manual' | 'Norma técnica' | 'Paper' | 'Ficha técnica' | ...

  // Árbol jerárquico completo (Etapa 2)
  arbol: NodoEstructura[];

  // Línea de tiempo de contexto, ORDENADA por posición ascendente
  // (Etapa 3-5). Es lo que realmente van a consultar las demás
  // neuronas — el árbol de arriba es más para diagnóstico/depuración.
  lineaDeTiempo: CheckpointContexto[];

  // Materiales de tu catálogo que este documento menciona con
  // densidad suficiente como para considerarlos un tema real del
  // documento (no solo una mención de paso). Ver Paso 5 del filtro
  // de relevancia — esta lista es la versión "aprobada" de esos
  // materiales, ya filtrando el ruido de menciones sueltas.
  materialesRelevantes: string[];

  // Nivel de confianza general de la comprensión lograda sobre este
  // documento (no de un dato puntual): 'Alto' si el documento tiene
  // estructura clara (títulos numerados, capítulos declarados), 'Bajo'
  // si el texto vino sin estructura reconocible (ej. PDF escaneado
  // con OCR de mala calidad, todo en un bloque corrido).
  nivelConfianzaComprension: 'Alto' | 'Medio' | 'Bajo';
}

// ── Resultado de consultar la memoria en una posición puntual ───
// Esto es lo que usará motorExtraccion.ts en reemplazo directo de
// lo que hoy hace buscarMaterial() por ventana de caracteres.
export interface ContextoEnPosicion {
  materialActivo: string | null;
  familiaActiva: string | null;
  subfamiliaActiva: string | null;
  capituloActivo: string | null;
  seccionActiva: string | null;
  enTabla: boolean;
  enFigura: boolean;
  tipoNodoActivo: TipoNodo | null;
  origenMaterialActivo: CheckpointContexto['origenMaterialActivo'];
}
