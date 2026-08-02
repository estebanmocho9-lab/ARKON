// ============================================================
// src/extraction-neurons/supabase/guardarDatosSinClasificar.ts
// Guarda en Supabase (tabla datos_sin_clasificar) todo lo que el
// motor detecta con forma de dato (número+unidad, o "etiqueta:
// valor") pero que NO matcheó ninguna propiedad del catálogo. Es
// la red de seguridad para revisar después y, si corresponde,
// sumar propiedades nuevas al catálogo. No reemplaza el log local
// (candidatos_NE-XX.jsonl) que ya existía — se suma a él.
// ============================================================

import { supabase } from '../../supabase/client';

export interface DatoSinClasificar {
  pagina: number;
  fragmento: string;
  numero: string;
  unidadDetectada: string;
}

export async function guardarDatosSinClasificarLote(
  neuronaId: string,
  documento: string,
  datos: DatoSinClasificar[]
): Promise<void> {
  if (datos.length === 0) return;

  const TAMANO_LOTE = 50;
  for (let i = 0; i < datos.length; i += TAMANO_LOTE) {
    const lote = datos.slice(i, i + TAMANO_LOTE).map((d) => ({
      neurona_id: neuronaId,
      documento,
      pagina: d.pagina,
      fragmento: d.fragmento,
      numero: d.numero || null,
      unidad_o_etiqueta: d.unidadDetectada,
      revisado: false,
    }));
    const { error } = await supabase.from('datos_sin_clasificar').insert(lote);
    if (error) {
      console.error(`⚠️  Error guardando datos sin clasificar: ${error.message}`);
    }
  }
}
