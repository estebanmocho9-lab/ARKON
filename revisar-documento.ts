// revisar-documento.ts
// Muestra que se guardo realmente en fichas_propiedades proveniente
// de UN documento puntual (para auditar si son datos reales o ruido).
// Uso: npx ts-node revisar-documento.ts "01~Front_Matter.PDF"

import { turso } from './src/turso/tursoClient';

const COLUMNAS_ACUMULABLES = [
  'definicion', 'formula', 'sinonimos_tecnicos', 'sinonimos_informales_industria',
  'tipo_propiedad', 'es_primaria_o_derivada', 'es_intensiva_o_extensiva',
  'es_sensorial_o_instrumental', 'variantes_o_subtipos', 'diferenciacion_con_conceptos_similares',
  'metodos_de_medicion', 'instrumentos_tipicos', 'normas_relacionadas', 'unidades_comunes',
  'errores_comunes_de_medicion', 'dificultad_de_medicion', 'costo_relativo_del_ensayo_de_laboratorio',
  'precision_tipica', 'riesgos_de_seguridad_al_medir', 'factores_ambientales_que_afectan_la_medicion',
  'de_que_depende', 'como_cambia_con_condiciones',
  'compatibilidad_con_otras_propiedades', 'incompatibilidad_con_otras_propiedades',
  'efecto_al_combinarse_con_otras', 'dominancia_en_mezcla', 'umbrales_de_cambio_en_mezcla',
  'ejemplos_de_combinaciones_conocidas', 'sinergias_conocidas', 'efectos_adversos_conocidos',
  'rango_tipico_por_familia_material', 'ejemplos_extremos_conocidos',
  'que_mide', 'para_que_sirve_saberlo', 'donde_se_usa_en_la_practica', 'aplicacion_por_industria',
  'historia_origen_descubrimiento', 'que_no_mide', 'materiales_donde_aparece', 'materiales_donde_no_aplica',
  'variables_de_la_formula', 'tipo_de_relacion_con_otras_propiedades',
  'consecuencias_si_aumenta', 'consecuencias_si_disminuye',
  'ventajas_de_esta_propiedad', 'limitaciones_o_problemas_conocidos', 'controversias_cientificas',
  'recomendaciones_de_uso', 'metodos_alternativos_de_medicion', 'tecnologias_emergentes_relacionadas',
  'por_que_es_importante', 'significado_fisico', 'relacion_con_microestructura',
  'estado_del_material_que_afecta', 'casos_reales_documentados', 'valores_teoricos_vs_experimentales',
  'componentes_donde_aparece', 'propiedad_inversa_o_negativa',
];

async function revisar(documentoBuscado: string) {
  const columnasSelect = COLUMNAS_ACUMULABLES.join(', ');
  const resultado = await turso.execute({
    sql: `SELECT nombre_propiedad, fuentes, ${columnasSelect} FROM fichas_propiedades WHERE fuentes LIKE ?`,
    args: [`%${documentoBuscado}%`],
  });

  let totalEncontrados = 0;

  for (const fila of resultado.rows as any[]) {
    for (const campo of COLUMNAS_ACUMULABLES) {
      const valorCrudo = fila[campo];
      if (!valorCrudo) continue;

      let lista: any[] = [];
      try {
        lista = JSON.parse(valorCrudo);
      } catch {
        continue;
      }

      const deEsteDocumento = lista.filter((r) => r.documento === documentoBuscado);
      for (const r of deEsteDocumento) {
        totalEncontrados++;
        console.log(`\n[${fila.nombre_propiedad}] campo: ${campo} (pagina ${r.pagina})`);
        console.log(`  "${r.respuesta.slice(0, 200)}"`);
      }
    }
  }

  console.log(`\n\nTotal hallazgos de "${documentoBuscado}" en la base: ${totalEncontrados}`);
}

const documento = process.argv[2];
if (!documento) {
  console.error('Uso: npx ts-node revisar-documento.ts "nombre-del-documento.pdf"');
  process.exit(1);
}

revisar(documento);
