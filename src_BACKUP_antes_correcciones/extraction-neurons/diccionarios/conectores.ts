// ============================================================
// src/extraction-neurons/diccionarios/conectores.ts
// Noveno grupo de la taxonomia: conectores logicos/causales.
// Sirve para que el extractor de reglas detecte frases del tipo
// "aumenta", "reduce", "provoca", "cuando... entonces", etc.
// dentro del texto de los libros, con el mismo enfoque de
// regex + diccionario que ya usan las otras 8 categorias.
// ============================================================

export interface EntradaConector {
  id: string;                  // clave interna, ej. 'con_aumenta'
  nombre_es: string;
  sinonimos: string[];         // variantes que aparecen en el texto real
  tipo: 'causal_positivo' | 'causal_negativo' | 'causal_directo' | 'condicional';
}

export const CONECTORES: EntradaConector[] = [
  // -- Causales positivos: A sube -> B sube --
  { id: 'con_aumenta', nombre_es: 'aumenta',
    sinonimos: ['incrementa', 'sube', 'crece', 'eleva', 'se incrementa', 'se eleva'],
    tipo: 'causal_positivo' },

  { id: 'con_mejora', nombre_es: 'mejora',
    sinonimos: ['optimiza', 'favorece', 'potencia', 'fortalece'],
    tipo: 'causal_positivo' },

  // -- Causales negativos: A sube -> B baja --
  { id: 'con_disminuye', nombre_es: 'disminuye',
    sinonimos: ['reduce', 'baja', 'decrece', 'se reduce', 'atenua', 'mengua'],
    tipo: 'causal_negativo' },

  { id: 'con_degrada', nombre_es: 'degrada',
    sinonimos: ['deteriora', 'debilita', 'compromete', 'perjudica', 'empeora'],
    tipo: 'causal_negativo' },

  // -- Causales directos: A causa B (sin indicar direccion de aumento/baja) --
  { id: 'con_provoca', nombre_es: 'provoca',
    sinonimos: ['genera', 'produce', 'causa', 'origina', 'da lugar a', 'ocasiona'],
    tipo: 'causal_directo' },

  { id: 'con_permite', nombre_es: 'permite',
    sinonimos: ['posibilita', 'habilita', 'facilita'],
    tipo: 'causal_directo' },

  { id: 'con_impide', nombre_es: 'impide',
    sinonimos: ['evita', 'previene', 'bloquea', 'inhibe'],
    tipo: 'causal_directo' },

  { id: 'con_esta_relacionado', nombre_es: 'esta relacionado con',
    sinonimos: ['se relaciona con', 'depende de', 'esta vinculado a', 'esta asociado a'],
    tipo: 'causal_directo' },

  // -- Condicionales: disparan la busqueda de una condicion asociada --
  { id: 'con_cuando', nombre_es: 'cuando',
    sinonimos: ['si', 'en caso de que', 'siempre que'],
    tipo: 'condicional' },

  { id: 'con_entonces', nombre_es: 'entonces',
    sinonimos: ['por lo tanto', 'en consecuencia', 'como resultado', 'lo que provoca que'],
    tipo: 'condicional' },

  { id: 'con_a_mayor', nombre_es: 'a mayor',
    sinonimos: ['a mas', 'cuanto mayor', 'cuanto mas'],
    tipo: 'condicional' },

  { id: 'con_a_menor', nombre_es: 'a menor',
    sinonimos: ['a menos', 'cuanto menor', 'cuanto menos'],
    tipo: 'condicional' },

  // -- Umbral: marca que sigue un porcentaje/valor limite --
  { id: 'con_hasta_un', nombre_es: 'hasta un',
    sinonimos: ['hasta el', 'como maximo', 'como limite'],
    tipo: 'condicional' },

  { id: 'con_por_encima_de', nombre_es: 'por encima de',
    sinonimos: ['por arriba de', 'superando', 'excediendo', 'a partir de'],
    tipo: 'condicional' },

  { id: 'con_por_debajo_de', nombre_es: 'por debajo de',
    sinonimos: ['bajo', 'inferior a', 'menor a'],
    tipo: 'condicional' },
];
