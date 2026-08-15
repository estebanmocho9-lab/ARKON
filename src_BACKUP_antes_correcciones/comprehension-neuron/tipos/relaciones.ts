// ============================================================
// src/comprehension-neuron/tipos/relaciones.ts
// REL — "esto es lo que yo considero el corazón del sistema",
// tal como lo describiste. No guarda "Vermiculita = 120 kg/m³"
// como un hecho plano — guarda la afirmación completa, con quién
// la respalda (Evidencia) y qué tan validada está.
// ============================================================

import { Id } from './ids';

export type TipoRelacion = 'TIENE_PROPIEDAD' | 'TIENE_COMPONENTE' | 'CUMPLE_NORMA' | 'MEDIDO_CON';

export interface Relacion {
  id: Id<'REL'>;
  sujeto: Id<'MAT'>;
  relacion: TipoRelacion;
  propiedad: Id<'PRO'> | null; // para TIENE_PROPIEDAD
  valor: Id<'VAL'> | null;
  unidad: Id<'UNI'> | null;
  componente: Id<'COM'> | null; // para TIENE_COMPONENTE
  norma: Id<'NOR'> | null; // para CUMPLE_NORMA
  metodo: Id<'MET'> | null;
  instrumento: Id<'INS'> | null;
  condicion: Id<'CND'> | null;

  evidencia: Id<'EVI'>;
}
