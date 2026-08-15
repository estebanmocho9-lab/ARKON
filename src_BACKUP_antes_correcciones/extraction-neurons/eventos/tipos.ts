// ============================================================
// src/extraction-neurons/eventos/tipos.ts
// Formato único de Evento. Todas las mini-neuronas (RAM) hablan
// el mismo idioma: ninguna pasa texto suelto ni objetos propios
// de un solo uso, todas emiten/reciben Eventos con esta forma.
//
// Esto NO es un sistema de colas real (no hay broker, no hay red,
// no hace falta — ARKON procesa un PDF a la vez en un solo
// proceso de Node). "Evento" acá es simplemente un objeto en un
// array en memoria. La idea se toma prestada del patrón
// event-driven solo para ORDENAR la comunicación entre módulos,
// no para meter infraestructura que no hace falta.
// ============================================================

// ── Qué tipo de hallazgo es. Uno por cada mini-neurona, más el
//    evento especial de cierre de bloque que dispara el gestor
//    de bloques cuando cambia el material activo o se llega al
//    tope de seguridad. ────────────────────────────────────────
export type TipoEvento =
  | 'material_detectado'
  | 'propiedad_detectada'
  | 'valor_detectado'
  | 'componente_detectado'
  | 'norma_detectada'
  | 'condicion_ensayo_detectada'
  | 'cierre_bloque';

// ── De dónde salió la señal, para que el Consolidador pueda
//    decidir nivel_confianza sin recalcular nada. Se mantienen
//    los mismos nombres que ya usa el motor actual (origen de
//    ContextoMaterial) más 'repeticion', que es nuevo: hace falta
//    para la regla de "segunda señal" (ver ramMateriales.ts). ────
export type OrigenEvento =
  | 'titulo'        // el dato estaba en un título de sección/capítulo
  | 'parrafo'        // apareció en prosa corrida dentro del bloque
  | 'repeticion'     // no hay título, pero se repite varias veces en el bloque
  | 'memoria'        // vino de la memoria documental (Neurona de Comprensión), como respaldo
  | 'ventana'        // se resolvió por proximidad de texto (ej. valor pegado a propiedad)
  | 'sin_determinar';

// ── Un evento genérico. T es el tipo de dato específico de cada
//    mini-neurona (ver DatoMaterial, DatoPropiedad, etc. más abajo).
//    posicion es SIEMPRE el offset absoluto dentro del texto
//    completo del documento (todas las páginas concatenadas),
//    igual que ya usa CheckpointContexto en comprension/tipos.ts —
//    así todo el sistema mide posición de la misma forma. ────────
export interface Evento<T = unknown> {
  tipo: TipoEvento;
  posicion: number;
  dato: T;
  origen: OrigenEvento;
}

// ── Payload de cada tipo de evento. Uno por mini-neurona. Los
//    campos son un subconjunto de lo que ya define
//    PropiedadExtraida en base/tipos.ts — no se inventan campos
//    nuevos, se reutiliza el vocabulario que ya existe. ──────────
export interface DatoMaterial {
  material: string;
  familia: string;
  subfamilia: string | null;
}

export interface DatoPropiedad {
  nombre_propiedad: string;
  nombre_ingles: string | null;
  sinonimos: string[];
  categoria: string;
  tipo_propiedad: string;
  simbolos: string[];
}

export interface DatoValor {
  valor: string;
  unidad: string;
  valor_minimo: number | null;
  valor_maximo: number | null;
}

export interface DatoComponente {
  nombre: string;
  materialAsociado: string | null;
}

export interface DatoNorma {
  norma: string;
}

export interface DatoCondicionEnsayo {
  condicion_ensayo: string | null;
  metodo_ensayo: string | null;
  instrumento_usado: string | null;
}

// ── Evento de cierre de bloque: no trae hallazgo propio, es la
//    señal que el gestor de bloques manda a las seis RAM para
//    que entreguen lo que juntaron y se vacíen para el próximo
//    bloque de material. ─────────────────────────────────────────
export interface DatoCierreBloque {
  bloqueId: number;
  motivo: 'cambio_material' | 'tope_seguridad' | 'fin_documento';
}
