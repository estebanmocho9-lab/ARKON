// ============================================================
// src/comprehension-neuron/razonamiento/asociarValor.ts
// Decide qué valor le corresponde a un material/propiedad,
// siguiendo la jerarquía de la Sección 38: estructura antes que
// distancia. Nunca usa "el número más cercano" como primer
// criterio — eso es el último recurso (nivel 6/7), y solo si no
// hay ambigüedad.
// ============================================================

import { TablaDetectada } from '../mapa/tablas';

// ── Los 7 niveles de la Sección 38, en orden de prioridad — el
//    índice del array ES la prioridad (0 = más confiable). ────────
export type NivelEvidencia =
  | 'MISMA_CELDA'
  | 'MISMA_FILA'
  | 'ENCABEZADO_COLUMNA'
  | 'MISMO_BLOQUE'
  | 'MISMA_SECCION'
  | 'PROXIMIDAD_TEXTUAL'
  | 'PROXIMIDAD_GLOBAL';

export interface CandidatoValor {
  texto: string;
  posicion: number;
}

export interface ResultadoAsociacionValor {
  candidato: CandidatoValor | null;
  nivel: NivelEvidencia | null;
  ambiguo: boolean;
  motivo: string;
}

// ── Sección 37: un número pegado a la palabra "página" (o
// "page") inmediatamente antes no es un candidato de valor válido
// — es información documental, no un dato científico. Esto NO es
// "adivinar cuál es el número correcto", es leer una señal
// estructural explícita y literal (la palabra "página" ahí
// mismo), consistente con la Regla 39 (no inventar, pero SÍ usar
// evidencia que el documento realmente da). ─────────────────────────
function pareceNumeroDePagina(candidato: CandidatoValor, textoCompleto: string): boolean {
  const ANTES = 15;
  const contexto = textoCompleto.slice(Math.max(0, candidato.posicion - ANTES), candidato.posicion);
  return /p[aá]gina\s*$|page\s*$/i.test(contexto);
}

// ── Nivel 1-3: dentro de una tabla ya detectada. Busca la fila
//    cuya primera celda coincide con el texto del material, y
//    dentro de esa fila, la columna cuyo encabezado coincide con
//    la propiedad (si hay encabezados) — si no hay encabezados
//    utilizables, usa la segunda celda de la fila como
//    aproximación razonable (mismo criterio que ya tenía tu
//    ejemplo de la Sección 25: Material | Densidad aparente). ──────
function asociarEnTabla(materialTexto: string, propiedadTexto: string, tabla: TablaDetectada): ResultadoAsociacionValor {
  const normalizar = (t: string) => t.trim().toLowerCase();

  const filasQueMatchean = tabla.filas.filter(f => f.columnas.some(c => normalizar(c) === normalizar(materialTexto)));

  if (filasQueMatchean.length === 0) {
    return { candidato: null, nivel: null, ambiguo: false, motivo: `"${materialTexto}" no aparece como fila de esta tabla.` };
  }
  if (filasQueMatchean.length > 1) {
    return { candidato: null, nivel: 'MISMA_FILA', ambiguo: true, motivo: `"${materialTexto}" aparece en más de una fila de la tabla — no se puede decidir cuál.` };
  }

  const fila = filasQueMatchean[0];
  const indiceMaterial = fila.columnas.findIndex(c => normalizar(c) === normalizar(materialTexto));

  // ¿Hay un encabezado de columna que matchee la propiedad? →
  // NIVEL más alto (ENCABEZADO_COLUMNA), porque hay dos señales
  // estructurales de acuerdo (fila correcta Y columna correcta).
  if (tabla.encabezados) {
    const indiceColumnaPropiedad = tabla.encabezados.findIndex(h => normalizar(h).includes(normalizar(propiedadTexto)) || normalizar(propiedadTexto).includes(normalizar(h)));
    if (indiceColumnaPropiedad >= 0 && fila.columnas[indiceColumnaPropiedad]) {
      return {
        candidato: { texto: fila.columnas[indiceColumnaPropiedad], posicion: fila.posicionInicio },
        nivel: 'ENCABEZADO_COLUMNA',
        ambiguo: false,
        motivo: `Encontrado en la columna cuyo encabezado ("${tabla.encabezados[indiceColumnaPropiedad]}") coincide con la propiedad buscada, en la fila de "${materialTexto}".`,
      };
    }
  }

  // Sin encabezado utilizable: se toma la celda siguiente a la del
  // material en esa misma fila — sigue siendo MISMA_FILA, un nivel
  // más confiable que la simple cercanía textual.
  const celdaSiguiente = fila.columnas[indiceMaterial + 1];
  if (celdaSiguiente) {
    return {
      candidato: { texto: celdaSiguiente, posicion: fila.posicionInicio },
      nivel: 'MISMA_FILA',
      ambiguo: false,
      motivo: `Encontrado en la misma fila que "${materialTexto}", sin encabezado de columna que confirme la propiedad exacta.`,
    };
  }

  return { candidato: null, nivel: null, ambiguo: false, motivo: `"${materialTexto}" está en la tabla pero su fila no tiene una celda de valor.` };
}

// ── Último recurso: proximidad textual pura (niveles 6-7). Regla
//    26: nunca elegir el más cercano si hay más de un candidato
//    igualmente válido dentro del radio — eso es CANDIDATO
//    AMBIGUO, no "el que está más cerca gana". ─────────────────────
const DISTANCIA_MAXIMA_SECCION = 500;

function asociarPorProximidad(posicionReferencia: number, candidatos: CandidatoValor[], textoCompleto: string): ResultadoAsociacionValor {
  const validos = candidatos.filter(c => !pareceNumeroDePagina(c, textoCompleto));
  if (validos.length === 0) {
    return { candidato: null, nivel: null, ambiguo: false, motivo: 'No hay candidatos de valor válidos cerca (los descartados parecían números de página/coordenada).' };
  }

  const conDistancia = validos
    .map(c => ({ c, distancia: Math.abs(c.posicion - posicionReferencia) }))
    .filter(x => x.distancia <= DISTANCIA_MAXIMA_SECCION)
    .sort((a, b) => a.distancia - b.distancia);

  if (conDistancia.length === 0) {
    return { candidato: null, nivel: null, ambiguo: false, motivo: 'Ningún candidato está dentro de una distancia razonable.' };
  }

  // Si el más cercano y el segundo más cercano están a una
  // distancia MUY parecida entre sí, no hay forma honesta de
  // preferir uno — ambiguo, tal como pide el Ejemplo 3 (Sección 36).
  if (conDistancia.length > 1) {
    const [primero, segundo] = conDistancia;
    const diferenciaRelativa = Math.abs(primero.distancia - segundo.distancia);
    if (diferenciaRelativa < 20) {
      return {
        candidato: null,
        nivel: 'PROXIMIDAD_TEXTUAL',
        ambiguo: true,
        motivo: `Hay al menos dos candidatos casi igual de cerca ("${primero.c.texto}" y "${segundo.c.texto}") — no se puede elegir por proximidad sin más evidencia.`,
      };
    }
  }

  const nivel: NivelEvidencia = conDistancia[0].distancia <= 150 ? 'PROXIMIDAD_TEXTUAL' : 'PROXIMIDAD_GLOBAL';
  return {
    candidato: conDistancia[0].c,
    nivel,
    ambiguo: false,
    motivo: `Único candidato razonablemente cerca, sin estructura de tabla disponible para confirmarlo mejor.`,
  };
}

// ── Orquestador: intenta tabla primero (niveles 1-3), y solo cae a
//    proximidad (niveles 6-7) si no hay tabla en el bloque, o si
//    la tabla no incluye a este material como fila (lo cual NO es
//    lo mismo que "tabla ambigua" — si la tabla SÍ lo incluye pero
//    de forma ambigua, eso se propaga como ambiguo, nunca se
//    intenta tapar cayendo a proximidad). ──────────────────────────
export function asociarValor(input: {
  materialTexto: string | null;
  propiedadTexto: string;
  posicionReferencia: number;
  tabla: TablaDetectada | null;
  candidatosProximidad: CandidatoValor[];
  textoCompleto: string;
}): ResultadoAsociacionValor {
  const { materialTexto, propiedadTexto, posicionReferencia, tabla, candidatosProximidad, textoCompleto } = input;

  if (tabla && materialTexto) {
    const resultadoTabla = asociarEnTabla(materialTexto, propiedadTexto, tabla);
    if (resultadoTabla.ambiguo) return resultadoTabla; // no tapar ambigüedad de tabla con proximidad
    if (resultadoTabla.candidato) return resultadoTabla;
    // resultadoTabla.candidato === null y NO ambiguo → el material
    // simplemente no está en esta tabla, se prueba proximidad.
  }

  return asociarPorProximidad(posicionReferencia, candidatosProximidad, textoCompleto);
}
