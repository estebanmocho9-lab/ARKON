// ============================================================
// src/extraction-neurons/memoria/ramPropiedades.ts
// Mini-neurona de Propiedades.
//
// Qué reconoce: los ~200 términos de propiedad de tu catálogo
// (nombre_es, nombre_en, sinónimos) — mismo diccionario de
// siempre, diccionarios/propiedades.ts, sin tocarlo.
// Qué guarda: cada mención encontrada en el bloque completo, con
// su posición, y los datos de la propiedad que va a necesitar el
// Consolidador después (magnitudes válidas para emparejar con
// ramValores, símbolos para emparejar con ecuaciones).
// Qué entrega: la LISTA completa de propiedades vistas en el
// bloque — a diferencia de ramMateriales, acá no hay "un solo
// ganador": un mismo bloque de material perfectamente puede (y
// suele) tener diez propiedades distintas, todas válidas.
//
// Diferencia clave con motorExtraccion.ts actual: la función
// extraerPropiedadesDeBloque() de hoy busca la propiedad Y de
// una toma una ventana de 150 caracteres para buscarle el valor
// al lado, todo en el mismo paso. Acá se separan las dos cosas:
// esta RAM solo detecta y guarda DÓNDE aparece cada propiedad.
// El emparejamiento con el valor más cercano lo hace el
// Consolidador al cerrar el bloque, cuando ya tiene la lista
// completa de valores que juntó ramValores.ts (lote 3) — así el
// emparejamiento sigue siendo "cerca en el texto" (esa parte del
// diseño viejo estaba bien, un valor SÍ suele estar pegado a su
// propiedad), pero ya no depende de que el MATERIAL esté cerca.
// ============================================================

import { EntradaPropiedad } from '../base/tipos';
import { Evento, DatoPropiedad } from '../eventos/tipos';
import { HallazgoRAM, RAM } from './tipos';

function escaparRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ── Detecta TODAS las menciones de propiedades del catálogo
//    dentro de un texto completo, sin ventana. Reemplaza a la
//    parte de "encontrar el término" que hoy vive adentro de
//    extraerPropiedadesDeBloque() — la parte de buscarle el
//    valor al lado se queda en ramValores.ts + Consolidador. ────
function detectarMenciones(
  texto: string,
  propiedades: EntradaPropiedad[]
): HallazgoRAM<DatoPropiedad>[] {
  const hallazgos: HallazgoRAM<DatoPropiedad>[] = [];

  for (const propiedad of propiedades) {
    const terminos = [propiedad.nombre_es, propiedad.nombre_en, ...propiedad.sinonimos].filter(Boolean);

    for (const termino of terminos) {
      const regex = new RegExp(`\\b${escaparRegex(termino)}\\b`, 'gi');
      let match: RegExpExecArray | null;
      while ((match = regex.exec(texto)) !== null) {
        const trozoPrevio = texto.substring(0, match.index);
        const pareceTitulo = match.index < 50 && !trozoPrevio.includes('. ');

        hallazgos.push({
          dato: {
            nombre_propiedad: propiedad.nombre_es,
            nombre_ingles: propiedad.nombre_en,
            sinonimos: propiedad.sinonimos,
            categoria: propiedad.categoria,
            tipo_propiedad: propiedad.tipo_propiedad,
            simbolos: propiedad.simbolos,
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

export function crearRAMPropiedades(propiedades: EntradaPropiedad[]): RAM<DatoPropiedad> {
  let hallazgosBloque: HallazgoRAM<DatoPropiedad>[] = [];

  function agregar(evento: Evento<DatoPropiedad>): void {
    hallazgosBloque.push({ dato: evento.dato, posicion: evento.posicion, origen: evento.origen });
  }

  // ── Igual que ramMateriales: método propio para escanear un
  //    bloque de texto entero de una sola vez, en vez de armar
  //    los Eventos a mano uno por uno. ─────────────────────────────
  function activarDesdeTexto(texto: string, offsetBloque: number): void {
    const detectados = detectarMenciones(texto, propiedades);
    for (const h of detectados) {
      hallazgosBloque.push({ ...h, posicion: offsetBloque + h.posicion });
    }
  }

  function consultar(): HallazgoRAM<DatoPropiedad>[] {
    return [...hallazgosBloque];
  }

  function entregar(): HallazgoRAM<DatoPropiedad>[] {
    const resultado = [...hallazgosBloque];
    hallazgosBloque = [];
    return resultado;
  }

  function cantidadAcumulada(): number {
    return hallazgosBloque.length;
  }

  return {
    nombre: 'RAM-Propiedades',
    agregar,
    consultar,
    entregar,
    cantidadAcumulada,
    // @ts-expect-error — mismo caso que en ramMateriales.ts: método
    // propio de escaneo directo, no forma parte del contrato
    // genérico porque no todas las RAM escanean texto crudo de la
    // misma manera (ramValores, por ejemplo, necesita saber qué
    // unidades buscar, no solo el texto).
    activarDesdeTexto,
  };
}
