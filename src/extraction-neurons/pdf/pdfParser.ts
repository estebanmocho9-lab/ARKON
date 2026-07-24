// ============================================================
// src/extraction-neurons/pdf/pdfParser.ts
// Extrae el texto de un PDF, página por página, y detecta
// encabezados de capítulo para mantener contexto.
//
// IMPORTANTE: usa la API real de pdf-parse v2.x (clase PDFParse
// + getText()), no la de la v1 (función callable). Si en algún
// momento actualizás pdf-parse a una versión mayor, revisá si
// esta API volvió a cambiar.
// ============================================================

import { PDFParse } from 'pdf-parse';
import { PaginaTexto } from '../base/tipos';

const PATRON_CAPITULO = /Cap[ií]tulo\s+\d+[^\n]{0,80}|Chapter\s+\d+[^\n]{0,80}|Ap[eé]ndice\s+[A-Z0-9]+[^\n]{0,80}|Appendix\s+[A-Z0-9]+[^\n]{0,80}|Anexo\s+[A-Z0-9]+[^\n]{0,80}/i;

// ── Extrae el texto de cada página del PDF ──────────────────────
export async function extraerPaginas(buffer: Buffer): Promise<PaginaTexto[]> {
  const parser = new PDFParse({ data: buffer });
  try {
    const resultado = await parser.getText();
    return resultado.pages.map(p => ({ pagina: p.num, texto: p.text }));
  } finally {
    // Libera la memoria del documento apenas termina, no la deja
    // colgada hasta que el garbage collector pase por las suyas.
    await parser.destroy();
  }
}

// ── Dado el texto de una página, devuelve el encabezado de
//    capítulo si aparece uno nuevo, o null si no hay ────────────
export function detectarCapitulo(textoPagina: string): string | null {
  const match = PATRON_CAPITULO.exec(textoPagina);
  return match ? match[0].trim() : null;
}
