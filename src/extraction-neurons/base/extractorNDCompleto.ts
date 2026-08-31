// ============================================================
// Composicion final del extractor ND.
// Mantiene el extractor universal existente y le suma metadatos
// cientificos transversales. ND sigue sin clasificar para las 100.
// ============================================================

import { extraerNDUniversal } from './extractorNDUniversal';
import { extraerMetadatosCientificosND } from './extractorMetadatosCientificosND';
import { HallazgoND } from '../memoria-nd/tipos';

export function extraerNDCompleto(
  texto: string,
  pagina: number,
  documento: string,
  neuronId: string,
): HallazgoND[] {
  const base = extraerNDUniversal(texto, pagina, documento, neuronId);
  const metadatos = extraerMetadatosCientificosND(texto, pagina, documento, neuronId);
  return deduplicar([...base, ...metadatos]);
}

function deduplicar(hallazgos: HallazgoND[]): HallazgoND[] {
  const vistos = new Set<string>();
  return hallazgos.filter(h => {
    const clave = [
      h.neuronId,
      h.tipo,
      h.campo || '',
      h.evidencia.documento,
      h.evidencia.pagina,
      h.evidencia.posicionInicio ?? '',
      h.textoNormalizado,
    ].join('|');
    if (vistos.has(clave)) return false;
    vistos.add(clave);
    return true;
  });
}
