// ============================================================
// ARKON — Persistencia exclusiva ND -> Google Sheets
// Basada en la salida del extractor ND independiente.
// ============================================================

import { sheets, getNDSpreadsheetId, prepararConexionSheetsND } from './ndSheetsConnection';
import { HallazgoND } from '../memoria-nd/tipos';

const HOJA_DOCUMENTOS = 'ND_DOCUMENTOS';
const HOJA_PAGINAS = 'ND_PAGINAS';
const HOJA_HALLAZGOS = 'ND_HALLAZGOS';

const TABS = [
  'DOCUMENTO', 'PAGINAS', 'DATOS_UNIFICADOS', 'HALLAZGOS_RAW',
  'MATERIALES', 'COMPONENTES', 'PROPIEDADES', 'MAGNITUDES', 'ATRIBUTOS',
  'RELACIONES', 'CONDICIONES', 'METODOS', 'INSTRUMENTOS', 'APLICACIONES',
  'COMPORTAMIENTOS', 'NORMAS', 'DEFINICIONES', 'EVIDENCIAS', 'FORMULAS',
  'ENTIDADES_DOCUMENTALES', 'ND_TEXT_PARTES'
] as const;

const KIND_TO_TAB: Record<string, string> = {
  MATERIAL: 'MATERIALES', COMPONENTE: 'COMPONENTES', PROPIEDAD: 'PROPIEDADES',
  MAGNITUD: 'MAGNITUDES', ATRIBUTO: 'ATRIBUTOS', RELACION: 'RELACIONES',
  CONDICION: 'CONDICIONES', METODO: 'METODOS', INSTRUMENTO: 'INSTRUMENTOS',
  APLICACION: 'APLICACIONES', COMPORTAMIENTO: 'COMPORTAMIENTOS', NORMA: 'NORMAS',
  DEFINICION: 'DEFINICIONES', EVIDENCIA: 'EVIDENCIAS', FORMULA: 'FORMULAS',
  ENTIDAD: 'ENTIDADES_DOCUMENTALES'
};

const CABECERA_DOCUMENTOS = ['evento','documento_drive_id','documento','neuron_id','carpeta_drive','estado','paginas_total','paginas_procesadas','hallazgos_total','timestamp'];
const CABECERA_PAGINAS = ['clave_pagina','documento_drive_id','documento','neuron_id','carpeta_drive','pagina','estado','hallazgos','timestamp'];
const CABECERA_HALLAZGOS = ['clave_unica','documento_drive_id','documento','neuron_id','carpeta_drive','pagina','tipo','campo','entidad_candidata','entidad_principal','aspecto','dato_documental','texto_original','texto_normalizado','valor','valor_texto','unidad','simbolo','relacion_entidad','contexto','idioma','confianza','evidencia_json','metadatos_json','timestamp'];
const CABECERA_DOCUMENTO = ['drive_id','documento','estado','hallazgos_total'];
const CABECERA_PAGINA_RICA = ['drive_id','documento','pagina','parte','total_partes','texto_completo','bbox_json','words_json','blocks_json','headings_json','tables_json','links_json','images_json','ocr_usado'];
const CABECERA_UNIFICADA = ['nombre','ingles','sinonimos','categoria','aspecto','familia','subfamilia','material','componente','unidad','simbolo','valor','min','max','condicion','metodo','instrumento','norma','formula','relacion','confianza','origen','documento','pagina','seccion','detalle_json'];
const CABECERA_TEXT_PARTES = ['drive_id','documento','origen','clave','campo','pagina','parte','total_partes','texto'];
const CABECERA_CATEGORIA = ['drive_id','documento','tipo','campo','entidad','aspecto','dato_documental','texto_original','texto_normalizado','valor','valor_texto','unidad','simbolo','contexto','pagina','seccion','confianza','evidencia_json','metadatos_json'];

const FORZAR_REEXTRACCION = process.env.ND_REANALIZAR === '1';
const CELL_LIMIT = 45_000;
const WRITE_GAP_MS = 1_100;
let hojasPreparadas = false;
let ultimaEscritura = 0;

const ahora = () => new Date().toISOString();
const str = (v: unknown) => v == null ? '' : String(v);
const numero = (v: unknown) => v == null || v === '' ? '' : String(v);
const normalizar = (s: unknown) => str(s).replace(/\s+/g, ' ').trim().normalize('NFC');
const valorSeguro = (v: unknown) => { const s = normalizar(v); return /^[=+\-@]/.test(s) ? "'" + s : s; };
const json = (v: unknown) => { try { return JSON.stringify(v ?? {}); } catch { return '{}'; } };

function chunks(s: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < s.length; i += CELL_LIMIT) out.push(s.slice(i, i + CELL_LIMIT));
  return out.length ? out : [''];
}

function isQuotaError(e: any): boolean {
  const s = String(e?.message || e?.response?.data?.error?.message || e);
  return /quota|rate.?limit|resource.?exhausted|429|too many requests/i.test(s);
}

async function sheetsWrite<T>(fn: () => Promise<T>): Promise<T> {
  let delay = 0;
  for (let attempt = 1; attempt <= 8; attempt++) {
    const wait = Math.max(0, WRITE_GAP_MS - (Date.now() - ultimaEscritura));
    if (wait) await new Promise(resolve => setTimeout(resolve, wait));
    try {
      const result = await fn();
      ultimaEscritura = Date.now();
      return result;
    } catch (e) {
      if (!isQuotaError(e) || attempt === 8) throw e;
      delay = delay ? Math.min(delay * 2, 60_000) : 2_000;
      await new Promise(resolve => setTimeout(resolve, delay + Math.floor(Math.random() * 750)));
    }
  }
  throw new Error('Sheets write retry exhausted');
}

function claveHallazgo(h: HallazgoND, documentoDriveId: string, pagina: number): string {
  const e = h.evidencia || {};
  return [h.neuronId, documentoDriveId || e.documento || '', pagina, h.tipo, h.campo || '', e.posicionInicio ?? '', e.posicionFin ?? '', normalizar(h.entidadPrincipal || h.entidadCandidata || '').toLowerCase(), h.aspecto || '', h.textoNormalizado || '', h.valorTexto || '', h.unidad || ''].join('¦');
}
function clavePagina(documentoDriveId: string, neuronId: string, pagina: number): string { return `${documentoDriveId}¦${neuronId}¦${pagina}`; }

async function obtenerFilas(nombreHoja: string): Promise<string[][]> {
  const response = await sheets.spreadsheets.values.get({ spreadsheetId: getNDSpreadsheetId(), range: `${nombreHoja}!A:AZ` });
  return (response?.data?.values || []) as string[][];
}

async function asegurarHoja(nombre: string, headers: string[]): Promise<void> {
  const id = getNDSpreadsheetId();
  try { await sheets.spreadsheets.values.get({ spreadsheetId: id, range: `${nombre}!A1` }); }
  catch { await sheets.spreadsheets.batchUpdate({ spreadsheetId: id, requestBody: { requests: [{ addSheet: { properties: { title: nombre } } }] } }); }
  await sheetsWrite(() => sheets.spreadsheets.values.update({ spreadsheetId: id, range: `${nombre}!A1`, valueInputOption: 'RAW', requestBody: { values: [headers] } }));
}

export function resetSheetsNDContext(): void { hojasPreparadas = false; }

export async function prepararSheetsND(): Promise<void> {
  if (hojasPreparadas) return;
  await prepararConexionSheetsND();
  await asegurarHoja(HOJA_DOCUMENTOS, CABECERA_DOCUMENTOS);
  await asegurarHoja(HOJA_PAGINAS, CABECERA_PAGINAS);
  await asegurarHoja(HOJA_HALLAZGOS, CABECERA_HALLAZGOS);

  const id = getNDSpreadsheetId();
  const meta = await sheets.spreadsheets.get({ spreadsheetId: id, fields: 'sheets.properties' });
  const existentes = new Set((meta.data.sheets || []).map(s => s.properties?.title).filter(Boolean));
  const faltantes = TABS.filter(t => !existentes.has(t));
  if (faltantes.length) await sheets.spreadsheets.batchUpdate({ spreadsheetId: id, requestBody: { requests: faltantes.map(title => ({ addSheet: { properties: { title } } })) } });

  const data: any[] = [
    { range: 'DOCUMENTO!A1:D1', values: [CABECERA_DOCUMENTO] },
    { range: 'PAGINAS!A1:N1', values: [CABECERA_PAGINA_RICA] },
    { range: 'DATOS_UNIFICADOS!A1:Z1', values: [CABECERA_UNIFICADA] },
    { range: 'ND_TEXT_PARTES!A1:I1', values: [CABECERA_TEXT_PARTES] },
    { range: 'ND_DOCUMENTOS!A1:J1', values: [CABECERA_DOCUMENTOS] },
    { range: 'ND_PAGINAS!A1:I1', values: [CABECERA_PAGINAS] },
    { range: 'ND_HALLAZGOS!A1:Y1', values: [CABECERA_HALLAZGOS] },
    ...Object.values(KIND_TO_TAB).filter((v, i, a) => a.indexOf(v) === i).map(tab => ({ range: `${tab}!A1:S1`, values: [CABECERA_CATEGORIA] }))
  ];
  await sheetsWrite(() => sheets.spreadsheets.values.batchUpdate({ spreadsheetId: id, requestBody: { valueInputOption: 'RAW', data } }));
  hojasPreparadas = true;
  console.log(`   📊 ND -> Google Sheets: ${id}`);
  console.log(`   📚 Salida ND preparada: ${TABS.length} pestañas documentales + control ND.`);
  if (FORZAR_REEXTRACCION) console.log('   🔁 ND_REANALIZAR=1: se ignoran checkpoints/estados de página; las claves siguen evitando duplicados.');
}

export async function paginaYaProcesadaNDSheets(documentoDriveId: string, neuronId: string, pagina: number): Promise<boolean> {
  await prepararSheetsND();
  if (FORZAR_REEXTRACCION) return false;
  const filas = await obtenerFilas(HOJA_PAGINAS);
  const clave = clavePagina(documentoDriveId, neuronId, pagina);
  for (let i = filas.length - 1; i >= 1; i--) if (filas[i]?.[0] === clave && filas[i]?.[6] === 'procesada') return true;
  return false;
}

export async function registrarDocumentoNDSheets(a: { documentoDriveId: string; nombre: string; neuronId: string; carpetaDrive?: string; paginasTotal?: number }): Promise<void> {
  await prepararSheetsND();
  const id = getNDSpreadsheetId();
  await sheetsWrite(() => sheets.spreadsheets.values.append({ spreadsheetId: id, range: `${HOJA_DOCUMENTOS}!A:J`, valueInputOption: 'RAW', insertDataOption: 'INSERT_ROWS', requestBody: { values: [['INICIO', valorSeguro(a.documentoDriveId), valorSeguro(a.nombre), valorSeguro(a.neuronId), valorSeguro(a.carpetaDrive), 'en_proceso', numero(a.paginasTotal), '', '', ahora()]] } }));
  await sheetsWrite(() => sheets.spreadsheets.values.update({ spreadsheetId: id, range: 'DOCUMENTO!A2:D2', valueInputOption: 'RAW', requestBody: { values: [[valorSeguro(a.documentoDriveId), valorSeguro(a.nombre), 'en_proceso', '0']] } }));
}

export async function registrarEstadoDocumentoNDSheets(a: { documentoDriveId: string; nombre: string; neuronId: string; carpetaDrive?: string; estado: string; paginasTotal?: number; paginasProcesadas?: number; hallazgosTotal?: number }): Promise<void> {
  await prepararSheetsND();
  await sheetsWrite(() => sheets.spreadsheets.values.append({ spreadsheetId: getNDSpreadsheetId(), range: `${HOJA_DOCUMENTOS}!A:J`, valueInputOption: 'RAW', insertDataOption: 'INSERT_ROWS', requestBody: { values: [['ESTADO', valorSeguro(a.documentoDriveId), valorSeguro(a.nombre), valorSeguro(a.neuronId), valorSeguro(a.carpetaDrive), valorSeguro(a.estado), numero(a.paginasTotal), numero(a.paginasProcesadas), numero(a.hallazgosTotal), ahora()]] } }));
}

function filasHallazgo(h: HallazgoND, documentoDriveId: string, documento: string, neuronId: string, carpetaDrive: string, pagina: number, clave: string): string[] {
  const evidencia = { ...(h.evidencia || {}), documento, pagina };
  const metadatos = { ...(h.metadatos || {}), documentoDriveId, carpetaDrive, persistencia: 'google_sheets' };
  return [valorSeguro(clave), valorSeguro(documentoDriveId), valorSeguro(documento), valorSeguro(neuronId), valorSeguro(carpetaDrive), numero(pagina), valorSeguro(h.tipo), valorSeguro(h.campo), valorSeguro(h.entidadCandidata), valorSeguro(h.entidadPrincipal), valorSeguro(h.aspecto), valorSeguro(h.datoDocumental), valorSeguro(h.textoOriginal), valorSeguro(h.textoNormalizado), numero(h.valor), valorSeguro(h.valorTexto), valorSeguro(h.unidad), valorSeguro(h.simbolo), valorSeguro(h.relacionEntidad), valorSeguro(h.contexto), valorSeguro(h.idioma), numero(h.confianza), json(evidencia), json(metadatos), ahora()];
}

function unifiedRow(h: HallazgoND, documento: string): string[] {
  const m: any = h.metadatos || {};
  const kind = String(h.tipo || '');
  const categoria = kind === 'PROPIEDAD' ? 'Propiedad' : kind === 'MATERIAL' ? 'Material' : kind === 'COMPONENTE' ? 'Componente' : kind === 'METODO' ? 'Método' : kind === 'INSTRUMENTO' ? 'Instrumento' : kind === 'NORMA' ? 'Norma' : kind === 'CONDICION' ? 'Condición' : kind === 'RELACION' ? 'Relación' : kind === 'FORMULA' ? 'Fórmula' : kind === 'DEFINICION' ? 'Definición' : kind === 'APLICACION' ? 'Aplicación' : kind === 'COMPORTAMIENTO' ? 'Comportamiento' : kind || '';
  const text = str(h.textoOriginal || h.datoDocumental || h.textoNormalizado).trim();
  const name = str(h.entidadPrincipal || h.entidadCandidata || h.campo || text).trim();
  return [name, str(m.english || m.nombre_ingles), str(m.synonyms || m.sinonimos) || '-', categoria, str(h.aspecto || m.property_type || m.tipo_propiedad) || '-', str(m.family || m.familia) || '-', str(m.subfamily || m.subfamilia) || '-', str(m.material) || '-', str(m.component || m.componente) || '-', str(h.unidad), str(h.simbolo), str(h.valor ?? h.valorTexto ?? ''), str(m.min ?? m.valor_min ?? ''), str(m.max ?? m.valor_max ?? ''), str(m.condition || m.condicion), str(m.method || m.metodo), str(m.instrument || m.instrumento), str(m.standard || m.norma), str(m.formula || m.equation || m.ecuacion) || (kind === 'FORMULA' ? text : ''), str(m.relation || m.relacion), str(h.confianza), str(m.origin || m.origen) || 'ND', documento, str(h.evidencia?.pagina || ''), str(h.evidencia?.seccion || ''), json({ field: h.campo, context: h.contexto, evidence: h.evidencia, metadata: m })];
}

async function appendRowsSafe(range: string, rowsIn: any[][], origin: string, docId: string, docName: string, page: number | string, stablePrefix: string): Promise<void> {
  if (!rowsIn.length) return;
  const safe = rowsIn.map(row => [...row]);
  const parts: any[][] = [];
  for (let r = 0; r < safe.length; r++) for (let c = 0; c < safe[r].length; c++) {
    const value = safe[r][c];
    if (typeof value !== 'string' || value.length <= CELL_LIMIT) continue;
    const ps = chunks(value); const key = `${stablePrefix}:r${r}:c${c}`;
    for (let n = 0; n < ps.length; n++) parts.push([docId, docName, origin, key, range.split('!')[0], page, n + 1, ps.length, ps[n]]);
    safe[r][c] = `[ND_TEXT_PARTES key=${key} partes=${ps.length}]`;
  }
  if (parts.length) await sheetsWrite(() => sheets.spreadsheets.values.append({ spreadsheetId: getNDSpreadsheetId(), range: 'ND_TEXT_PARTES!A1', valueInputOption: 'RAW', insertDataOption: 'INSERT_ROWS', requestBody: { values: parts } }));
  await sheetsWrite(() => sheets.spreadsheets.values.append({ spreadsheetId: getNDSpreadsheetId(), range, valueInputOption: 'RAW', insertDataOption: 'INSERT_ROWS', requestBody: { values: safe } }));
}

export async function guardarPaginaNDSheets(
  hallazgos: HallazgoND[], documentoDriveId: string, documento: string, neuronId: string,
  carpetaDrive: string, pagina: number, paginaDatos?: any
): Promise<number> {
  await prepararSheetsND();
  if (await paginaYaProcesadaNDSheets(documentoDriveId, neuronId, pagina)) return 0;

  const filas = await obtenerFilas(HOJA_HALLAZGOS);
  const existentes = new Set<string>();
  for (let i = 1; i < filas.length; i++) if (filas[i]?.[0]) existentes.add(filas[i][0]);

  const nuevas: string[][] = [];
  for (const h of hallazgos) {
    const clave = claveHallazgo(h, documentoDriveId, pagina);
    if (existentes.has(clave)) continue;
    nuevas.push(filasHallazgo(h, documentoDriveId, documento, neuronId, carpetaDrive, pagina, clave));
    existentes.add(clave);
  }

  if (nuevas.length) {
    await appendRowsSafe('ND_HALLAZGOS!A1', nuevas, 'ND_HALLAZGOS', documentoDriveId, documento, pagina, `${documentoDriveId}:hallazgos:${pagina}`);
    const nuevasClaves = new Set(nuevas.map(row => row[0]));
    const categoriaRows = new Map<string, string[][]>();
    for (const h of hallazgos) {
      const tab = KIND_TO_TAB[String(h.tipo || '').toUpperCase()];
      const clave = claveHallazgo(h, documentoDriveId, pagina);
      if (!tab || !nuevasClaves.has(clave)) continue;
      const list = categoriaRows.get(tab) || [];
      list.push([documentoDriveId, documento, h.tipo, h.campo || '', h.entidadCandidata || '', h.entidadPrincipal || '', h.aspecto || '', h.datoDocumental || '', h.textoOriginal || '', h.textoNormalizado || '', numero(h.valor), h.valorTexto || '', h.unidad || '', h.simbolo || '', h.contexto || '', numero(pagina), h.evidencia?.seccion || '', numero(h.confianza), json(h.evidencia), json(h.metadatos || {})]);
      categoriaRows.set(tab, list);
    }
    for (const [tab, rows] of categoriaRows) await appendRowsSafe(`${tab}!A1`, rows, tab, documentoDriveId, documento, pagina, `${documentoDriveId}:${tab}:${pagina}`);
    const unified = hallazgos.filter(h => nuevasClaves.has(claveHallazgo(h, documentoDriveId, pagina))).map(h => unifiedRow(h, documento));
    await appendRowsSafe('DATOS_UNIFICADOS!A1', unified, 'DATOS_UNIFICADOS', documentoDriveId, documento, pagina, `${documentoDriveId}:unified:${pagina}`);
  }

  const p = paginaDatos || {};
  const texto = str(p.text ?? p.texto ?? '');
  const pageParts = chunks(texto);
  const pageRows = pageParts.map((part, index) => [
    documentoDriveId, documento, numero(p.page ?? p.pagina ?? pagina), index + 1, pageParts.length,
    part, json(p.bbox || []), json(p.words || []), json(p.blocks || []), json(p.headings || []),
    json(p.tables || []), json(p.links || []), json(p.images || []), p.ocr_used || p.ocr ? 'SI' : 'NO'
  ]);
  if (pageRows.length) await appendRowsSafe('PAGINAS!A1', pageRows, 'PAGINAS', documentoDriveId, documento, pagina, `${documentoDriveId}:paginas:${pagina}`);

  await sheetsWrite(() => sheets.spreadsheets.values.append({ spreadsheetId: getNDSpreadsheetId(), range: `${HOJA_PAGINAS}!A:I`, valueInputOption: 'RAW', insertDataOption: 'INSERT_ROWS', requestBody: { values: [[valorSeguro(clavePagina(documentoDriveId, neuronId, pagina)), valorSeguro(documentoDriveId), valorSeguro(documento), valorSeguro(neuronId), valorSeguro(carpetaDrive), numero(pagina), 'procesada', numero(nuevas.length), ahora()]] } }));
  return nuevas.length;
}

export async function finalizarDocumentoNDSheets(a: { documentoDriveId: string; nombre: string; neuronId: string; carpetaDrive?: string; paginasTotal: number; paginasProcesadas: number; hallazgosTotal: number }): Promise<void> {
  await registrarEstadoDocumentoNDSheets({ ...a, estado: 'completo' });
  await sheetsWrite(() => sheets.spreadsheets.values.update({ spreadsheetId: getNDSpreadsheetId(), range: 'DOCUMENTO!A2:D2', valueInputOption: 'RAW', requestBody: { values: [[valorSeguro(a.documentoDriveId), valorSeguro(a.nombre), 'completo', numero(a.hallazgosTotal)]] } }));
}
