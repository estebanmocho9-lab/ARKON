// ============================================
// IMPULSO IA — DEFINICIÓN DE TABLAS SUPABASE
// ============================================

// --------------------------------------------
// NOMBRES DE TABLAS
// --------------------------------------------

export const TABLAS = {
  NEURONAS:     'neuronas',
  MEMORIAS:     'memorias',
  EXPERIENCIAS: 'experiencias',
  INFERENCIAS:  'inferencias',
  RESULTADOS:   'resultados',
} as const;

// --------------------------------------------
// ESQUEMA DE COLUMNAS POR TABLA
// --------------------------------------------

export const COLUMNAS_NEURONAS = {
  ID:                   'id',
  NOMBRE:               'nombre',
  TIPO:                 'tipo',
  GRUPO_FISICO:         'grupo_fisico',
  ESTADO:               'estado',
  VALOR_ACTIVACION:     'valor_activacion',
  COHERENCIA:           'coherencia',
  CONFIANZA:            'confianza',
  RELACIONES:           'relaciones',
  COMPATIBILIDADES:     'compatibilidades',
  CONTRADICCIONES:      'contradicciones',
  CONEXIONES:           'conexiones_neuronales',
  HISTORIAL:            'historial',
  CREADO_EN:            'creado_en',
  ACTUALIZADO_EN:       'actualizado_en',
} as const;

export const COLUMNAS_MEMORIAS = {
  ID:                   'id',
  NEURONA_ID:           'neurona_id',
  PRODUCTO:             'producto',
  PROPIEDAD:            'propiedad',
  CONTEXTO:             'contexto',
  ACTIVACIONES:         'activaciones',
  COHERENCIA:           'coherencia',
  RELACIONES:           'relaciones_detectadas',
  SOLUCIONES:           'soluciones_aplicadas',
  RESULTADOS:           'resultados_obtenidos',
  MEJORAS:              'mejoras_logradas',
  CONTRADICCIONES:      'contradicciones',
  PATRONES:             'patrones_repetidos',
  FECHA:                'fecha',
} as const;

export const COLUMNAS_EXPERIENCIAS = {
  ID:                   'id',
  NEURONA_ID:           'neurona_id',
  DESCRIPCION:          'descripcion',
  PROPIEDAD:            'propiedad',
  MATERIAL:             'material',
  RESULTADO:            'resultado',
  CONFIRMACIONES:       'confirmaciones',
  FECHA:                'fecha',
} as const;

export const COLUMNAS_INFERENCIAS = {
  ID:                   'id',
  NEURONA_ID:           'neurona_id',
  DESCRIPCION:          'descripcion',
  CONFIANZA:            'confianza',
  PROPIEDADES:          'propiedades_involucradas',
  CONSECUENCIAS:        'consecuencias',
  OPORTUNIDADES:        'oportunidades',
  FECHA:                'fecha',
} as const;

export const COLUMNAS_RESULTADOS = {
  ID:                   'id',
  PRODUCTO:             'producto',
  PROBLEMA:             'problema_detectado',
  CAUSAS:               'causas_fisicas',
  SOLUCIONES:           'soluciones_propuestas',
  COMPATIBILIDADES:     'compatibilidades',
  MEJORAS:              'mejoras',
  CONFIANZA:            'confianza_general',
  FECHA:                'fecha',
} as const;

// --------------------------------------------
// ESTADOS VÁLIDOS
// --------------------------------------------

export const ESTADOS_VALIDOS = [
  'Base',
  'Procesado',
  'Integrado',
  'Operacion',
  'Degradado',
] as const;

// --------------------------------------------
// GRUPOS FÍSICOS VÁLIDOS
// --------------------------------------------

export const GRUPOS_FISICOS_VALIDOS = [
  'mecanico',
  'termico',
  'hidrico',
  'quimico',
  'superficial',
  'estructural',
  'acustico',
  'electrico',
] as const;