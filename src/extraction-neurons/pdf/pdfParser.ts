// ============================================================
// src/extraction-neurons/pdf/pdfParser.ts
// Parser de PDF para ND/NE.
//
// Además de la función histórica extraerPaginas(), ofrece
// procesarPaginasIncremental(): obtiene una sola página, la
// entrega al callback y recién después continúa con la siguiente.
// Esto evita mantener todas las páginas del PDF en RAM.
// ============================================================

import { PDFParse } from 'pdf-parse';
import { PaginaTexto } from '../base/tipos';

const PATRON_CAPITULO = /Cap[ií]tulo\s+\d+[^\n]{0,80}|Chapter\s+\d+[^\n]{0,80}|Ap[eé]ndice\s+[A-Z0-9]+[^\n]{0,80}|Appendix\s+[A-Z0-9]+[^\n]{0,80}|Anexo\s+[A-Z0-9]+[^\n]{0,80}/i;

export async function extraerPaginas(buffer: Buffer): Promise<PaginaTexto[]> {
  const parser = new PDFParse({ data: buffer });
  try {
    const resultado = await parser.getText();
    return resultado.pages.map(p => ({ pagina: p.num, texto: p.text }));
  } finally {
    await parser.destroy();
  }
}

/**
 * Recorre un PDF página por página.
 * pdf-parse v2 permite solicitar páginas concretas con `partial`;
 * reutilizamos el mismo parser y descartamos el resultado de cada
 * página antes de pedir la siguiente.
 */
export async function procesarPaginasIncremental(
  buffer: Buffer,
  callback: (pagina: PaginaTexto, totalPaginas: number) => Promise<void>,
  desdePagina = 1,
): Promise<number> {
  const parser = new PDFParse({ data: buffer });
  try {
    const info = await parser.getInfo();
    const total = Number(info.total || 0);
    if (!total) return 0;

    for (let pagina = Math.max(1, desdePagina); pagina <= total; pagina++) {
      const resultado = await parser.getText({ partial: [pagina] });
      const encontrada = resultado.pages[0];
      if (!encontrada) continue;
      await callback({ pagina: encontrada.num, texto: encontrada.text || '' }, total);
    }
    return total;
  } finally {
    await parser.destroy();
  }
}

export function detectarCapitulo(textoPagina: string): string | null {
  const match = PATRON_CAPITULO.exec(textoPagina);
  return match ? match[0].trim() : null;
}
