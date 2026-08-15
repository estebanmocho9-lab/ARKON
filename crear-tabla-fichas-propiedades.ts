// crear-tabla-fichas-propiedades.ts
// Correr con: npx ts-node crear-tabla-fichas-propiedades.ts

import { turso } from './src/turso/tursoClient';

async function crearTabla() {
  try {
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS fichas_propiedades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        nombre_propiedad TEXT UNIQUE,
        nombre_ingles TEXT,
        simbolo TEXT,
        sinonimos_tecnicos TEXT,
        sinonimos_informales_industria TEXT,
        definicion TEXT,
        formula TEXT,

        tipo_propiedad TEXT,
        es_primaria_o_derivada TEXT,
        es_intensiva_o_extensiva TEXT,
        es_sensorial_o_instrumental TEXT,
        variantes_o_subtipos TEXT,
        diferenciacion_con_conceptos_similares TEXT,

        metodos_de_medicion TEXT,
        instrumentos_tipicos TEXT,
        normas_relacionadas TEXT,
        unidades_comunes TEXT,
        errores_comunes_de_medicion TEXT,
        dificultad_de_medicion TEXT,
        costo_relativo_del_ensayo_de_laboratorio TEXT,
        precision_tipica TEXT,
        riesgos_de_seguridad_al_medir TEXT,
        factores_ambientales_que_afectan_la_medicion TEXT,

        de_que_depende TEXT,
        como_cambia_con_condiciones TEXT,

        compatibilidad_con_otras_propiedades TEXT,
        incompatibilidad_con_otras_propiedades TEXT,

        efecto_al_combinarse_con_otras TEXT,
        dominancia_en_mezcla TEXT,
        umbrales_de_cambio_en_mezcla TEXT,
        ejemplos_de_combinaciones_conocidas TEXT,
        sinergias_conocidas TEXT,
        efectos_adversos_conocidos TEXT,

        rango_tipico_por_familia_material TEXT,
        ejemplos_extremos_conocidos TEXT,

        para_que_sirve_saberlo TEXT,
        donde_se_usa_en_la_practica TEXT,
        aplicacion_por_industria TEXT,

        fuentes TEXT,
        idioma_fuente TEXT,
        estado TEXT DEFAULT 'pendiente'
      )
    `);
    console.log('Tabla fichas_propiedades: OK');
  } catch (error) {
    console.error('ERROR:', error);
  }
}

crearTabla();
