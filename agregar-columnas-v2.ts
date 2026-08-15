// agregar-columnas-v2.ts
// Agrega las 20 columnas nuevas a fichas_propiedades, sin borrar
// ni tocar los datos que ya estan cargados.
// Correr con: npx ts-node agregar-columnas-v2.ts

import { turso } from './src/turso/tursoClient';

const COLUMNAS_NUEVAS = [
  'historia_origen_descubrimiento',
  'que_no_mide',
  'materiales_donde_aparece',
  'materiales_donde_no_aplica',
  'variables_de_la_formula',
  'tipo_de_relacion_con_otras_propiedades',
  'consecuencias_si_aumenta',
  'consecuencias_si_disminuye',
  'ventajas_de_esta_propiedad',
  'limitaciones_o_problemas_conocidos',
  'controversias_cientificas',
  'recomendaciones_de_uso',
  'metodos_alternativos_de_medicion',
  'tecnologias_emergentes_relacionadas',
  'por_que_es_importante',
  'significado_fisico',
  'relacion_con_microestructura',
  'estado_del_material_que_afecta',
  'casos_reales_documentados',
  'valores_teoricos_vs_experimentales',
];

async function agregarColumnas() {
  for (const columna of COLUMNAS_NUEVAS) {
    try {
      await turso.execute(`ALTER TABLE fichas_propiedades ADD COLUMN ${columna} TEXT`);
      console.log(`Columna agregada: ${columna}`);
    } catch (error: any) {
      if (error.message && error.message.includes('duplicate column')) {
        console.log(`Columna ya existia, se omite: ${columna}`);
      } else {
        console.error(`Error agregando ${columna}:`, error.message);
      }
    }
  }
  console.log('\nListo. 20 columnas nuevas agregadas (o ya existentes).');
}

agregarColumnas();
