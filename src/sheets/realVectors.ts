import { sheets, SPREADSHEET_ID } from './sheetsConnection';
import { ALL_NEURONS } from '../neurons/index';

export interface RealMaterialVector {
  materialId: string;
  estado: string;
  propiedades: Record<string, number | null>;
}

const SUBSCRIPTS: Record<string, string> = {
  '₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9'
};

function clean(value: unknown): string {
  return String(value ?? '').replace(/[⚡✏️▶🎯]/g, '').trim();
}

function canonical(value: unknown): string {
  let s = clean(value).toLowerCase();
  s = s.replace(/[₀₁₂₃₄₅₆₇₈₉]/g, c => SUBSCRIPTS[c] ?? c);
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  s = s.replace(/\([^)]*\)|\[[^\]]*\]/g, ' ');
  s = s.replace(/\b(de|del|la|el|a|al|por|para|y|the|of|to)\b/g, ' ');
  return s.replace(/[^a-z0-9]+/g, '');
}

function normalizeMaterialId(value: unknown): string {
  return clean(value).replace(/^material[_\s-]*/i, '').toUpperCase();
}

function parseNumber(value: unknown): number | null {
  if (value === undefined || value === null) return null;
  const s = clean(value);
  if (!s || /^(null|n\/a|na|#name\?|#n\/a|#ref!)$/i.test(s)) return null;
  const normalized = s.replace(/\s/g, '').replace(/,(?=\d{1,3}(?:$|\D))/g, '.');
  const n = Number.parseFloat(normalized);
  return Number.isFinite(n) ? n : null;
}

function stateNorm(value: unknown): string {
  return clean(value).toLowerCase().replace(/\s+/g, '');
}

function statePreferred(estado?: string): string[] {
  if (!estado) return [];
  const e = estado.trim().toUpperCase();
  if (e === 'E01') return ['polvo', 'componente', 'e01'];
  if (e === 'E02') return ['fraguado', 'fraguadocomponente', 'e02'];
  if (e === 'E03') return ['e03'];
  return [stateNorm(estado)];
}

const neuronProperties = [...new Set(ALL_NEURONS.map(n => n.propertyName))];
const neuronByCanonical = new Map<string, string>();
for (const property of neuronProperties) neuronByCanonical.set(canonical(property), property);

const aliases: Record<string, string> = {
  'areabet': 'area_bet',
  'sio2': 'sio2',
  'al2o3': 'al2o3',
  'fe2o3': 'fe2o3',
  'cao': 'cao',
  'mgo': 'mgo',
  'na2o': 'na2o',
  'k2o': 'k2o',
  'cec': 'cec',
  'ph': 'ph',
  'poh': 'poh'
};

function propertyNameForHeader(header: unknown): string | null {
  const key = canonical(header);
  return neuronByCanonical.get(key) ?? aliases[key] ?? null;
}

let cache: RealMaterialVector[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 1000;

export function clearRealVectorCache(): void {
  cache = null;
  cacheTime = 0;
}

export async function readRealVectors(): Promise<RealMaterialVector[]> {
  const now = Date.now();
  if (cache && now - cacheTime < CACHE_TTL) return cache;

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'NORMALIZACION!A1:ZZZ'
    });
    const rows = response.data.values as unknown[][] | undefined;
    if (!rows?.length) {
      console.error('❌ NORMALIZACION no devolvió filas.');
      return [];
    }

    let headerRow = -1;
    let idIndex = -1;
    let estadoIndex = -1;

    for (let i = 0; i < Math.min(rows.length, 50); i++) {
      const ids = rows[i].map(cell => canonical(cell));
      const foundId = ids.findIndex(k => ['idmaterial', 'identidad', 'materialid', 'material'].includes(k));
      const foundState = ids.findIndex(k => k === 'estado');
      if (foundId >= 0 && (foundState >= 0 || ids.some(k => k.includes('estado')))) {
        headerRow = i;
        idIndex = foundId;
        estadoIndex = foundState >= 0 ? foundState : ids.findIndex(k => k.includes('estado'));
        break;
      }
    }

    // Segundo intento: si la hoja tiene ID pero no una columna Estado, también es válida.
    if (headerRow < 0) {
      for (let i = 0; i < Math.min(rows.length, 50); i++) {
        const ids = rows[i].map(cell => canonical(cell));
        const foundId = ids.findIndex(k => ['idmaterial', 'identidad', 'materialid', 'material'].includes(k));
        if (foundId >= 0) {
          headerRow = i;
          idIndex = foundId;
          estadoIndex = ids.findIndex(k => k === 'estado' || k.includes('estado'));
          break;
        }
      }
    }

    if (headerRow < 0 || idIndex < 0) {
      console.error('❌ NORMALIZACION: no se encontró columna ID material.');
      console.error(`   Filas recibidas: ${rows.length}. Primera fila: ${JSON.stringify(rows[0]?.slice(0, 12) ?? [])}`);
      return [];
    }

    const headers = rows[headerRow];
    const columnMap = headers.map(propertyNameForHeader);
    const matched = columnMap.filter(Boolean).length;
    console.log(`📊 NORMALIZACION: encabezado fila ${headerRow + 1}, ID columna ${idIndex + 1}, Estado columna ${estadoIndex >= 0 ? estadoIndex + 1 : 'no encontrada'}, propiedades neuronales reconocidas ${matched}.`);

    const vectors: RealMaterialVector[] = [];
    for (let i = headerRow + 1; i < rows.length; i++) {
      const row = rows[i];
      const id = normalizeMaterialId(row?.[idIndex]);
      if (!/^M\.\d+$/i.test(id)) continue;

      const estado = estadoIndex >= 0 ? clean(row?.[estadoIndex]) || 'E01' : 'E01';
      const propiedades: Record<string, number | null> = {};
      for (let j = 0; j < columnMap.length; j++) {
        const property = columnMap[j];
        if (!property) continue;
        propiedades[property] = parseNumber(row?.[j]);
      }
      vectors.push({ materialId: id, estado, propiedades });
    }

    cache = vectors;
    cacheTime = now;
    const ids = [...new Set(vectors.map(v => v.materialId))];
    console.log(`📊 NORMALIZACION: ${vectors.length} vectores reales leídos; ${ids.length} materiales únicos.`);
    console.log(`📊 NORMALIZACION: primeros IDs: ${ids.slice(0, 12).join(', ') || 'NINGUNO'}`);
    return vectors;
  } catch (error: any) {
    console.error('❌ Error leyendo NORMALIZACION:', error?.message || error);
    return [];
  }
}

export async function getRealVector(materialId: string, estado?: string): Promise<Record<string, number | null> | null> {
  const vectors = await readRealVectors();
  const id = normalizeMaterialId(materialId);
  const candidates = vectors.filter(v => v.materialId === id);
  if (!candidates.length) return null;

  const preferred = statePreferred(estado);
  const selected = preferred.length
    ? candidates.find(v => preferred.includes(stateNorm(v.estado))) ?? candidates[0]
    : candidates[0];
  return selected?.propiedades ?? null;
}

export async function listRealMaterialIds(): Promise<string[]> {
  const vectors = await readRealVectors();
  return [...new Set(vectors.map(v => v.materialId))];
}
