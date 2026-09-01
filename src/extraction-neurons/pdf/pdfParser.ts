// ============================================================
// Parser de PDF para ND/NE.
// ND procesa una página por vez y no conserva el texto de todo el PDF.
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
 * Procesa páginas individualmente.
 * Importante: pdf-parse v2 devuelve correctamente texto con partial=[N].
 * No usamos getInfo() antes de extraer porque el flujo anterior podía dejar
 * el parser en un estado en el que las páginas parciales llegaban vacías.
 */
export async function procesarPaginasIncremental(
  buffer: Buffer,
  callback: (pagina: PaginaTexto, totalPaginas: number) => Promise<void>,
  desdePagina = 1,
  limitePaginas?: number,
): Promise<number> {
  const parser = new PDFParse({ data: buffer });
  try {
    const inicio = Math.max(1, desdePagina);
    const resultadoInicial = await parser.getText({ partial: [inicio] });
    const total = Number(resultadoInicial.total || 0);
    if (!total || inicio > total) return total;

    const fin = limitePaginas == null
      ? total
      : Math.min(total, inicio + Math.max(0, limitePaginas - 1));

    // La primera página ya fue extraída para obtener el total: se procesa
    // directamente y luego se libera su referencia antes de continuar.
    const primera = resultadoInicial.pages.find(p => p.num === inicio) || resultadoInicial.pages[0];
    if (primera) await callback({ pagina: primera.num, texto: primera.text || '' }, total);

    for (let pagina = inicio + 1; pagina <= fin; pagina++) {
      const resultado = await parser.getText({ partial: [pagina] });
      const encontrada = resultado.pages.find(p => p.num === pagina) || resultado.pages[0];
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
