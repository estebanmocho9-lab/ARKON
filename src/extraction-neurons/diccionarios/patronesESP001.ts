// ============================================================
// src/extraction-neurons/diccionarios/patronesESP001.ts
// Diccionario NUEVO, separado de todo lo que ya existía.
// Cubre las secciones de ESP-001 (ver documento "ARKON KNOWLEDGE
// EXTRACTION STANDARD") que las NE (neuronas de extracción de
// propiedades) todavía no buscaban: SIGNIFICADO, FUNCIÓN,
// FACTORES QUE MODIFICAN EL VALOR, RELACIONES, PROCESOS,
// APLICACIONES, VENTAJAS, LIMITACIONES, IDENTIDAD EXTENDIDA
// (nombres en otros idiomas / clasificación) y BIBLIOGRAFÍA.
//
// Mismo enfoque que ya usa el proyecto: regex + diccionario,
// nada de IA. Reutiliza el tipo PatronAmpliado que ya existía en
// patronesAmpliados.ts en vez de duplicarlo.
//
// NO SE TOCÓ patronesAmpliados.ts NI NINGÚN OTRO DICCIONARIO
// EXISTENTE. Este archivo es 100% aparte.
// ============================================================

import { PatronAmpliado } from './patronesAmpliados';

// -- Sección 3: SIGNIFICADO — qué representa/describe/caracteriza --
export const PATRONES_SIGNIFICADO: PatronAmpliado[] = [
  { categoria: 'representa', regex: /\brepresenta\s+[^.;\n]{2,140}/i },
  { categoria: 'describe', regex: /\bdescribe\s+(?:el|la|los|las)\s+[^.;\n]{2,140}/i },
  { categoria: 'caracteriza', regex: /\bcaracteriza\s+[^.;\n]{2,140}/i },
  { categoria: 'cuantifica', regex: /\bcuantifica\s+[^.;\n]{2,140}/i },
  { categoria: 'indica', regex: /\bindica\s+(?:el|la|que)\s+[^.;\n]{2,140}/i },
  { categoria: 'refleja', regex: /\brefleja\s+[^.;\n]{2,140}/i },
  { categoria: 'expresa', regex: /\bexpresa\s+[^.;\n]{2,140}/i },
];

// -- Sección 4: FUNCIÓN — qué mide/calcula/determina/predice, para qué sirve --
export const PATRONES_FUNCION: PatronAmpliado[] = [
  { categoria: 'permite_medir_calcular', regex: /\bpermite\s+(?:medir|calcular|determinar|comparar|evaluar|estimar|predecir)\s+[^.;\n]{2,140}/i },
  { categoria: 'se_utiliza_para', regex: /\bse\s+utiliza\s+para\s+[^.;\n]{2,140}/i },
  { categoria: 'sirve_para', regex: /\bsirve\s+para\s+[^.;\n]{2,140}/i },
  { categoria: 'importancia', regex: /\bes\s+importante\s+porque\s+[^.;\n]{2,150}/i },
  { categoria: 'permite_decidir', regex: /\bpermite\s+tomar\s+decisiones\s+[^.;\n]{2,140}/i },
];

// -- Sección 10: FACTORES QUE MODIFICAN EL VALOR --
export const PATRONES_FACTORES: PatronAmpliado[] = [
  { categoria: 'aumenta_con', regex: /\baumenta\s+(?:con|al)\s+(?:la|el)\s+[^.;\n]{2,90}/i },
  { categoria: 'disminuye_con', regex: /\bdisminuye\s+(?:con|al)\s+(?:la|el)\s+[^.;\n]{2,90}/i },
  { categoria: 'varia_con', regex: /\bvar[ií]a\s+(?:con|seg[uú]n)\s+[^.;\n]{2,110}/i },
  { categoria: 'afectado_por', regex: /\bse\s+ve\s+afectad[oa]\s+por\s+[^.;\n]{2,110}/i },
  { categoria: 'influenciado_por', regex: /\binfluenciad[oa]\s+por\s+[^.;\n]{2,110}/i },
  { categoria: 'depende_de_condicion', regex: /\ba\s+mayor\s+[^.;\n]{2,60},?\s+(?:mayor|menor)\s+[^.;\n]{2,60}/i },
];

// -- Sección 11: RELACIONES con otras propiedades/materiales --
export const PATRONES_RELACIONES: PatronAmpliado[] = [
  { categoria: 'depende_de', regex: /\bdepende\s+de\s+[^.;\n]{2,110}/i },
  { categoria: 'relacionado_con', regex: /\best[aá]\s+relacionad[oa]\s+con\s+[^.;\n]{2,110}/i },
  { categoria: 'compatible_con', regex: /\bes\s+compatible\s+con\s+[^.;\n]{2,110}/i },
  { categoria: 'incompatible_con', regex: /\bes\s+incompatible\s+con\s+[^.;\n]{2,110}/i },
  { categoria: 'proporcional_a', regex: /\b(?:directamente\s+)?proporcional\s+a\s+[^.;\n]{2,110}/i },
  { categoria: 'inversamente_proporcional_a', regex: /\binversamente\s+proporcional\s+a\s+[^.;\n]{2,110}/i },
];

// -- Sección 14: PROCESOS que generan/modifican/destruyen la propiedad --
export const PATRONES_PROCESOS: PatronAmpliado[] = [
  { categoria: 'proceso_genera', regex: /\bse\s+genera\s+(?:mediante|durante|por)\s+[^.;\n]{2,110}/i },
  { categoria: 'proceso_modifica', regex: /\bse\s+modifica\s+(?:mediante|durante|por)\s+[^.;\n]{2,110}/i },
  { categoria: 'proceso_destruye', regex: /\bse\s+(?:destruye|pierde|degrada)\s+(?:mediante|durante|por|cuando)\s+[^.;\n]{2,110}/i },
  { categoria: 'proceso_asociado', regex: /\bdurante\s+el\s+proceso\s+de\s+[^.;\n]{2,110}/i },
];

// -- Sección 15: APLICACIONES donde la propiedad es importante --
export const PATRONES_APLICACIONES: PatronAmpliado[] = [
  { categoria: 'aplicacion', regex: /\bse\s+aplica\s+en\s+[^.;\n]{2,110}/i },
  { categoria: 'uso_industria', regex: /\butilizad[oa]\s+en\s+la\s+industria\s+de\s+[^.;\n]{2,110}/i },
  { categoria: 'empleado_en', regex: /\bempleado\s+en\s+[^.;\n]{2,110}/i },
  { categoria: 'critico_en', regex: /\bes\s+cr[ií]tic[oa]\s+en\s+[^.;\n]{2,110}/i },
];

// -- Sección 16: VENTAJAS / beneficios --
export const PATRONES_VENTAJAS: PatronAmpliado[] = [
  { categoria: 'ventaja', regex: /\bventaja\s+(?:principal\s+)?(?:de|es)\s+[^.;\n]{2,110}/i },
  { categoria: 'beneficio', regex: /\bbeneficios?\s+(?:de|incluyen?)\s+[^.;\n]{2,110}/i },
  { categoria: 'fortaleza', regex: /\bfortaleza\s+[^.;\n]{2,110}/i },
];

// -- Sección 17: LIMITACIONES / desventajas / riesgos --
export const PATRONES_LIMITACIONES: PatronAmpliado[] = [
  { categoria: 'limitacion', regex: /\blimitaci[oó]n\s+(?:principal\s+)?(?:de|es)\s+[^.;\n]{2,110}/i },
  { categoria: 'desventaja', regex: /\bdesventaja\s+[^.;\n]{2,110}/i },
  { categoria: 'riesgo', regex: /\briesgo\s+de\s+[^.;\n]{2,110}/i },
  { categoria: 'advertencia', regex: /\badvertencia:?\s+[^.;\n]{2,110}/i },
];

// -- Sección 1 (ampliación): nombres en otros idiomas / clasificación,
//    lo que NO cubría ya el diccionario de propiedades (nombre_es/en,
//    sinónimos, símbolos) --
export const PATRONES_IDENTIDAD_EXTENDIDA: PatronAmpliado[] = [
  { categoria: 'tambien_conocido_como', regex: /\btambi[eé]n\s+conocid[oa]\s+como\s+[^.;\n]{2,90}/i },
  { categoria: 'nombre_aleman', regex: /\ben\s+alem[aá]n:?\s+[^.;\n]{2,70}/i },
  { categoria: 'nombre_frances', regex: /\ben\s+franc[eé]s:?\s+[^.;\n]{2,70}/i },
  { categoria: 'nombre_portugues', regex: /\ben\s+portugu[eé]s:?\s+[^.;\n]{2,70}/i },
  { categoria: 'nombre_italiano', regex: /\ben\s+italiano:?\s+[^.;\n]{2,70}/i },
  { categoria: 'clasificacion', regex: /\bclasificad[oa]\s+como\s+[^.;\n]{2,110}/i },
  { categoria: 'familia_cientifica', regex: /\bpertenece\s+a\s+la\s+familia\s+de\s+[^.;\n]{2,110}/i },
];

// -- Sección 19: BIBLIOGRAFÍA — citas dentro del propio texto --
export const PATRONES_BIBLIOGRAFIA: PatronAmpliado[] = [
  { categoria: 'cita_autor_anio', regex: /\b(?:seg[uú]n|de\s+acuerdo\s+con)\s+[A-ZÀ-ÿ][\wÀ-ÿ.]+(?:\s+et\s+al\.?)?\s*\(\d{4}\)/ },
  { categoria: 'doi', regex: /\bDOI:?\s*10\.\d{4,9}\/\S+/i },
  { categoria: 'isbn', regex: /\bISBN:?\s*[\d-]{10,17}/i },
];
