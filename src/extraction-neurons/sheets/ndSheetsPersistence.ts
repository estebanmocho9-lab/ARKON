// ============================================================
// ARKON — Persistencia exclusiva ND -> Google Sheets
// ============================================================

import { sheets, getNDSpreadsheetId, prepararConexionSheetsND } from './ndSheetsConnection';
import { HallazgoND } from '../memoria-nd/tipos';

const HOJA_DOCUMENTOS = 'ND_DOCUMENTOS';
const HOJA_PAGINAS = 'ND_PAGINAS';
const HOJA_HALLAZGOS = 'ND_HALLAZGOS';

const CABECERA_DOCUMENTOS = ['evento','documento_drive_id','documento','neuron_id','carpeta_drive','estado','paginas_total','paginas_procesadas','hallazgos_total','timestamp'];
const CABECERA_PAGINAS = ['clave_pagina','documento_drive_id','documento','neuron_id','carpeta_drive','pagina','estado','hallazgos','timestamp'];
const CABECERA_HALLAZGOS = ['clave_unica','documento_drive_id','documento','neuron_id','carpeta_drive','pagina','tipo','campo','entidad_candidata','entidad_principal','aspecto','dato_documental','texto_original','texto_normalizado','valor','valor_texto','unidad','simbolo','relacion_entidad','contexto','idioma','confianza','evidencia_json','metadatos_json','timestamp'];

let hojasPreparadas = false;
const ahora = () => new Date().toISOString();
const str = (v: unknown) => v == null ? '' : String(v);
const numero = (v: unknown) => v == null || v === '' ? '' : String(v);
const normalizar = (s: unknown) => str(s).replace(/\s+/g, ' ').trim().normalize('NFC');
const valorSeguro = (v: unknown) => { const s = normalizar(v); return /^[=+\-@]/.test(s) ? "'" + s : s; };

function claveHallazgo(h: HallazgoND, documentoDriveId: string, pagina: number): string {
  const e = h.evidencia || {};
  return [h.neuronId, documentoDriveId || e.documento || '', pagina, h.tipo, h.campo || '', e.posicionInicio ?? '', e.posicionFin ?? '', normalizar(h.entidadPrincipal || h.entidadCandidata || '').toLowerCase(), h.aspecto || '', h.textoNormalizado || '', h.valorTexto || '', h.unidad || ''].join('¦');
}

function clavePagina(documentoDriveId: string, neuronId: string, pagina: number): string {
  return `${documentoDriveId}¦${neuronId}¦${pagina}`;
}

async function obtenerFilas(nombreHoja: string): Promise<string[][]> {
  const response = await sheets.spreadsheets.values.get({ spreadsheetId: getNDSpreadsheetId(), range: `${nombreHoja}!A:AZ` });
  return (response?.data?.values || []) as string[][];
}

async function asegurarHoja(nombre: string, headers: string[]): Promise<void> {
  const id = getNDSpreadsheetId();
  try {
    await sheets.spreadsheets.values.get({ spreadsheetId: id, range: `${nombre}!A1` });
    return;
  } catch {}
  await sheets.spreadsheets.batchUpdate({ spreadsheetId: id, requestBody: { requests: [{ addSheet: { properties: { title: nombre } } }] } });
  await sheets.spreadsheets.values.update({ spreadsheetId: id, range: `${nombre}!A1`, valueInputOption: 'RAW', requestBody: { values: [headers] } });
}

export async function prepararSheetsND(): Promise<void> {
  if (hojasPreparadas) return;
  await prepararConexionSheetsND();
  await asegurarHoja(HOJA_DOCUMENTOS, CABECERA_DOCUMENTOS);
  await asegurarHoja(HOJA_PAGINAS, CABECERA_PAGINAS);
  await asegurarHoja(HOJA_HALLAZGOS, CABECERA_HALLAZGOS);
  hojasPreparadas = true;
  console.log(`   📊 ND -> Google Sheets: ${getNDSpreadsheetId()}`);
}

export async function paginaYaProcesadaNDSheets(documentoDriveId: string, neuronId: string, pagina: number): Promise<boolean> {
  await prepararSheetsND();
  const filas = await obtenerFilas(HOJA_PAGINAS);
  const clave = clavePagina(documentoDriveId, neuronId, pagina);
  for (let i = filas.length - 1; i >= 1; i--) if (filas[i]?.[0] === clave && filas[i]?.[6] === 'procesada') return true;
  return false;
}

export async function registrarDocumentoNDSheets(a: {documentoDriveId:string;nombre:string;neuronId:string;carpetaDrive?:string;paginasTotal?:number}): Promise<void> {
  await prepararSheetsND();
  await sheets.spreadsheets.values.append({ spreadsheetId: getNDSpreadsheetId(), range: `${HOJA_DOCUMENTOS}!A:J`, valueInputOption:'RAW', insertDataOption:'INSERT_ROWS', requestBody:{values:[['INICIO',valorSeguro(a.documentoDriveId),valorSeguro(a.nombre),valorSeguro(a.neuronId),valorSeguro(a.carpetaDrive),'en_proceso',numero(a.paginasTotal),'','','',ahora()]]} });
}

export async function registrarEstadoDocumentoNDSheets(a: {documentoDriveId:string;nombre:string;neuronId:string;carpetaDrive?:string;estado:string;paginasTotal?:number;paginasProcesadas?:number;hallazgosTotal?:number}): Promise<void> {
  await prepararSheetsND();
  await sheets.spreadsheets.values.append({ spreadsheetId:getNDSpreadsheetId(), range:`${HOJA_DOCUMENTOS}!A:J`, valueInputOption:'RAW', insertDataOption:'INSERT_ROWS', requestBody:{values:[['ESTADO',valorSeguro(a.documentoDriveId),valorSeguro(a.nombre),valorSeguro(a.neuronId),valorSeguro(a.carpetaDrive),valorSeguro(a.estado),numero(a.paginasTotal),numero(a.paginasProcesadas),numero(a.hallazgosTotal),ahora()]]} });
}

export async function guardarPaginaNDSheets(hallazgos: HallazgoND[], documentoDriveId:string, documento:string, neuronId:string, carpetaDrive:string, pagina:number): Promise<number> {
  await prepararSheetsND();
  if (await paginaYaProcesadaNDSheets(documentoDriveId, neuronId, pagina)) return 0;
  const filas = await obtenerFilas(HOJA_HALLAZGOS);
  const existentes = new Set<string>();
  for (let i=1;i<filas.length;i++) if (filas[i]?.[0]) existentes.add(filas[i][0]);
  const nuevas:string[][]=[];
  for (const h of hallazgos) {
    const clave=claveHallazgo(h,documentoDriveId,pagina);
    if (existentes.has(clave)) continue;
    const evidencia={...(h.evidencia||{}),documento,pagina};
    const metadatos={...(h.metadatos||{}),documentoDriveId,carpetaDrive,persistencia:'google_sheets'};
    nuevas.push([valorSeguro(clave),valorSeguro(documentoDriveId),valorSeguro(documento),valorSeguro(neuronId),valorSeguro(carpetaDrive),numero(pagina),valorSeguro(h.tipo),valorSeguro(h.campo),valorSeguro(h.entidadCandidata),valorSeguro(h.entidadPrincipal),valorSeguro(h.aspecto),valorSeguro(h.datoDocumental),valorSeguro(h.textoOriginal),valorSeguro(h.textoNormalizado),numero(h.valor),valorSeguro(h.valorTexto),valorSeguro(h.unidad),valorSeguro(h.simbolo),valorSeguro(h.relacionEntidad),valorSeguro(h.contexto),valorSeguro(h.idioma),numero(h.confianza),JSON.stringify(evidencia),JSON.stringify(metadatos),ahora()]);
    existentes.add(clave);
  }
  if(nuevas.length) await sheets.spreadsheets.values.append({spreadsheetId:getNDSpreadsheetId(),range:`${HOJA_HALLAZGOS}!A:Y`,valueInputOption:'RAW',insertDataOption:'INSERT_ROWS',requestBody:{values:nuevas}});
  await sheets.spreadsheets.values.append({spreadsheetId:getNDSpreadsheetId(),range:`${HOJA_PAGINAS}!A:I`,valueInputOption:'RAW',insertDataOption:'INSERT_ROWS',requestBody:{values:[[valorSeguro(clavePagina(documentoDriveId,neuronId,pagina)),valorSeguro(documentoDriveId),valorSeguro(documento),valorSeguro(neuronId),valorSeguro(carpetaDrive),numero(pagina),'procesada',numero(nuevas.length),ahora()]]}});
  return nuevas.length;
}

export async function finalizarDocumentoNDSheets(a:{documentoDriveId:string;nombre:string;neuronId:string;carpetaDrive?:string;paginasTotal:number;paginasProcesadas:number;hallazgosTotal:number}):Promise<void>{await registrarEstadoDocumentoNDSheets({...a,estado:'completo'});}
