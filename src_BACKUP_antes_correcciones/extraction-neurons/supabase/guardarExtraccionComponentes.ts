// ============================================================
// src/extraction-neurons/supabase/guardarExtraccionComponentes.ts
// Guarda en una tabla SEPARADA (propiedades_componentes) las
// propiedades que la neurona asoció a un COMPONENTE (ej. "Calcita"
// dentro de "Talco Industrial"). Estas filas ya NO caen en
// propiedades_extraidas — esa tabla queda solo para materiales
// completos. Mismo criterio de guardarExtraccion.ts, repetido acá
// (no se toca ese archivo).
// ============================================================

import { supabase } from '../../supabase/client';
import { PropiedadExtraida } from '../base/tipos';

function sanitizarTexto<T>(valor: T): T {
  if (typeof valor !== 'string') return valor;
  const limpio = valor
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/[\uD800-\uDFFF]/g, '');
  return limpio as unknown as T;
}

// Reacomoda un PropiedadExtraida al formato de propiedades_componentes:
// "material" pasa a llamarse "material_asociado" (más explícito,
// como pediste), "componente" queda igual. El resto de los campos
// son los mismos que ya tenía cada propiedad.
function aFilaComponente(registro: PropiedadExtraida): Record<string, any> {
  const { material, ...resto } = registro;
  const fila: Record<string, any> = { ...resto, material_asociado: material };
  for (const [clave, valor] of Object.entries(fila)) {
    fila[clave] = Array.isArray(valor) ? valor.map(v => sanitizarTexto(v)) : sanitizarTexto(valor);
  }
  return fila;
}

export async function guardarLoteComponentes(registros: PropiedadExtraida[]): Promise<void> {
  if (registros.length === 0) return;

  const TAMANO_LOTE = 50;
  for (let i = 0; i < registros.length; i += TAMANO_LOTE) {
    const lote = registros.slice(i, i + TAMANO_LOTE).map(aFilaComponente);
    const { error } = await supabase.from('propiedades_componentes').insert(lote);
    if (error) {
      console.error(`⚠️  Error guardando lote de componentes en Supabase: ${error.message}`);
    }
  }
}
