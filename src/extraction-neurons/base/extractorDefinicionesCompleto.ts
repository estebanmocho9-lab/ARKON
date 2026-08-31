// ============================================================
// Compositor de definiciones: conserva los 38 campos existentes
// y agrega la cobertura complementaria del modelo cientifico ND.
// ============================================================

import { extraerDefinicionesPropiedades, HallazgoDefinicion } from './extractorDefiniciones';
import { PROPIEDADES } from '../diccionarios/propiedades';
import { PATRONES_DEFINICION_COMPLETA_ND } from '../diccionarios/patronesDefinicionCompletaND';

function idioma(texto: string): 'es' | 'en' {
  const t = texto.toLowerCase();
  const es = (t.match(/\b(?:el|la|los|las|de|del|que|una|un|para|con|se|como|mide|medición|propiedad|material)\b/g) || []).length;
  const en = (t.match(/\b(?:the|of|and|is|are|a|an|for|with|by|as|measure|measurement|property|material)\b/g) || []).length;
  return en > es ? 'en' : 'es';
}

function escapar(texto: string): string { return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

/** Mantiene el extractor historico y suma campos complementarios por propiedad. */
export function extraerDefinicionesPropiedadesCompleto(texto: string): HallazgoDefinicion[] {
  const salida = extraerDefinicionesPropiedades(texto);
  const normalizado = texto.replace(/\s+/g, ' ');

  for (const propiedad of PROPIEDADES) {
    const terminos = [...new Set([
      propiedad.nombre_es,
      propiedad.nombre_en,
      ...(propiedad.sinonimos || []),
    ].filter((t): t is string => !!t && t.trim().length >= 4).map(t => t.trim()))];

    for (const termino of terminos) {
      const reTermino = new RegExp(`(?<![\\p{L}\\p{N}])${escapar(termino)}(?![\\p{L}\\p{N}])`, 'giu');
      let menciones = 0;
      let m: RegExpExecArray | null;
      while ((m = reTermino.exec(normalizado)) && menciones < 30) {
        menciones++;
        const inicio = Math.max(0, m.index - 800);
        const fin = Math.min(normalizado.length, m.index + termino.length + 2000);
        const ventana = normalizado.slice(inicio, fin);

        for (const patron of PATRONES_DEFINICION_COMPLETA_ND) {
          const flags = patron.regex.flags.replace('g', '');
          const rePatron = new RegExp(patron.regex.source, flags);
          const pm = rePatron.exec(ventana);
          if (!pm) continue;

          const contenido = pm[0].trim();
          salida.push({
            nombre_propiedad: propiedad.id,
            campo: patron.campo,
            contenido: contenido.slice(0, 1200),
            idioma: idioma(contenido),
          });
        }
      }
    }
  }

  return salida;
}
