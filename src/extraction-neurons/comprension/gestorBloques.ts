// ============================================================
// src/extraction-neurons/comprension/gestorBloques.ts
// Gestor de Bloques de Material — la pieza que hoy NO existe en
// el sistema y que hace falta para que las seis mini-neuronas de
// memoria/ sepan cuándo entregar lo que juntaron.
//
// Va en comprension/ (no en memoria/) porque su trabajo es 100%
// de comprensión: lee la Memoria Temporal que ya construyó
// construirMemoriaTemporal() y decide, a partir de ella, dónde
// empieza y dónde termina cada "bloque de material" del
// documento. No busca materiales, propiedades ni nada por su
// cuenta — reusa lo que la Neurona de Comprensión ya calculó.
//
// De dónde saca los cortes de bloque: de la lineaDeTiempo de la
// Memoria Temporal (memoria.lineaDeTiempo), que ya tiene, checkpoint
// a checkpoint, cuál es el material activo en cada posición del
// documento. Un bloque nuevo arranca cada vez que el material
// activo cambia de un checkpoint al siguiente — es exactamente
// el mismo criterio que ya definiste: "título de sección con
// material, línea sola con nombre de material, o tabla titulada
// con material" (eso ya lo resuelve la Neurona de Comprensión al
// armar la lineaDeTiempo, acá no se recalcula).
//
// Además, y esto es la pieza que faltaba para el bug del índice:
// para cada bloque, busca en el árbol (memoria.arbol) qué tipo de
// nodo lo contiene (índice, bibliografía, referencias, tabla,
// texto normal...) y lo deja marcado en tipoNodoDominante. Con
// eso, más adelante, el Validador puede aplicar la regla directa:
// "si el bloque es índice/bibliografía/referencias, nunca generar
// un registro de material" — sin esa marca, el sistema no tiene
// forma de distinguir una mención real de una mención de índice.
// ============================================================

import { MemoriaTemporalDocumento, NodoEstructura, TipoNodo } from './tipos';
import { TOPE_SEGURIDAD_CARACTERES } from '../memoria/tipos';

// ── Tipos de nodo que nunca deben producir un registro de datos,
//    aunque el texto mencione un material o una propiedad —
//    exactamente el caso de tu bug ("resina epoxi" en el índice). ─
export const TIPOS_NODO_DESCARTABLES: TipoNodo[] = ['indice', 'bibliografia', 'referencias'];

export interface BloqueMaterial {
  id: number;
  inicio: number;                          // offset absoluto en el texto completo del documento
  fin: number;
  materialDeclarado: string | null;        // el que ya resolvió la Neurona de Comprensión para este tramo
  origenMaterialDeclarado: 'titulo_seccion' | 'mencion_repetida' | 'sin_determinar';
  capituloActivo: string | null;
  seccionActiva: string | null;
  tipoNodoDominante: TipoNodo | null;      // null = texto corrido, sin nodo estructural declarado
  motivoCierre: 'cambio_material' | 'tope_seguridad' | 'fin_documento';
}

// ── Busca, para una posición dada, el nodo más profundo del
//    árbol que la contiene. Recorre recursivo porque los nodos
//    están anidados (capítulo → subcapítulo → tabla, etc.) y nos
//    interesa el más específico, no el capítulo entero. ──────────
function nodoMasProfundoEnPosicion(nodos: NodoEstructura[], posicion: number): NodoEstructura | null {
  let encontrado: NodoEstructura | null = null;

  for (const nodo of nodos) {
    if (posicion >= nodo.posicionInicio && posicion < nodo.posicionFin) {
      encontrado = nodo;
      const enHijo = nodoMasProfundoEnPosicion(nodo.hijos, posicion);
      if (enHijo) encontrado = enHijo;
    }
  }

  return encontrado;
}


// ── Fusiona checkpoints consecutivos que comparten el MISMO
//    material — evita un bloque nuevo por cada "Figura N"/"Tabla N"
//    citada de paso, que no representa un cambio real de material.
//    Si en el tramo fusionado hay una señal más fuerte que la del
//    primer checkpoint, se conserva esa señal más fuerte. ─────────
function agruparCheckpointsPorMaterial(
  checkpoints: MemoriaTemporalDocumento['lineaDeTiempo']
): MemoriaTemporalDocumento['lineaDeTiempo'] {
  const prioridad: Record<string, number> = {
    titulo_seccion: 2,
    mencion_repetida: 1,
    sin_determinar: 0,
  };
  const agrupados: MemoriaTemporalDocumento['lineaDeTiempo'] = [];

  for (const cp of checkpoints) {
    const ultimo = agrupados[agrupados.length - 1];
    if (ultimo && ultimo.materialActivo === cp.materialActivo) {
      if (prioridad[cp.origenMaterialActivo] > prioridad[ultimo.origenMaterialActivo]) {
        ultimo.origenMaterialActivo = cp.origenMaterialActivo;
      }
      continue;
    }
    agrupados.push({ ...cp });
  }

  return agrupados;
}
// ── Arma la lista completa de bloques de material para todo el
//    documento, a partir de la Memoria Temporal ya construida y
//    la longitud total del texto (para cerrar el último bloque). ─
export function calcularBloques(
  memoria: MemoriaTemporalDocumento,
  longitudTextoCompleto: number
): BloqueMaterial[] {
  const bloques: BloqueMaterial[] = [];

  if (memoria.lineaDeTiempo.length === 0) {
    // Documento sin ninguna estructura reconocible: un solo bloque
    // gigante, que el tope de seguridad se va a encargar de trocear
    // más adelante si hace falta (ver trocearPorTopeSeguridad).
    return trocearPorTopeSeguridad(
      {
        id: 0,
        inicio: 0,
        fin: longitudTextoCompleto,
        materialDeclarado: null,
        origenMaterialDeclarado: 'sin_determinar',
        capituloActivo: null,
        seccionActiva: null,
        tipoNodoDominante: null,
        motivoCierre: 'fin_documento',
      },
      memoria.arbol
    );
  }
const checkpoints = agruparCheckpointsPorMaterial(memoria.lineaDeTiempo);
  let idBloque = 0;

  for (let i = 0; i < checkpoints.length; i++) {
    const actual = checkpoints[i];
    const siguiente = checkpoints[i + 1];
    const inicio = actual.posicion;
    const fin = siguiente ? siguiente.posicion : longitudTextoCompleto;

    const nodoDominante = nodoMasProfundoEnPosicion(memoria.arbol, inicio);

    const bloqueBase: BloqueMaterial = {
      id: idBloque,
      inicio,
      fin,
      materialDeclarado: actual.materialActivo,
      origenMaterialDeclarado: actual.origenMaterialActivo,
      capituloActivo: actual.capituloActivo,
      seccionActiva: actual.seccionActiva,
      tipoNodoDominante: nodoDominante ? nodoDominante.tipo : null,
      motivoCierre: siguiente ? 'cambio_material' : 'fin_documento',
    };

    const troceados = trocearPorTopeSeguridad(bloqueBase, memoria.arbol);
    for (const t of troceados) {
      bloques.push({ ...t, id: idBloque });
      idBloque++;
    }
  }

  return bloques;
}

// ── Si un tramo entre dos cambios de material es más largo que
//    el tope de seguridad (documentos sin estructura clara donde
//    el mismo material sigue "activo" por decenas de miles de
//    caracteres), lo corta en pedazos de ese tamaño — Regla 5 del
//    PDF: "como respaldo de seguridad, hay un tope de emergencia
//    para documentos sin estructura reconocible". El tipo de nodo
//    dominante se vuelve a calcular en cada pedazo, porque un
//    tramo largo puede cruzar de una tabla a texto corrido. ──────
function trocearPorTopeSeguridad(bloque: BloqueMaterial, arbol: NodoEstructura[]): BloqueMaterial[] {
  const largo = bloque.fin - bloque.inicio;
  if (largo <= TOPE_SEGURIDAD_CARACTERES) return [bloque];

  const partes: BloqueMaterial[] = [];
  let inicio = bloque.inicio;
  while (inicio < bloque.fin) {
    const fin = Math.min(inicio + TOPE_SEGURIDAD_CARACTERES, bloque.fin);
    const nodoDominante = nodoMasProfundoEnPosicion(arbol, inicio);
    partes.push({
      ...bloque,
      inicio,
      fin,
      tipoNodoDominante: nodoDominante ? nodoDominante.tipo : bloque.tipoNodoDominante,
      motivoCierre: fin < bloque.fin ? 'tope_seguridad' : bloque.motivoCierre,
    });
    inicio = fin;
  }
  return partes;
}

// ── El fix directo del bug: un bloque cuyo nodo dominante es
//    índice, bibliografía o referencias nunca debe convertirse en
//    un registro de dato, sin importar qué palabras contenga. El
//    Validador (próximo lote) usa esta función antes de dejar
//    pasar cualquier registro que arme el Consolidador. ──────────
export function esBloqueDescartable(bloque: BloqueMaterial): boolean {
  return bloque.tipoNodoDominante !== null && TIPOS_NODO_DESCARTABLES.includes(bloque.tipoNodoDominante);
}
