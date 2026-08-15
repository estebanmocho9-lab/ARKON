// ============================================================
// src/extraction-neurons/comprension/construirMemoria.ts
// Punto de entrada de la Neurona de Comprensión Documental.
// Recibe el texto completo de un documento (todas las páginas ya
// concatenadas y normalizadas) y devuelve la Memoria Temporal
// completa: árbol de estructura + línea de tiempo de contexto +
// idioma + materiales relevantes + nivel de confianza general.
//
// Esta función NO guarda nada, NO toca Turso ni Supabase — solo
// devuelve un objeto en RAM que se descarta cuando termina el
// procesamiento del documento, tal como pide el diseño original.
// ============================================================

import { EntradaMaterial } from '../base/tipos';
import { MemoriaTemporalDocumento } from './tipos';
import { detectarEncabezados, construirArbol, construirLineaDeTiempo } from './detectorEstructura';

function escaparRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ── Detección simple de idioma por conteo de palabras funcionales
//    (no hace falta más precisión que esta para decidir "es" / "en" /
//    "mixto" — no es traducción, es solo una pista de contexto) ──
const PALABRAS_ES = ['el', 'la', 'los', 'las', 'de', 'que', 'en', 'un', 'una', 'es', 'para', 'con', 'por', 'se'];
const PALABRAS_EN = ['the', 'of', 'and', 'to', 'in', 'is', 'for', 'with', 'that', 'this', 'are', 'was'];

function detectarIdioma(texto: string): 'es' | 'en' | 'mixto' | 'desconocido' {
  const muestra = texto.substring(0, 20000).toLowerCase();
  let conteoEs = 0;
  let conteoEn = 0;
  for (const palabra of PALABRAS_ES) {
    const regex = new RegExp(`\\b${escaparRegex(palabra)}\\b`, 'g');
    conteoEs += (muestra.match(regex) || []).length;
  }
  for (const palabra of PALABRAS_EN) {
    const regex = new RegExp(`\\b${escaparRegex(palabra)}\\b`, 'g');
    conteoEn += (muestra.match(regex) || []).length;
  }
  if (conteoEs === 0 && conteoEn === 0) return 'desconocido';
  const total = conteoEs + conteoEn;
  if (conteoEs / total > 0.7) return 'es';
  if (conteoEn / total > 0.7) return 'en';
  return 'mixto';
}

// ── Cuenta menciones totales de cada material en TODO el
//    documento, para decidir cuáles son "materiales relevantes"
//    (mismo criterio que el Paso 5, reutilizado acá) ─────────────
const UMBRAL_RELEVANCIA = 3;

function calcularMaterialesRelevantes(
  textoCompleto: string,
  materiales: EntradaMaterial[],
  materialesEnTitulos: Set<string>
): { relevantes: string[]; conteos: Map<string, number> } {
  const conteos = new Map<string, number>();

  for (const entrada of materiales) {
    const terminos = [entrada.nombre_es, entrada.nombre_en, ...entrada.sinonimos].filter(
      (t): t is string => !!t && t.length >= 3
    );
    let total = 0;
    for (const termino of terminos) {
      const regex = new RegExp(`\\b${escaparRegex(termino)}\\b`, 'gi');
      total += (textoCompleto.match(regex) || []).length;
    }
    conteos.set(entrada.nombre_es, total);
  }

  const relevantes = materiales
    .map(m => m.nombre_es)
    .filter(nombre => (conteos.get(nombre) || 0) >= UMBRAL_RELEVANCIA || materialesEnTitulos.has(nombre));

  return { relevantes, conteos };
}

export function construirMemoriaTemporal(
  textoCompleto: string,
  materiales: EntradaMaterial[],
  documento: string,
  driveFileId: string
): MemoriaTemporalDocumento {
  const encabezados = detectarEncabezados(textoCompleto);
  const arbol = construirArbol(encabezados, textoCompleto.length);
  const lineaDeTiempo = construirLineaDeTiempo(arbol, textoCompleto, materiales);

  const materialesEnTitulos = new Set(
    lineaDeTiempo.filter(cp => cp.origenMaterialActivo === 'titulo_seccion' && cp.materialActivo).map(cp => cp.materialActivo as string)
  );

  const { relevantes, conteos } = calcularMaterialesRelevantes(textoCompleto, materiales, materialesEnTitulos);

  // Tema principal: el material más mencionado en todo el documento,
  // si alguno superó el umbral de relevancia; si no, null.
  let temaPrincipal: string | null = null;
  let maxConteo = 0;
  for (const nombre of relevantes) {
    const c = conteos.get(nombre) || 0;
    if (c > maxConteo) { maxConteo = c; temaPrincipal = nombre; }
  }

  const idioma = detectarIdioma(textoCompleto);

  // Confianza general de la comprensión lograda: depende de
  // cuánta estructura jerárquica real se pudo reconocer.
  const nodosJerarquicos = encabezados.filter(e => e.tipo !== 'tabla' && e.tipo !== 'figura').length;
  const nivelConfianzaComprension: MemoriaTemporalDocumento['nivelConfianzaComprension'] =
    nodosJerarquicos >= 3 ? 'Alto' : nodosJerarquicos >= 1 ? 'Medio' : 'Bajo';

  return {
    documento,
    driveFileId,
    idioma,
    temaPrincipal,
    autor: null,      // no implementado en esta versión — se puede sumar buscando patrones de portada
    norma: null,       // idem; ya existe buscarNorma() en motorExtraccion, se puede reutilizar más adelante
    anio: null,
    tipoDocumento: null,
    arbol,
    lineaDeTiempo,
    materialesRelevantes: relevantes,
    nivelConfianzaComprension,
  };
}
