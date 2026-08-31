// ============================================================
// Composicion final del extractor ND.
// Mantiene el extractor universal existente, reemplaza la capa
// de definiciones por la version completa y suma metadatos.
// ND sigue sin clasificar para las 100.
// ============================================================

import { extraerDefinicionesPropiedadesCompleto } from './extractorDefinicionesCompleto';
import { extraerNDUniversal } from './extractorNDUniversal';
import { extraerMetadatosCientificosND } from './extractorMetadatosCientificosND';
import { HallazgoND } from '../memoria-nd/tipos';

export function extraerNDCompleto(
  texto: string,
  pagina: number,
  documento: string,
  neuronId: string,
): HallazgoND[] {
  const base = extraerNDUniversal(texto, pagina, documento, neuronId)
    .filter(h => h.campo !== undefined || h.tipo !== 'DEFINICION');

  // La capa completa vuelve a emitir definiciones con los campos
  // historicos + complementarios. Eliminamos la emision anterior
  // para no duplicar cada definicion.
  const definiciones = extraerDefinicionesPropiedadesCompleto(texto).map(h => {
    const ctx = h.contenido.trim();
    const lang = h.idioma;
    return {
      neuronId,
      tipo: 'DEFINICION' as const,
      campo: h.campo,
      textoOriginal: ctx,
      textoNormalizado: ctx.toLowerCase(),
      entidadCandidata: h.nombre_propiedad,
      contexto: ctx,
      idioma: lang,
      confianza: 0.65,
      evidencia: {
        documento,
        pagina,
        fragmento: ctx,
        idioma: lang,
        tipoDocumento: 'desconocido' as const,
      },
      metadatos: { extractor: 'extractorDefinicionesCompleto', propiedadCandidata: h.nombre_propiedad },
    } satisfies HallazgoND;
  });

  const metadatos = extraerMetadatosCientificosND(texto, pagina, documento, neuronId);
  return deduplicar([...base, ...definiciones, ...metadatos]);
}

function deduplicar(hallazgos: HallazgoND[]): HallazgoND[] {
  const vistos = new Set<string>();
  return hallazgos.filter(h => {
    const clave = [h.neuronId, h.tipo, h.campo || '', h.evidencia.documento,
      h.evidencia.pagina, h.evidencia.posicionInicio ?? '', h.textoNormalizado].join('|');
    if (vistos.has(clave)) return false;
    vistos.add(clave);
    return true;
  });
}
