// ============================================================
// Composicion final del extractor ND.
// Mantiene el extractor universal, definiciones completas,
// metadatos documentales y captura estructurada exhaustiva.
// ND conserva evidencia; no escribe en Supabase ni en tablas NE.
// ============================================================

import { extraerDefinicionesPropiedadesCompleto } from './extractorDefinicionesCompleto';
import { extraerNDUniversal } from './extractorNDUniversal';
import { extraerMetadatosCientificosND } from './extractorMetadatosCientificosND';
import { extraerDatosCientificosND } from './extractorDatosCientificosND';
import { HallazgoND } from '../memoria-nd/tipos';

export function extraerNDCompleto(
  texto: string,
  pagina: number,
  documento: string,
  neuronId: string,
): HallazgoND[] {
  const base = extraerNDUniversal(texto, pagina, documento, neuronId)
    .filter(h => h.tipo !== 'DEFINICION');

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
  const datos = extraerDatosCientificosND(texto, pagina, documento, neuronId);

  return deduplicar([...base, ...definiciones, ...metadatos, ...datos]);
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
