// ============================================================
// src/sheets/syncData.ts
// CORRECCIÓN: apunta a tabla materiales_vectores (no materiales)
// y usa nombres de columna exactos de esa tabla
// ============================================================

import { supabase } from '../supabase/client';
import { readVectorsFromSheet } from './readVectors';

// Mapeo: nombre que viene de Google Sheets → columna exacta en materiales_vectores
// Necesario porque Sheets puede tener nombres con tildes o variantes
const MAPEO_COLUMNAS: Record<string, string> = {
  'densidad_real':              'densidad_real',
  'densidad_aparente':          'densidad_aparente',
  'porosidad_total':            'porosidad_total',
  'absorcion_agua':             'absorcion_agua',
  'absorcion_de_agua':          'absorcion_agua',   // alias si viene así de Sheets
  'absorcin_de_agua':           'absorcion_agua',   // alias con tilde cortada
  'indice_vacios':              'indice_vacios_e',
  'indice_vacios_e':            'indice_vacios_e',
  'tamano_particula':           'tamaño_particula',
  'tamaño_particula':           'tamaño_particula',
  'area_bet':                   'area_bet',
  'volumen_poro':               'volumen_poro',
  'diametro_poro':              'diametro_poro',
  'tortuosidad':                'tortuosidad',
  'resistencia_compresion':     'resistencia_compresion',
  'resistencia_traccion':       'resistencia_traccion',
  'resistencia_flexion':        'resistencia_flexion',
  'modulo_young':               'modulo_young',
  'modulo_corte':               'modulo_corte',
  'modulo_volumetrico':         'modulo_volumetrico',
  'cohesion':                   'cohesion',
  'dureza_mohs':                'dureza_mohs',
  'angulo_friccion':            'angulo_friccion',
  'poisson':                    'poisson',
  'conductividad_termica':      'conductividad_termica',
  'calor_especifico':           'calor_especifico',
  'expansion_termica':          'expansion_termica',
  'temperatura_servicio':       'temperatura_servicio',
  'temperatura_fusion':         'temperatura_fusion',
  'difusividad_termica':        'difusividad_termica',
  'permeabilidad_intrinseca':   'permeabilidad_intrinseca',
  'conductividad_hidraulica':   'conductividad_hidraulica',
  'difusion_agua':              'difusion_agua',
  'difusion_gases':             'difusion_gases',
  'difusion_ionica':            'difusion_ionica',
  'ph':                         'ph',
  'cec':                        'cec',
  'adsorcion':                  'adsorcion',
  'conductividad_electrica':    'conductividad_electrica',
  'potencial_zeta':             'potencial_zeta',
  'sio2':                       'sio2',
  'al2o3':                      'al2o3',
  'fe2o3':                      'fe2o3',
  'cao':                        'cao',
  'mgo':                        'mgo',
  'na2o':                       'na2o',
  'k2o':                        'k2o',
  'energia_superficial':        'energia_superficial',
  'angulo_contacto':            'angulo_contacto',
  'trabajo_adhesion':           'trabajo_adhesion',
  'espesor_doble_capa':         'espesor_doble_capa',
  'huella_carbono':             'huella_carbono',
  'energia_incorporada':        'energia_incorporada',
  'reciclabilidad':             'reciclabilidad',
};

// Columnas válidas en materiales_vectores (para filtrar las que no existen)
const COLUMNAS_VALIDAS = new Set(Object.values(MAPEO_COLUMNAS));

export async function syncMaterialesToSupabase(): Promise<void> {
  console.log('\n🔄 Iniciando sincronización Google Sheets → Supabase...\n');

  const vectors = await readVectorsFromSheet();

  if (vectors.length === 0) {
    console.log('⚠️  No hay vectores para sincronizar. Verificar hoja NORMALIZACION.');
    return;
  }

  let sincronizados = 0;
  let errores = 0;

  for (const vector of vectors) {
    try {
      // Construir registro mapeando nombres de Sheets → columnas de Supabase
      const propiedadesMapeadas: Record<string, number | null> = {};

      for (const [clave, valor] of Object.entries(vector.propiedades)) {
        const claveNorm = clave.toLowerCase().trim();
        const columnaSupabase = MAPEO_COLUMNAS[claveNorm];

        if (columnaSupabase && COLUMNAS_VALIDAS.has(columnaSupabase)) {
          propiedadesMapeadas[columnaSupabase] = valor as number | null;
        }
        // Si no está en el mapeo, se ignora silenciosamente
      }

      // Saltar filas decorativas o sin datos reales
      const idLimpio = vector.materialId.trim();
      if (idLimpio.startsWith('▶') || idLimpio.startsWith('🎯') || idLimpio === '#REF!' || idLimpio === '') {
        continue;
      }
      const propiedadesConDatos = Object.values(propiedadesMapeadas).filter(v => v !== null).length;
      if (propiedadesConDatos === 0) {
        continue;
      }

      const registro = {
        id_material:    idLimpio,
        ...propiedadesMapeadas,
        actualizado_en: new Date().toISOString(),
      };

      // ── CORRECCIÓN PRINCIPAL: tabla materiales_vectores ──
      const { error } = await supabase
        .from('materiales_vectores')
        .upsert(registro, {
          onConflict: 'id_material'
        });

      if (error) {
        console.error(`❌ Error sincronizando ${vector.materialId}:`, error.message);
        errores++;
      } else {
        const propiedadesValidas = Object.values(propiedadesMapeadas)
          .filter(v => v !== null).length;
        console.log(`✅ ${vector.materialId} — ${propiedadesValidas} propiedades leídas (directas + inversas)`);
        sincronizados++;
      }
    } catch (err) {
      console.error(`❌ Error inesperado en ${vector.materialId}:`, err);
      errores++;
    }
  }

  console.log(`\n📊 Sincronización completada:`);
  console.log(`   ✅ Sincronizados: ${sincronizados}`);
  console.log(`   ❌ Errores: ${errores}`);
  console.log(`   📅 Timestamp: ${new Date().toISOString()}\n`);
}

// Lee el vector de un material desde materiales_vectores
export async function getVectorFromSupabase(
  materialId: string
): Promise<Record<string, number | null> | null> {
  const { data, error } = await supabase
    .from('materiales_vectores')
    .select('*')
    .eq('id_material', materialId)
    .single();

  if (error || !data) {
    console.error(`❌ Material ${materialId} no encontrado en Supabase`);
    return null;
  }

  // Normalizar claves: crear aliases para que las neuronas encuentren
  // sus propiedades independientemente de mayúsculas o variantes de nombre.
  // Ejemplos: neurona busca 'area_BET' pero Supabase guarda 'area_bet'
  //           neurona busca 'indice_vacios' pero Supabase guarda 'indice_vacios_e'
  const raw = data as Record<string, any>;
  const normalizado: Record<string, number | null> = {};

  for (const [clave, valor] of Object.entries(raw)) {
    // Guardar con clave original
    normalizado[clave] = (valor === null || valor === undefined) ? null : Number(valor);
    // Guardar también en minúsculas (resuelve area_BET vs area_bet)
    const claveMin = clave.toLowerCase();
    if (claveMin !== clave) {
      normalizado[claveMin] = normalizado[clave];
    }
  }

  // Aliases manuales para casos especiales
  // indice_vacios_e → también disponible como indice_vacios (nombre de neurona N005)
  if ('indice_vacios_e' in normalizado) {
    normalizado['indice_vacios'] = normalizado['indice_vacios_e'];
  }
  // area_bet → también disponible como area_BET (propertyName de neurona N007)
  if ('area_bet' in normalizado) {
    normalizado['area_BET'] = normalizado['area_bet'];
  }
  // tamaño_particula → también sin tilde
  if ('tamaño_particula' in normalizado) {
    normalizado['tamano_particula'] = normalizado['tamaño_particula'];
  }

  return normalizado;
}

export async function listarMaterialesSupabase(): Promise<string[]> {
  const { data, error } = await supabase
    .from('materiales_vectores')   // ← CORRECCIÓN: tabla correcta
    .select('id_material');

  if (error || !data) return [];
  return data.map((row: any) => row.id_material);
}
// ── AUTO-EJECUCIÓN cuando se corre directamente ──────────────
// Detecta si este archivo es el punto de entrada (no importado)
if (require.main === module) {
  syncMaterialesToSupabase()
    .then(() => {
      console.log('✅ Sincronización completada. Saliendo.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Error en sincronización:', err.message);
      process.exit(1);
    });
}