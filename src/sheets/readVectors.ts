// ============================================================
// src/sheets/readVectors.ts
// Lee hoja NORMALIZACION — compatible con estructura real
// Columnas: ID_Material, Estado, ...propiedades (nombres con tildes y espacios)
// ============================================================

import { sheets, SPREADSHEET_ID } from './sheetsConnection';

export interface MaterialVector {
  materialId: string;
  estado: string;
  propiedades: Record<string, number | null>;
}

// Mapeo EXPLÍCITO: nombre exacto de encabezado en Sheets → propertyName de neurona
// Esto es más robusto que normalizar, porque las tildes y variantes son predecibles.
const MAPEO_HEADERS: Record<string, string> = {
  // Directas
  'densidad real':               'densidad_real',
  'densidad aparente':           'densidad_aparente',
  'porosidad total':             'porosidad_total',
  'absorción de agua':           'absorcion_agua',
  'absorcion de agua':           'absorcion_agua',
  'índice de vacíos':            'indice_vacios_e',
  'indice de vacios':            'indice_vacios_e',
  'índice de vacios':            'indice_vacios_e',
  'diámetro de poro':            'diametro_poro',
  'diametro de poro':            'diametro_poro',
  'área bet':                    'area_bet',
  'area bet':                    'area_bet',
  'volumen de poro':             'volumen_poro',
  'tamaño de partícula':         'tamaño_particula',
  'tamano de particula':         'tamaño_particula',
  'tamaño de particula':         'tamaño_particula',
  'tortuosidad':                 'tortuosidad',
  'resistencia a compresión':    'resistencia_compresion',
  'resistencia a compresion':    'resistencia_compresion',
  'resistencia a tracción':      'resistencia_traccion',
  'resistencia a traccion':      'resistencia_traccion',
  'resistencia a flexión':       'resistencia_flexion',
  'resistencia a flexion':       'resistencia_flexion',
  'módulo de young':             'modulo_young',
  'modulo de young':             'modulo_young',
  'módulo de corte':             'modulo_corte',
  'modulo de corte':             'modulo_corte',
  'módulo volumétrico':          'modulo_volumetrico',
  'modulo volumetrico':          'modulo_volumetrico',
  'cohesión':                    'cohesion',
  'cohesion':                    'cohesion',
  'dureza mohs':                 'dureza_mohs',
  'ángulo de fricción':          'angulo_friccion',
  'angulo de friccion':          'angulo_friccion',
  'coeficiente de poisson':      'poisson',
  'conductividad térmica':       'conductividad_termica',
  'conductividad termica':       'conductividad_termica',
  'calor específico':            'calor_especifico',
  'calor especifico':            'calor_especifico',
  'expansión térmica':           'expansion_termica',
  'expansion termica':           'expansion_termica',
  'temperatura de servicio':     'temperatura_servicio',
  'temperatura de fusión':       'temperatura_fusion',
  'temperatura de fusion':       'temperatura_fusion',
  'difusividad térmica':         'difusividad_termica',
  'difusividad termica':         'difusividad_termica',
  'permeabilidad intrínseca':    'permeabilidad_intrinseca',
  'permeabilidad intrinseca':    'permeabilidad_intrinseca',
  'conductividad hidráulica':    'conductividad_hidraulica',
  'conductividad hidraulica':    'conductividad_hidraulica',
  'difusión de agua':            'difusion_agua',
  'difusion de agua':            'difusion_agua',
  'difusión de gases':           'difusion_gases',
  'difusion de gases':           'difusion_gases',
  'difusión iónica':             'difusion_ionica',
  'difusion ionica':             'difusion_ionica',
  'conductividad eléctrica':     'conductividad_electrica',
  'conductividad electrica':     'conductividad_electrica',
  'ph':                          'ph',
  'capacidad intercambio catiónico': 'cec',
  'capacidad intercambio cationico': 'cec',
  'adsorción':                   'adsorcion',
  'adsorcion':                   'adsorcion',
  'potencial zeta':              'potencial_zeta',
  'energía superficial':         'energia_superficial',
  'energia superficial':         'energia_superficial',
  'ángulo de contacto':          'angulo_contacto',
  'angulo de contacto':          'angulo_contacto',
  'trabajo de adhesión':         'trabajo_adhesion',
  'trabajo de adhesion':         'trabajo_adhesion',
  'espesor de doble capa':       'espesor_doble_capa',
  'sio₂':                        'sio2',
  'sio2':                        'sio2',
  'al₂o₃':                       'al2o3',
  'al2o3':                       'al2o3',
  'fe₂o₃':                       'fe2o3',
  'fe2o3':                       'fe2o3',
  'cao':                         'cao',
  'mgo':                         'mgo',
  'na₂o':                        'na2o',
  'na2o':                        'na2o',
  'k₂o':                         'k2o',
  'k2o':                         'k2o',
  'huella de carbono':           'huella_carbono',
  'energía incorporada':         'energia_incorporada',
  'energia incorporada':         'energia_incorporada',
  'reciclabilidad':              'reciclabilidad',
  // Inversas — nombres científicos exactos de Google Sheets
  'volumen específico real':          'volumen_especifico_real',
  'volumen especifico real':          'volumen_especifico_real',
  'volumen específico aparente':      'volumen_especifico_aparente',
  'volumen especifico aparente':      'volumen_especifico_aparente',
  'compacidad':                       'compacidad',
  'impermeabilidad':                  'impermeabilidad',
  'índice de sólidos':                'indice_solidos',
  'indice de solidos':                'indice_solidos',
  'estrechez capilar':                'estrechez_capilar',
  'lisura geométrica':                'lisura_geometrica',
  'lisura geometrica':                'lisura_geometrica',
  'volumen esqueleto':                'volumen_esqueleto',
  'superficie específica blaine':     'superficie_especifica_blaine',
  'superficie especifica blaine':     'superficie_especifica_blaine',
  'rectitud flujo':                   'rectitud_flujo',
  'deflectabilidad':                  'deflectabilidad',
  'complacencia elástica':            'complacencia_elastica',
  'complacencia elastica':            'complacencia_elastica',
  'complacencia de cizalladura':      'complacencia_cizalladura',
  'compresibilidad':                  'compresibilidad',
  'inv_cohesión':                     'inv_cohesion',
  'inv_cohesion':                     'inv_cohesion',
  'blandura':                         'blandura',
  'coef. deslizamiento':              'coef_deslizamiento',
  'coef deslizamiento':               'coef_deslizamiento',
  'relación esbeltez':                'relacion_esbeltez',
  'relacion esbeltez':                'relacion_esbeltez',
  'resistividad térmica':             'resistividad_termica',
  'resistividad termica':             'resistividad_termica',
  'sensibilidad térmica':             'sensibilidad_termica',
  'sensibilidad termica':             'sensibilidad_termica',
  'contracción térmica':              'contraccion_termica',
  'contraccion termica':              'contraccion_termica',
  'temperatura de falla':             'temperatura_falla',
  'solidificación':                   'solidificacion',
  'solidificacion':                   'solidificacion',
  'retardo térmico':                  'retardo_termico',
  'retardo termico':                  'retardo_termico',
  'resistencia matriz':               'resistencia_matriz',
  'resistividad hidráulica':          'resistividad_hidraulica',
  'resistividad hidraulica':          'resistividad_hidraulica',
  'resistencia a difusión':           'resistencia_difusion',
  'resistencia a difusion':           'resistencia_difusion',
  'resistencia a gases':              'resistencia_gases',
  'resistencia iónica':               'resistencia_ionica',
  'resistencia ionica':               'resistencia_ionica',
  'resistividad eléctrica':           'resistividad_electrica',
  'resistividad electrica':           'resistividad_electrica',
  'poh':                              'poh',
  'capacidad aniónica':               'capacidad_anionica',
  'capacidad anionica':               'capacidad_anionica',
  'desorción':                        'desorcion',
  'desorcion':                        'desorcion',
  'punto carga cero':                 'punto_carga_cero',
  'estabilidad cohesiva':             'estabilidad_cohesiva',
  'coseno ángulo':                    'coseno_angulo',
  'coseno angulo':                    'coseno_angulo',
  'trabajo de cohesión':              'trabajo_cohesion',
  'trabajo de cohesion':              'trabajo_cohesion',
  'radio de debye':                   'radio_debye',
  'actividad puzolánica':             'actividad_puzolana',
  'actividad puzolana':               'actividad_puzolana',
  'actividad puzolanica':             'actividad_puzolana',
  'contenido alúmina':                'contenido_alumina',
  'contenido alumina':                'contenido_alumina',
  'contenido férrico':                'contenido_ferrico',
  'contenido ferrico':                'contenido_ferrico',
  'cal libre':                        'cal_libre',
  'magnesia':                         'magnesia',
  'sosa':                             'sosa',
  'potasa':                           'potasa',
  'captura de carbono':               'captura_carbono',
  'energía recuperable':              'energia_recuperable',
  'energia recuperable':              'energia_recuperable',
  'no reciclable':                    'no_reciclable',
};

// Columna que NO es una propiedad numérica
const COLUMNAS_NO_PROP = new Set(['id_material', 'estado', 'id_entidad']);

// Caché simple (5 minutos)
let cache: MaterialVector[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

function resolverNombreColumna(header: string): string | null {
  // Limpia el header: minúsculas, quita espacios extra, quita emojis
  const limpio = header
    .toLowerCase()
    .trim()
    .replace(/[⚡✏️▶]/g, '')   // emojis que pueden estar en la hoja
    .trim();
  
  // Columnas de identidad — ignorar
  if (COLUMNAS_NO_PROP.has(limpio)) return null;
  
  // Buscar mapeo directo
  if (MAPEO_HEADERS[limpio]) return MAPEO_HEADERS[limpio];
  
  // Fallback: normalizar (quitar tildes, espacios a guión bajo)
  const normalizado = limpio
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar tildes
    .replace(/\s+/g, '_')
    .replace(/[^\w_]/g, '');
  
  return normalizado || null;
}

function parsearValor(raw: string | undefined): number | null {
  if (raw === undefined || raw === null) return null;
  const s = raw.toString().trim();
  if (s === '' || s === 'NULL' || s === 'null' || s === '#NAME?' || s === '#N/A' || s === 'N/A') return null;
  const n = parseFloat(s.replace(',', '.'));
  return isNaN(n) ? null : n;
}

export async function readVectorsFromSheet(): Promise<MaterialVector[]> {
  const now = Date.now();
  if (cache && (now - cacheTime) < CACHE_TTL) {
    console.log(`📦 Usando caché — ${cache.length} vectores`);
    return cache;
  }

  try {
    console.log('🔌 Conectando a Google Sheets...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'NORMALIZACION!A1:DZ',  // amplio para cubrir todas las columnas INV_
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('⚠️  NORMALIZACION: hoja vacía o sin respuesta');
      return [];
    }

    // ── BUSCAR FILA DE ENCABEZADOS ──────────────────────────────
    // La hoja tiene la fila de headers en fila 1 (índice 0)
    // Acepta: "ID_Material", "ID_Entidad", "MATERIAL" en col A
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(rows.length, 5); i++) {
      const primeraCelda = rows[i][0]?.toString().trim().toLowerCase();
      if (
        primeraCelda === 'id_material' ||
        primeraCelda === 'id_entidad' ||
        primeraCelda === 'material' ||
        primeraCelda === 'id material'
      ) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      console.error('❌ NORMALIZACION: no se encontró fila de encabezados.');
      console.error('   La primera columna debe decir "ID_Material" o "ID_Entidad".');
      console.error(`   Primera celda encontrada: "${rows[0]?.[0]}"`);
      return [];
    }

    const headers = rows[headerRowIndex];
    console.log(`✅ Encabezados encontrados en fila ${headerRowIndex + 1} — ${headers.length} columnas`);

    // Resolver nombres de columnas una sola vez
    const colMap: (string | null)[] = headers.map((h: any, i: number) => {
      if (i === 0) return '__ID__';  // col A = ID del material
      if (i === 1) {
        const h2 = h?.toString().trim().toLowerCase();
        if (h2 === 'estado') return '__ESTADO__';  // col B = Estado
      }
      return resolverNombreColumna(h?.toString() || '');
    });

    // Contar columnas mapeadas para diagnóstico
    const mapeadas = colMap.filter(c => c && c !== '__ID__' && c !== '__ESTADO__').length;
    console.log(`📊 Columnas mapeadas a propiedades: ${mapeadas} de ${headers.length - 2}`);

    // ── PROCESAR FILAS DE DATOS ─────────────────────────────────
    const vectors: MaterialVector[] = [];

    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || !row[0]) continue;  // fila vacía

      const id = row[0].toString().trim();
      if (!id || id.startsWith('▶') || id.startsWith('🎯')) continue;  // secciones decorativas

      const estado = row[1]?.toString().trim() || 'Desconocido';
      const propiedades: Record<string, number | null> = {};

      for (let j = 2; j < colMap.length; j++) {
        const colNombre = colMap[j];
        if (!colNombre || colNombre === '__ID__' || colNombre === '__ESTADO__') continue;
        propiedades[colNombre] = parsearValor(row[j]);
      }

      const propsConDatos = Object.values(propiedades).filter(v => v !== null).length;
      vectors.push({ materialId: id, estado, propiedades });
      console.log(`  ✅ ${id} [${estado}] — ${propsConDatos} propiedades con datos`);
    }

    console.log(`\n📊 Total vectores leídos de NORMALIZACION: ${vectors.length}\n`);
    cache = vectors;
    cacheTime = now;
    return vectors;

  } catch (error: any) {
    console.error('❌ Error leyendo NORMALIZACION:', error?.message || error);
    if (error?.code === 403) {
      console.error('   → La service account no tiene permiso sobre esta planilla.');
      console.error('   → Compartí la planilla con: impulso-ia-sheets@impulsoia-496800.iam.gserviceaccount.com');
    }
    return [];
  }
}

// Obtiene valor normalizado para una propiedad de un material+estado específico
export async function getValorNormalizado(
  materialId: string,
  propiedad: string,
  estado?: string
): Promise<number | null> {
  const vectors = await readVectorsFromSheet();
  
  // Buscar por materialId + estado si se especifica
  let material: MaterialVector | undefined;
  if (estado) {
    material = vectors.find(v => v.materialId === materialId && v.estado === estado);
  }
  // Fallback: primer vector que coincida con materialId
  if (!material) {
    material = vectors.find(v => v.materialId === materialId);
  }
  
  if (!material) return null;
  
  const propNorm = propiedad.toLowerCase().trim().replace(/\s+/g, '_');
  const valor = material.propiedades[propNorm] ?? material.propiedades[propiedad] ?? null;
  return valor;
}