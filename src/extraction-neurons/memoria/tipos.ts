// ============================================================
// src/extraction-neurons/memoria/tipos.ts
// Interfaz común que van a cumplir las seis RAM (ramMateriales,
// ramPropiedades, ramValores, ramComponentes, ramNormas,
// ramCondicionEnsayo). Cada una guarda un tipo de dato distinto,
// pero todas se comportan igual desde afuera: agregan, entregan,
// se reinician. Esto es lo que permite que gestorBloques.ts y
// consolidador.ts las traten a todas de la misma forma, sin
// necesitar saber los detalles internos de cada una.
//
// Ninguna RAM guarda nada más allá del bloque de material actual.
// Ninguna RAM decide sola si un dato es válido — eso lo hace el
// Consolidador/Validador después, con la foto completa del bloque.
// ============================================================

import { Evento } from '../eventos/tipos';

// ── Un hallazgo guardado dentro de una RAM: el dato específico
//    de esa mini-neurona + dónde apareció + de dónde salió la
//    señal (para trazabilidad, igual que ya usa el motor actual
//    en el campo "observaciones"). ───────────────────────────────
export interface HallazgoRAM<T> {
  dato: T;
  posicion: number;
  origen: Evento['origen'];
}

// ── Contrato que cumple cada RAM. T es el tipo de dato propio
//    (DatoMaterial, DatoPropiedad, etc., definidos en
//    eventos/tipos.ts). R es lo que devuelve entregar() — no
//    siempre es lo mismo que T: ramMateriales, por ejemplo,
//    entrega UN material resuelto (el "ganador" del bloque), no
//    la lista cruda de todas las menciones. ─────────────────────
export interface RAM<T, R = HallazgoRAM<T>[]> {
  // Nombre de la mini-neurona, para logs y trazabilidad
  // (ej. 'RAM-Materiales'). Se guarda en observaciones cuando
  // hace falta explicar de dónde salió un dato.
  readonly nombre: string;

  // Recibe un evento ya filtrado (el que le corresponde a esta
  // RAM) y lo guarda en su memoria interna del bloque actual.
  // No busca nada por su cuenta acá — la búsqueda/detección vive
  // en la función activar() propia de cada archivo (ver
  // ramMateriales.ts para el patrón completo).
  agregar(evento: Evento<T>): void;

  // Devuelve lo acumulado del bloque actual SIN vaciar la
  // memoria. Sirve para que otra RAM pueda "mirar" el estado de
  // esta sin consumirla (la mejora de pizarra compartida que
  // charlamos: ramValores podría consultar el estado de
  // ramPropiedades para acotar qué número busca).
  consultar(): R;

  // Devuelve lo acumulado Y vacía la memoria interna. Se llama
  // únicamente cuando llega el evento 'cierre_bloque' del gestor
  // de bloques. Después de esto la RAM queda en cero para el
  // próximo bloque de material.
  entregar(): R;

  // Cantidad de hallazgos guardados en el bloque actual (sin
  // exponer el contenido) — lo usa el gestor de bloques para
  // decidir si vale la pena seguir juntando o ya hay que cerrar
  // por el tope de seguridad de caracteres.
  cantidadAcumulada(): number;
}

// ── Config compartida por todas las RAM: el tope de seguridad de
//    caracteres para documentos sin estructura reconocible (Regla
//    del punto 5 del PDF: 50.000 caracteres por defecto). ────────
export const TOPE_SEGURIDAD_CARACTERES = parseInt(
  process.env.TOPE_SEGURIDAD_BLOQUE_CARACTERES || '50000',
  10
);

// ── Umbral de repetición: cuántas menciones dentro del bloque
//    hacen falta para considerar un dato "confirmado por
//    repetición" cuando no vino de un título. Mismo criterio que
//    ya usa detectorEstructura.ts (UMBRAL_MENCION_REPETIDA = 3),
//    reutilizado acá para que las seis RAM sean consistentes
//    entre sí. ──────────────────────────────────────────────────
export const UMBRAL_REPETICION = 3;
