// ============================================================
// src/extraction-neurons/comprension/detectorEstructura.ts
// Etapas 1, 2 y 3 del diseño: lee el documento completo, arma el
// árbol jerárquico (capítulos/secciones/tablas/figuras) y va
// determinando el "material activo" a medida que avanza.
//
// IMPORTANTE - qué es esto realmente y qué no es:
// Esto reconoce ESTRUCTURA FORMAL del documento (títulos
// numerados, palabras clave de capítulo, mayúsculas, etc.) — no
// "entiende" el tema de una sección si no está declarado de forma
// explícita en algún título o mencionado varias veces en el texto.
// Es la versión de esto que SÍ se puede hacer con reglas, sin IA.
// ============================================================

import { EntradaMaterial } from '../base/tipos';
import { NodoEstructura, TipoNodo, CheckpointContexto } from './tipos';

function escaparRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ── Umbral: cuántas menciones de un material dentro de un bloque
//    de texto hacen falta para considerarlo "material activo" por
//    repetición, cuando no está declarado en ningún título ───────
const UMBRAL_MENCION_REPETIDA = 3;

interface EncabezadoDetectado {
  tipo: TipoNodo;
  titulo: string;
  nivel: number;
  posicion: number;
}

// ── Detecta todos los encabezados del texto completo, sea cual
//    sea su forma (numerado, "Capítulo N", mayúsculas, tablas,
//    figuras, bibliografía, etc.) ─────────────────────────────────
function detectarEncabezados(textoCompleto: string): EncabezadoDetectado[] {
  const encontrados: EncabezadoDetectado[] = [];

  // 1. "Capítulo N" / "Chapter N"
  const regexCapitulo = /\b(Cap[ií]tulo|Chapter)\s+(\d+|[IVXLCDM]+)\s*[:.\-]?\s*([^\n.]{0,90})/gi;
  let m: RegExpExecArray | null;
  while ((m = regexCapitulo.exec(textoCompleto)) !== null) {
    encontrados.push({ tipo: 'capitulo', titulo: (m[3] || m[0]).trim(), nivel: 1, posicion: m.index });
  }

  // 2. Encabezados numerados tipo "3.2 Propiedades del Yeso" o "3.2.1
  //    Densidad". El límite YA NO exige un salto de línea real justo
  //    después del título — en texto extraído de PDF (sobre todo
  //    papers y tesis) el título suele quedar pegado al párrafo
  //    siguiente sin salto de línea real, y esa exigencia hacía que
  //    esto nunca matcheara en la mayoría de esos documentos (esto
  //    era la causa real de los bloques gigantes sin material
  //    declarado). Ahora el título termina en la PRIMERA de estas
  //    señales: salto de línea, o un punto seguido de mayúscula
  //    (fin de oración pegada al título), con un tope duro de 90
  //    caracteres igual que antes.
  const regexNumerado = /(?:^|\n)\s*(\d{1,2}(?:\.\d{1,2}){0,3})\.?\s+([A-ZÁÉÍÓÚÑ][^\n.]{2,90})(?=\n|\.\s*[A-ZÁÉÍÓÚÑ]|\.\s*$)/g;
  while ((m = regexNumerado.exec(textoCompleto)) !== null) {
    const profundidad = m[1].split('.').length; // "3" = 1, "3.2" = 2, "3.2.1" = 3
    const tipo: TipoNodo = profundidad === 1 ? 'capitulo' : profundidad === 2 ? 'subcapitulo' : profundidad === 3 ? 'seccion' : 'subseccion';
    encontrados.push({ tipo, titulo: m[2].trim(), nivel: profundidad, posicion: m.index });
  }

  // 3. Tablas y figuras (no jerárquicos, se anidan donde caigan)
  const regexTabla = /\b(Tabla|Table)\s+\d+(?:\.\d+)*/gi;
  while ((m = regexTabla.exec(textoCompleto)) !== null) {
    encontrados.push({ tipo: 'tabla', titulo: m[0], nivel: 99, posicion: m.index });
  }
  const regexFigura = /\b(Figura|Fig\.|Figure)\s+\d+(?:\.\d+)*/gi;
  while ((m = regexFigura.exec(textoCompleto)) !== null) {
    encontrados.push({ tipo: 'figura', titulo: m[0], nivel: 99, posicion: m.index });
  }

  // 4. Bibliografía / Referencias / Índice / Anexos
  const regexEspeciales = /\b(Referencias|Bibliograf[ií]a|References|Bibliography|[IÍ]ndice|Index|Anexo|Ap[eé]ndice|Annex|Appendix)\b\s*[:.]?\s*([A-Z0-9]{0,3})/g;
  while ((m = regexEspeciales.exec(textoCompleto)) !== null) {
    const palabra = m[1].toLowerCase();
    let tipo: TipoNodo = 'nota';
    if (palabra.startsWith('referenc')) tipo = 'referencias';
    else if (palabra.startsWith('bibliograf') || palabra.startsWith('bibliography')) tipo = 'bibliografia';
    else if (palabra.startsWith('índice') || palabra.startsWith('indice') || palabra.startsWith('index')) tipo = 'indice';
    else if (palabra.startsWith('anexo') || palabra.startsWith('annex')) tipo = 'anexo';
    else if (palabra.startsWith('apéndice') || palabra.startsWith('apendice') || palabra.startsWith('appendix')) tipo = 'apendice';
    encontrados.push({ tipo, titulo: m[0].trim(), nivel: 1, posicion: m.index });
  }

  encontrados.sort((a, b) => a.posicion - b.posicion);
  return encontrados;
}

// ── ¿El título de un encabezado nombra alguno de tus materiales? ─
function detectarMaterialEnTitulo(
  titulo: string,
  materiales: EntradaMaterial[]
): { material: string; familia: string; subfamilia: string | null } | null {
  for (const entrada of materiales) {
    const terminos = [entrada.nombre_es, entrada.nombre_en, ...entrada.sinonimos];
    for (const termino of terminos) {
      if (!termino || termino.length < 3) continue;
      const regex = new RegExp(`\\b${escaparRegex(termino)}\\b`, 'i');
      if (regex.test(titulo)) {
        return { material: entrada.nombre_es, familia: entrada.familia, subfamilia: entrada.subfamilia || null };
      }
    }
  }
  return null;
}

// ── Cuenta menciones de cada material dentro de un tramo de texto
//    (para el criterio de "material activo por repetición") ──────
function materialDominanteEnTramo(
  texto: string,
  materiales: EntradaMaterial[]
): { material: string; familia: string; subfamilia: string | null } | null {
  let mejor: { material: string; familia: string; subfamilia: string | null; conteo: number } | null = null;

  for (const entrada of materiales) {
    const terminos = [entrada.nombre_es, entrada.nombre_en, ...entrada.sinonimos].filter(
      (t): t is string => !!t && t.length >= 3
    );
    let total = 0;
    for (const termino of terminos) {
      const regex = new RegExp(`\\b${escaparRegex(termino)}\\b`, 'gi');
      const matches = texto.match(regex);
      total += matches ? matches.length : 0;
    }
    if (total >= UMBRAL_MENCION_REPETIDA && (!mejor || total > mejor.conteo)) {
      mejor = { material: entrada.nombre_es, familia: entrada.familia, subfamilia: entrada.subfamilia || null, conteo: total };
    }
  }

  return mejor ? { material: mejor.material, familia: mejor.familia, subfamilia: mejor.subfamilia } : null;
}

// ── Arma el árbol jerárquico anidando por nivel (Etapa 2) ────────
export function construirArbol(encabezados: EncabezadoDetectado[], longitudTexto: number): NodoEstructura[] {
  const raiz: NodoEstructura[] = [];
  // Pila de nodos jerárquicos abiertos (no incluye tablas/figuras,
  // que no forman jerarquía, solo se anidan donde caen)
  const pila: NodoEstructura[] = [];

  for (const enc of encabezados) {
    if (enc.tipo === 'tabla' || enc.tipo === 'figura') {
      const nodo: NodoEstructura = { tipo: enc.tipo, titulo: enc.titulo, nivel: enc.nivel, posicionInicio: enc.posicion, posicionFin: enc.posicion, hijos: [] };
      const padre = pila[pila.length - 1];
      if (padre) padre.hijos.push(nodo); else raiz.push(nodo);
      continue;
    }

    // Cerrar todos los nodos de nivel igual o mayor al nuevo (nueva
    // sección del mismo nivel o superior termina la anterior)
    while (pila.length > 0 && pila[pila.length - 1].nivel >= enc.nivel) {
      pila[pila.length - 1].posicionFin = enc.posicion;
      pila.pop();
    }

    const nodo: NodoEstructura = { tipo: enc.tipo, titulo: enc.titulo, nivel: enc.nivel, posicionInicio: enc.posicion, posicionFin: longitudTexto, hijos: [] };
    const padre = pila[pila.length - 1];
    if (padre) padre.hijos.push(nodo); else raiz.push(nodo);
    pila.push(nodo);
  }

  // Cerrar lo que quedó abierto al final del documento
  for (const abierto of pila) abierto.posicionFin = longitudTexto;

  return raiz;
}

// ── Recorre el árbol y arma la línea de tiempo de contexto
//    (Etapas 3 y 5), heredando el material activo de padre a hijo
//    cuando el hijo no declara uno propio ────────────────────────
export function construirLineaDeTiempo(
  arbol: NodoEstructura[],
  textoCompleto: string,
  materiales: EntradaMaterial[]
): CheckpointContexto[] {
  const linea: CheckpointContexto[] = [];

  function recorrer(
    nodos: NodoEstructura[],
    heredado: { materialActivo: string | null; familiaActiva: string | null; subfamiliaActiva: string | null; origen: CheckpointContexto['origenMaterialActivo'] },
    capituloActivo: string | null,
    seccionActiva: string | null
  ) {
    for (const nodo of nodos) {
      if (nodo.tipo === 'tabla' || nodo.tipo === 'figura') {
        linea.push({
          posicion: nodo.posicionInicio,
          materialActivo: heredado.materialActivo,
          familiaActiva: heredado.familiaActiva,
          subfamiliaActiva: heredado.subfamiliaActiva,
          capituloActivo,
          seccionActiva,
          propiedadActiva: null,
          unidadActiva: null,
          enTabla: nodo.tipo === 'tabla',
          enFigura: nodo.tipo === 'figura',
          tipoNodoActivo: nodo.tipo,
          origenMaterialActivo: heredado.origen,
        });
        continue;
      }

      // ¿Este nodo declara un material propio en su título?
      const materialEnTitulo = detectarMaterialEnTitulo(nodo.titulo, materiales);
      let estadoNodo = heredado;

      if (materialEnTitulo) {
        estadoNodo = { materialActivo: materialEnTitulo.material, familiaActiva: materialEnTitulo.familia, subfamiliaActiva: materialEnTitulo.subfamilia, origen: 'titulo_seccion' };
      } else {
        // No hay material en el título: buscamos si un material
        // domina claramente el texto propio de este bloque (sin
        // contar el texto de los hijos, para no duplicar conteo)
        const inicioPropio = nodo.posicionInicio;
        const finPropio = nodo.hijos.length > 0 ? nodo.hijos[0].posicionInicio : nodo.posicionFin;
        const textoPropio = textoCompleto.substring(inicioPropio, finPropio);
        const dominante = materialDominanteEnTramo(textoPropio, materiales);
        if (dominante) {
          estadoNodo = { materialActivo: dominante.material, familiaActiva: dominante.familia, subfamiliaActiva: dominante.subfamilia, origen: 'mencion_repetida' };
        }
        // Si tampoco hay dominante, se mantiene lo heredado del padre
        // (con el mismo "origen" que ya traía, sea el que sea)
      }

      const nuevoCapitulo = nodo.tipo === 'capitulo' ? nodo.titulo : capituloActivo;
      const nuevaSeccion = (nodo.tipo === 'seccion' || nodo.tipo === 'subseccion') ? nodo.titulo : seccionActiva;

      linea.push({
        posicion: nodo.posicionInicio,
        materialActivo: estadoNodo.materialActivo,
        familiaActiva: estadoNodo.familiaActiva,
        subfamiliaActiva: estadoNodo.subfamiliaActiva,
        capituloActivo: nuevoCapitulo,
        seccionActiva: nuevaSeccion,
        propiedadActiva: null,
        unidadActiva: null,
        enTabla: false,
        enFigura: false,
        tipoNodoActivo: nodo.tipo,
        origenMaterialActivo: estadoNodo.origen,
      });

      recorrer(nodo.hijos, estadoNodo, nuevoCapitulo, nuevaSeccion);
    }
  }

  recorrer(arbol, { materialActivo: null, familiaActiva: null, subfamiliaActiva: null, origen: 'sin_determinar' }, null, null);

  linea.sort((a, b) => a.posicion - b.posicion);
  return linea;
}

export { detectarEncabezados };