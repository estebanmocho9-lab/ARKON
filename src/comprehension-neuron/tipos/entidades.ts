// ============================================================
// src/comprehension-neuron/tipos/entidades.ts
// La ficha de cada tipo de entidad que ARKON puede identificar.
// Nada de esto guarda TEXTO SUELTO como significado — cada campo
// de texto acá es descriptivo (para que vos y Claude lo lean),
// el significado real del sistema vive en los IDs y sus
// relaciones (ver relaciones.ts).
// ============================================================

import { Id } from './ids';

// ── Representación matemática de una dimensión física (Parte 2).
//    Vive acá, y no en conocimiento/dimensionesFisicas.ts como
//    sugería el documento, por una razón técnica concreta: este
//    archivo (entidades.ts) es importado por casi todo el sistema,
//    incluida la Dimension de más abajo — si VectorDimension
//    viviera en conocimiento/, entidades.ts tendría que importar
//    de conocimiento/ y conocimiento/ ya importa de entidades.ts,
//    lo que arma un ciclo de imports. conocimiento/dimensionesFisicas.ts
//    reexporta este mismo tipo, así que desde ahí se ve igual. ────
export interface VectorDimension {
  M: number;
  L: number;
  T: number;
  I: number;
  Theta: number;
  N: number;
  J: number;
}

// ── PAL — palabra/token literal, tal como apareció. Capa
//    lingüística: lo que el documento realmente dice. ─────────────
export interface Palabra {
  id: Id<'PAL'>;
  texto_original: string; // "expandida", tal como está en el PDF
  texto_normalizado: string; // "expandida", en minúsculas sin acentos
}

// ── CON — concepto: una o más Palabras combinadas CON significado
//    propio, construido solo cuando el contexto lo justifica. Este
//    es el que resuelve el problema "Vermiculita" ≠ "Vermiculita
//    expandida" del que veníamos hablando. ─────────────────────────
export interface Concepto {
  id: Id<'CON'>;
  palabras: Id<'PAL'>[]; // las palabras que lo componen, en orden
  texto: string; // "Vermiculita expandida" — para lectura humana
  // A qué entidad de más alto nivel resuelve este concepto, si ya
  // se resolvió (un Concepto puede existir sin resolver todavía a
  // ningún MAT/PRO — ej. mientras se está evaluando la hipótesis).
  resuelveA: { tipo: 'MAT' | 'PRO' | 'COM'; id: Id } | null;
}

// ── FAM — familia de material (Arcillas, Puzolanas naturales,
//    Fibras, Pigmentos...). Agrupa MATs, no tiene ficha física
//    propia. ─────────────────────────────────────────────────────
export interface Familia {
  id: Id<'FAM'>;
  nombre: string;
}

// ── MAT — material. Ficha maestra del concepto, separada de dónde
//    apareció (eso es EVI) y de qué se dijo de él en un documento
//    puntual (eso es REL). ──────────────────────────────────────
export interface Material {
  id: Id<'MAT'>;
  nombre_principal: string;
  nombre_en: string | null;
  sinonimos: string[];
  familia: Id<'FAM'>;
  subfamilia: string | null;
  // Si este material es una VARIANTE de un material base (ver
  // variantes.ts) — ej. si tuvieras "Perlita" Y "Perlita
  // Expandida" como dos entidades separadas, acá iría el vínculo.
  // En tu catálogo actual esto queda en null para los 21 (cada uno
  // ya es una entidad de nombre completo, no hay una versión "base"
  // separada) — se deja preparado para cuando haga falta.
  variante_de: Id<'VAR'> | null;
  estado: 'activo' | 'inactivo';
}

// ── VAR — variante: registra que un término tiene un MODIFICADOR
//    (Expandida, Molido, Activado...) que cambia el significado del
//    término base. Sirve de guardia: si el PDF dice solo la palabra
//    base ("vermiculita"), el sistema NO debe asumir que se refiere
//    al material con el modificador. ─────────────────────────────
export interface Variante {
  id: Id<'VAR'>;
  terminoBase: string; // "vermiculita"
  modificador: string; // "expandida"
  materialResultante: Id<'MAT'> | null; // a qué MAT corresponde el término CON el modificador, si existe en el catálogo
}

// ── MAG — magnitud física (densidad, temperatura, pH...). Lo que
//    una propiedad MIDE, en abstracto, más allá del material o la
//    unidad concreta. ────────────────────────────────────────────
export interface Magnitud {
  id: Id<'MAG'>;
  nombre: string; // clave tal como aparece en propiedades.ts (ej. "densidad")
  dimension: Id<'DIM'> | 'PENDIENTE_DEFINIR';
}

// ── DIM — dimensión física, en notación M L T Θ I N J (masa,
//    longitud, tiempo, temperatura, corriente, cantidad de
//    sustancia, intensidad luminosa) — o 'adimensional'. ──────────
export interface Dimension {
  id: Id<'DIM'>;
  nombre: string; // "Densidad"
  formula: string; // "M L⁻³", o "adimensional" — para mostrar, no para comparar
  // Representación matemática real, para comparar dimensiones sin
  // depender de comparar texto (Parte 2, sección 5-6). null en las
  // ~155 magnitudes ultra-especializadas que todavía no revisamos
  // — nunca se inventa un vector para esas.
  vector: VectorDimension | null;
}

// ── UNI — unidad concreta (kg/m³, MPa, °C...). Sabe a qué
//    magnitud pertenece — eso es lo que permite el chequeo de
//    compatibilidad dimensional (Regla 6 de tu documento: nunca
//    aceptar una unidad incompatible con la propiedad). ───────────
export interface Unidad {
  id: Id<'UNI'>;
  simbolo: string; // "kg/m3"
  variantes_texto: string[];
  magnitud: Id<'MAG'>;
  // Factor multiplicativo para convertir ESTA unidad a la unidad
  // base de su magnitud (Parte 2, conversionesUnidades.ts). null
  // cuando no lo tenemos confirmado — nunca se inventa un factor.
  // OJO: esto solo sirve para unidades con conversión multiplicativa
  // simple (kg/m³↔g/cm³). Temperatura (°C↔K) es afín, no
  // multiplicativa — nunca lleva factor acá, se maneja aparte.
  factorAUnidadBase: number | null;
}

// ── PRO — propiedad. La ficha más importante junto con MAT: no
//    solo el nombre, sino a qué magnitud pertenece (y por lo tanto
//    qué unidades son compatibles). ──────────────────────────────
export interface Propiedad {
  id: Id<'PRO'>;
  nombre_principal: string;
  nombre_en: string | null;
  sinonimos: string[];
  simbolos: string[];
  categoria: string; // 'Propiedad' | 'Constante' | 'Ecuación' | 'Ley' (tal como ya lo tenés)
  tipo_propiedad: string;
  magnitudes: Id<'MAG'>[]; // una propiedad puede tener más de una magnitud válida (ej. 'porcentaje' Y 'adimensional')
}

// ── COM — componente (óxidos, elementos, compuestos). ─────────────
export interface Componente {
  id: Id<'COM'>;
  nombre: string;
  nombre_en: string | null;
  sinonimos: string[];
  materialAsociado: Id<'MAT'> | null;
}

// ── NOR — norma / organismo normativo. No enumerable uno por uno
//    (hay miles de normas ASTM/ISO puntuales) — acá se identifica
//    el ORGANISMO, no cada norma individual; la norma completa
//    (ej. "ASTM C618") queda en el texto de la Evidencia. ─────────
export interface OrganismoNorma {
  id: Id<'NOR'>;
  nombre: string; // "ASTM", "ISO", "IRAM"...
  patron: string; // el regex.source usado para reconocerlo
}

// ── MET — método de ensayo, INS — instrumento. Separados aunque
//    vengan del mismo diccionario de origen (instrumentos.ts ya
//    los distingue por el campo tipo). ────────────────────────────
export interface Metodo {
  id: Id<'MET'>;
  nombre_es: string;
  nombre_en: string | null;
  sinonimos: string[];
}

export interface Instrumento {
  id: Id<'INS'>;
  nombre_es: string;
  nombre_en: string | null;
  sinonimos: string[];
}

// ── CND — condición de ensayo (patrón de frase, no catálogo
//    cerrado — igual que las normas). ─────────────────────────────
export interface PatronCondicion {
  id: Id<'CND'>;
  descripcion: string; // "temperatura en grados Celsius", etc.
  patron: string; // regex.source
}
