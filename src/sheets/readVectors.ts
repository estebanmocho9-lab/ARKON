// ============================================================
// src/sheets/readVectors.ts
// Fuente única de vectores: Google Sheets / NORMALIZACION.
// ============================================================

import { sheets, SPREADSHEET_ID } from './sheetsConnection';

export interface MaterialVector {
  materialId: string;
  estado: string;
  propiedades: Record<string, number | null>;
}

const MAPEO_HEADERS: Record<string, string> = {
  'densidad real':'densidad_real','densidad aparente':'densidad_aparente','porosidad total':'porosidad_total','absorción de agua':'absorcion_agua','absorcion de agua':'absorcion_agua','índice de vacíos':'indice_vacios_e','indice de vacios':'indice_vacios_e','índice de vacios':'indice_vacios_e','diámetro de poro':'diametro_poro','diametro de poro':'diametro_poro','área bet':'area_bet','area bet':'area_bet','volumen de poro':'volumen_poro','tamaño de partícula':'tamaño_particula','tamano de particula':'tamaño_particula','tamaño de particula':'tamaño_particula','tortuosidad':'tortuosidad','resistencia a compresión':'resistencia_compresion','resistencia a compresion':'resistencia_compresion','resistencia a tracción':'resistencia_traccion','resistencia a traccion':'resistencia_traccion','resistencia a flexión':'resistencia_flexion','resistencia a flexion':'resistencia_flexion','módulo de young':'modulo_young','modulo de young':'modulo_young','módulo de corte':'modulo_corte','modulo de corte':'modulo_corte','módulo volumétrico':'modulo_volumetrico','modulo volumetrico':'modulo_volumetrico','cohesión':'cohesion','cohesion':'cohesion','dureza mohs':'dureza_mohs','ángulo de fricción':'angulo_friccion','angulo de friccion':'angulo_friccion','coeficiente de poisson':'poisson','conductividad térmica':'conductividad_termica','conductividad termica':'conductividad_termica','calor específico':'calor_especifico','calor especifico':'calor_especifico','expansión térmica':'expansion_termica','expansion termica':'expansion_termica','temperatura de servicio':'temperatura_servicio','temperatura de fusión':'temperatura_fusion','temperatura de fusion':'temperatura_fusion','difusividad térmica':'difusividad_termica','difusividad termica':'difusividad_termica','permeabilidad intrínseca':'permeabilidad_intrinseca','permeabilidad intrinseca':'permeabilidad_intrinseca','conductividad hidráulica':'conductividad_hidraulica','conductividad hidraulica':'conductividad_hidraulica','difusión de agua':'difusion_agua','difusion de agua':'difusion_agua','difusión de gases':'difusion_gases','difusion de gases':'difusion_gases','difusión iónica':'difusion_ionica','difusion ionica':'difusion_ionica','conductividad eléctrica':'conductividad_electrica','conductividad electrica':'conductividad_electrica','ph':'ph','capacidad intercambio catiónico':'cec','capacidad intercambio cationico':'cec','adsorción':'adsorcion','adsorcion':'adsorcion','potencial zeta':'potencial_zeta','energía superficial':'energia_superficial','energia superficial':'energia_superficial','ángulo de contacto':'angulo_contacto','angulo de contacto':'angulo_contacto','trabajo de adhesión':'trabajo_adhesion','trabajo de adhesion':'trabajo_adhesion','espesor de doble capa':'espesor_doble_capa','sio₂':'sio2','sio2':'sio2','al₂o₃':'al2o3','al2o3':'al2o3','fe₂o₃':'fe2o3','fe2o3':'fe2o3','cao':'cao','mgo':'mgo','na₂o':'na2o','na2o':'na2o','k₂o':'k2o','k2o':'k2o','huella de carbono':'huella_carbono','energía incorporada':'energia_incorporada','energia incorporada':'energia_incorporada','reciclabilidad':'reciclabilidad',
  'volumen específico real':'volumen_especifico_real','volumen especifico real':'volumen_especifico_real','volumen específico aparente':'volumen_especifico_aparente','volumen especifico aparente':'volumen_especifico_aparente','compacidad':'compacidad','impermeabilidad':'impermeabilidad','índice de sólidos':'indice_solidos','indice de solidos':'indice_solidos','estrechez capilar':'estrechez_capilar','lisura geométrica':'lisura_geometrica','lisura geometrica':'lisura_geometrica','volumen esqueleto':'volumen_esqueleto','superficie específica blaine':'superficie_especifica_blaine','superficie especifica blaine':'superficie_especifica_blaine','rectitud flujo':'rectitud_flujo','deflectabilidad':'deflectabilidad','complacencia elástica':'complacencia_elastica','complacencia elastica':'complacencia_elastica','complacencia de cizalladura':'complacencia_cizalladura','compresibilidad':'compresibilidad','inv_cohesión':'inv_cohesion','inv_cohesion':'inv_cohesion','blandura':'blandura','coef. deslizamiento':'coef_deslizamiento','coef deslizamiento':'coef_deslizamiento','relación esbeltez':'relacion_esbeltez','relacion esbeltez':'relacion_esbeltez','resistividad térmica':'resistividad_termica','resistividad termica':'resistividad_termica','sensibilidad térmica':'sensibilidad_termica','sensibilidad termica':'sensibilidad_termica','contracción térmica':'contraccion_termica','contraccion termica':'contraccion_termica','temperatura de falla':'temperatura_falla','solidificación':'solidificacion','solidificacion':'solidificacion','retardo térmico':'retardo_termico','retardo termico':'retardo_termico','resistencia matriz':'resistencia_matriz','resistividad hidráulica':'resistividad_hidraulica','resistividad hidraulica':'resistividad_hidraulica','resistencia a difusión':'resistencia_difusion','resistencia a difusion':'resistencia_difusion','resistencia a gases':'resistencia_gases','resistencia iónica':'resistencia_ionica','resistencia ionica':'resistencia_ionica','resistividad eléctrica':'resistividad_electrica','resistividad electrica':'resistividad_electrica','poh':'poh','capacidad aniónica':'capacidad_anionica','capacidad anionica':'capacidad_anionica','desorción':'desorcion','desorcion':'desorcion','punto carga cero':'punto_carga_cero','estabilidad cohesiva':'estabilidad_cohesiva','coseno ángulo':'coseno_angulo','coseno angulo':'coseno_angulo','trabajo de cohesión':'trabajo_cohesion','trabajo de cohesion':'trabajo_cohesion','radio de debye':'radio_debye','actividad puzolánica':'actividad_puzolana','actividad puzolana':'actividad_puzolana','actividad puzolanica':'actividad_puzolana','contenido alúmina':'contenido_alumina','contenido alumina':'contenido_alumina','contenido férrico':'contenido_ferrico','contenido ferrico':'contenido_ferrico','cal libre':'cal_libre','magnesia':'magnesia','sosa':'sosa','potasa':'potasa','captura de carbono':'captura_carbono','energía recuperable':'energia_recuperable','energia recuperable':'energia_recuperable','no reciclable':'no_reciclable'
};

const COLUMNAS_NO_PROP = new Set(['id_material','estado','id_entidad','material','id material']);
let cache: MaterialVector[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

function limpiarTexto(value: string): string {
  return value.toString().replace(/[⚡✏️▶]/g, '').trim();
}

function normalizarClave(value: string): string {
  return limpiarTexto(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_').replace(/[^\w_]/g, '');
}

function normalizarEstado(value: string | undefined): string {
  return limpiarTexto(value ?? '').toUpperCase().replace(/\s+/g, '');
}

function normalizarMaterialId(value: string): string {
  return limpiarTexto(value).replace(/^material[_\s-]*/i, '').toUpperCase();
}

function resolverNombreColumna(header: string): string | null {
  const limpio = limpiarTexto(header).toLowerCase();
  if (COLUMNAS_NO_PROP.has(limpio)) return null;
  if (MAPEO_HEADERS[limpio]) return MAPEO_HEADERS[limpio];
  return normalizarClave(limpio) || null;
}

function parsearValor(raw: string | undefined): number | null {
  if (raw === undefined || raw === null) return null;
  const s = raw.toString().trim();
  if (s === '' || /^(NULL|null|#NAME\?|#N\/A|N\/A)$/i.test(s)) return null;
  const n = parseFloat(s.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

export async function readVectorsFromSheet(): Promise<MaterialVector[]> {
  const now = Date.now();
  if (cache && now - cacheTime < CACHE_TTL) return cache;
  try {
    const response = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'NORMALIZACION!A1:DZ' });
    const rows = response.data.values;
    if (!rows?.length) {
      console.warn('⚠️ NORMALIZACION está vacía o no devolvió filas.');
      return [];
    }

    // No suponemos que el encabezado esté exactamente en la primera fila:
    // buscamos una fila que realmente describa ID + estado dentro de las primeras 30 filas.
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(rows.length, 30); i++) {
      const first = normalizarClave(String(rows[i]?.[0] ?? ''));
      const hasId = ['id_material', 'id_entidad', 'material', 'idmaterial'].includes(first);
      const hasEstado = rows[i]?.some((cell: any) => normalizarClave(String(cell ?? '')) === 'estado');
      if (hasId || (first.includes('material') && hasEstado)) {
        headerRowIndex = i;
        break;
      }
    }
    if (headerRowIndex < 0) {
      console.error(`❌ NORMALIZACION: no se encontró encabezado de ID material en las primeras ${Math.min(rows.length, 30)} filas.`);
      return [];
    }

    const headers = rows[headerRowIndex];
    const colMap = headers.map((h: any, i: number) => {
      const key = normalizarClave(h?.toString() || '');
      if (i === 0) return '__ID__';
      if (key === 'estado') return '__ESTADO__';
      return resolverNombreColumna(h?.toString() || '');
    });
    const estadoIndex = colMap.indexOf('__ESTADO__');
    const vectors: MaterialVector[] = [];

    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row?.[0]) continue;
      const id = limpiarTexto(String(row[0]));
      if (!id || id === '#REF!' || id.startsWith('▶') || id.startsWith('🎯')) continue;
      const estado = estadoIndex >= 0 ? limpiarTexto(String(row[estadoIndex] ?? 'Desconocido')) : 'E01';
      const propiedades: Record<string, number | null> = {};
      for (let j = 0; j < colMap.length; j++) {
        const colNombre = colMap[j];
        if (!colNombre || colNombre === '__ID__' || colNombre === '__ESTADO__') continue;
        propiedades[colNombre] = parsearValor(row[j]);
      }
      vectors.push({ materialId: normalizarMaterialId(id), estado, propiedades });
    }

    cache = vectors;
    cacheTime = now;
    console.log(`📊 NORMALIZACION: ${vectors.length} vectores reales leídos.`);
    if (vectors.length > 0) {
      console.log(`📊 NORMALIZACION: primeros IDs: ${vectors.slice(0, 8).map(v => v.materialId).join(', ')}`);
    }
    return vectors;
  } catch (error: any) {
    console.error('❌ Error leyendo NORMALIZACION:', error?.message || error);
    return [];
  }
}

export async function getValorNormalizado(materialId: string, propiedad: string, estado?: string): Promise<number | null> {
  const vectors = await readVectorsFromSheet();
  const idBuscado = normalizarMaterialId(materialId);
  const estadoBuscado = estado ? normalizarEstado(estado) : '';
  const candidatos = vectors.filter(v => normalizarMaterialId(v.materialId) === idBuscado);
  if (!candidatos.length) return null;
  const material = estadoBuscado
    ? candidatos.find(v => normalizarEstado(v.estado) === estadoBuscado) ?? candidatos[0]
    : candidatos[0];
  if (!material) return null;
  const propNorm = normalizarClave(propiedad);
  if (Object.prototype.hasOwnProperty.call(material.propiedades, propNorm)) return material.propiedades[propNorm] ?? null;
  const alias = MAPEO_HEADERS[propiedad.toLowerCase().trim()];
  if (alias && Object.prototype.hasOwnProperty.call(material.propiedades, alias)) return material.propiedades[alias] ?? null;
  return null;
}