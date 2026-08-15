// ============================================================
// src/extraction-neurons/memoria/ramMateriales.ts
// Mini-neurona de Materiales. Es la más importante de las seis:
// su salida ("cuál es el material activo de este bloque") es lo
// que necesitan TODAS las demás para poder guardar un registro.
//
// Diferencia clave con lo que hace hoy motorExtraccion.ts: esto
// no mira una ventana de 150 caracteres alrededor de un match.
// Mira TODO el texto del bloque de material completo (que puede
// ser una página entera o varias, hasta que el gestor de bloques
// avisa que cambió el material o se llegó al tope de seguridad).
// Así deja de importar si el material está mencionado lejos de
// su tabla de propiedades.
//
// Qué reconoce: nombres de los 21 materiales del catálogo
// (nombre_es, nombre_en, sinónimos) — mismo diccionario que ya
// existe, diccionarios/materiales.ts, sin tocarlo.
// Qué guarda: cada mención encontrada en el bloque, con su
// posición y si venía de un título o de prosa corrida.
// Qué entrega: UN material resuelto para todo el bloque (no la
// lista cruda) — el Consolidador necesita un solo "dueño" del
// bloque, no una lista de candidatos.
// ============================================================

import { EntradaMaterial } from '../base/tipos';
import { Evento, DatoMaterial, OrigenEvento } from '../eventos/tipos';
import { HallazgoRAM, RAM, UMBRAL_REPETICION } from './tipos';

function escaparRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ── Lo que entrega esta RAM al cerrar el bloque: el material
//    ganador + la fuerza de la señal que lo respalda. 'Fuerte'
//    exige DOS señales (título + repetición), no una sola — esta
//    es la mejora del punto 9.1 que veníamos hablando: antes
//    alcanzaba con encontrar el material en un título para
//    marcarlo confiable, aunque después no volviera a aparecer
//    en el resto del bloque (el caso típico del índice: aparece
//    una vez, sola, y nunca más). ────────────────────────────────
export interface MaterialResuelto {
  material: string;
  familia: string;
  subfamilia: string | null;
  fuerzaSenal: 'Fuerte' | 'Media' | 'Débil' | 'Ninguna';
  vecesEncontrado: number;
  origen: OrigenEvento;
}

// ── Detecta TODAS las menciones de materiales del catálogo
//    dentro de un texto, sin límite de ventana. Reemplaza a
//    buscarMaterialConPosicion() de motorExtraccion.ts, que hoy
//    se corta en el primer match dentro de un bloque chico. ─────
function detectarMenciones(
  texto: string,
  materiales: EntradaMaterial[]
): HallazgoRAM<DatoMaterial>[] {
  const hallazgos: HallazgoRAM<DatoMaterial>[] = [];

  for (const entrada of materiales) {
    const terminos = [entrada.nombre_es, entrada.nombre_en, ...entrada.sinonimos].filter(
      (t): t is string => !!t && t.length >= 3
    );
    for (const termino of terminos) {
      const regex = new RegExp(`\\b${escaparRegex(termino)}\\b`, 'gi');
      let match: RegExpExecArray | null;
      while ((match = regex.exec(texto)) !== null) {
        // ¿Parece título? Mismo criterio que ya usa el motor
        // actual (pareceTitulo en motorExtraccion.ts): aparece
        // muy al principio del texto que se le pasó a esta
        // función, sin ningún punto de oración antes.
        const trozoPrevio = texto.substring(0, match.index);
        const pareceTitulo = match.index < 50 && !trozoPrevio.includes('. ');

        hallazgos.push({
          dato: {
            material: entrada.nombre_es,
            familia: entrada.familia,
            subfamilia: entrada.subfamilia || null,
          },
          posicion: match.index,
          origen: pareceTitulo ? 'titulo' : 'parrafo',
        });
      }
    }
  }

  hallazgos.sort((a, b) => a.posicion - b.posicion);
  return hallazgos;
}

// ── Fábrica de la RAM. Se llama una vez por documento (o una vez
//    por neurona corriendo, según cómo lo termine llamando
//    NeuronExtraccionBase.ts) y devuelve un objeto con estado
//    propio guardado por clausura — no hace falta una clase para
//    esto, sigue el mismo estilo funcional que ya usa el resto
//    del módulo de comprensión. ──────────────────────────────────
export function crearRAMMateriales(materiales: EntradaMaterial[]): RAM<DatoMaterial, MaterialResuelto | null> {
  let hallazgosBloque: HallazgoRAM<DatoMaterial>[] = [];

  function agregar(evento: Evento<DatoMaterial>): void {
    hallazgosBloque.push({ dato: evento.dato, posicion: evento.posicion, origen: evento.origen });
  }

  // ── Escanea un tramo de texto completo y carga los hallazgos
  //    directo en la RAM. Es el método que en la práctica va a
  //    usar el gestor de bloques en vez de armar los Eventos a
  //    mano uno por uno — activarDesdeTexto() hace detección +
  //    agregar() en un solo paso. ─────────────────────────────────
  function activarDesdeTexto(texto: string, offsetBloque: number): void {
    const detectados = detectarMenciones(texto, materiales);
    for (const h of detectados) {
      hallazgosBloque.push({ ...h, posicion: offsetBloque + h.posicion });
    }
  }

  // ── Resuelve el material "ganador" del bloque. Prioridad:
  //    1) Si algún material apareció en un título Y además se
  //       repite >= UMBRAL_REPETICION veces en total (contando la
  //       del título) en el mismo bloque → 'Fuerte'.
  //    2) Si apareció en un título pero UNA sola vez, sin
  //       repetirse → 'Media' (esto es justo lo que le faltaba al
  //       sistema viejo: un índice donde el material aparece una
  //       sola vez como entrada de tabla de contenidos ya NO se
  //       marca como señal fuerte).
  //    3) Si no hay título pero un material se repite >=
  //       UMBRAL_REPETICION veces → 'Media' también (repetición
  //       sola, sin título, es la misma fuerza que título solo).
  //    4) Si hay menciones pero ninguna junta las dos condiciones
  //       de arriba → 'Débil'.
  //    5) Si no hay ninguna mención → null (el bloque no declaró
  //       material propio; quien llama decide si hereda del
  //       bloque anterior o de la memoria documental). ───────────
  function resolverGanador(): MaterialResuelto | null {
    if (hallazgosBloque.length === 0) return null;

    const conteos = new Map<string, { hallazgo: HallazgoRAM<DatoMaterial>; total: number; tuvoTitulo: boolean }>();

    for (const h of hallazgosBloque) {
      const clave = h.dato.material;
      const actual = conteos.get(clave);
      if (actual) {
        actual.total += 1;
        if (h.origen === 'titulo') actual.tuvoTitulo = true;
      } else {
        conteos.set(clave, { hallazgo: h, total: 1, tuvoTitulo: h.origen === 'titulo' });
      }
    }

    let mejor: { hallazgo: HallazgoRAM<DatoMaterial>; total: number; tuvoTitulo: boolean } | null = null;
    for (const entrada of conteos.values()) {
      if (!mejor || entrada.total > mejor.total) mejor = entrada;
    }
    if (!mejor) return null;

    let fuerzaSenal: MaterialResuelto['fuerzaSenal'];
    if (mejor.tuvoTitulo && mejor.total >= UMBRAL_REPETICION) {
      fuerzaSenal = 'Fuerte';
    } else if (mejor.tuvoTitulo || mejor.total >= UMBRAL_REPETICION) {
      fuerzaSenal = 'Media';
    } else {
      fuerzaSenal = 'Débil';
    }

    return {
      material: mejor.hallazgo.dato.material,
      familia: mejor.hallazgo.dato.familia,
      subfamilia: mejor.hallazgo.dato.subfamilia,
      fuerzaSenal,
      vecesEncontrado: mejor.total,
      origen: mejor.hallazgo.origen,
    };
  }

  function consultar(): MaterialResuelto | null {
    return resolverGanador();
  }

  function entregar(): MaterialResuelto | null {
    const resultado = resolverGanador();
    hallazgosBloque = [];
    return resultado;
  }

  function cantidadAcumulada(): number {
    return hallazgosBloque.length;
  }

  return {
    nombre: 'RAM-Materiales',
    agregar,
    consultar,
    entregar,
    cantidadAcumulada,
    // @ts-expect-error — método propio de esta RAM, no forma parte
    // del contrato genérico RAM<T,R> porque ninguna otra
    // mini-neurona escanea texto crudo de la misma forma (las
    // demás dependen del material ya resuelto, no vuelven a leer
    // el bloque entero buscando su propio diccionario desde cero
    // de la misma manera). Se deja expuesto igual porque
    // gestorBloques.ts lo necesita llamar directo.
    activarDesdeTexto,
  };
}
