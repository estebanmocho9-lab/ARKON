// ============================================================
// Persistencia incremental de ND.
//
// Regla: ND extrae una página -> guarda inmediatamente -> libera
// el lote. No conserva el documento completo ni todos los
// hallazgos en RAM. Las tablas nd_* son proyecciones del mismo
// hallazgo raw; no vuelven a extraer ni inventan información.
// ============================================================

import { turso } from './tursoClient';
import { prepararEsquemaND, TABLAS_PROYECCION } from './esquemaND';
import { HallazgoND } from '../extraction-neurons/memoria-nd/tipos';

let preparada = false;

export async function prepararTablaND(): Promise<void> {
  if (preparada) return;
  await prepararEsquemaND();
  preparada = true;
}

function textoSeguro(valor: unknown): string | null {
  return typeof valor === 'string' ? valor : null;
}

export function claveUnica(h: HallazgoND): string {
  const e = h.evidencia;
  const driveId = textoSeguro(h.metadatos?.documentoDriveId) || e.documento;
  return [
    h.neuronId,
    driveId,
    e.pagina,
    h.tipo,
    h.campo || '',
    e.posicionInicio ?? '',
    e.posicionFin ?? '',
    h.textoNormalizado,
  ].join('¦');
}

function tablaProyeccion(tipo: HallazgoND['tipo']): string | null {
  return TABLAS_PROYECCION[tipo] || null;
}

function argsBase(h: HallazgoND, clave: string) {
  const e = h.evidencia;
  return [
    clave,
    textoSeguro(h.metadatos?.documentoDriveId) || e.documento,
    h.neuronId,
    e.pagina ?? null,
    h.campo || null,
    h.entidadCandidata || null,
    h.textoOriginal,
    h.valor ?? null,
    h.valorTexto || null,
    h.unidad || null,
    h.simbolo || null,
    h.contexto,
    JSON.stringify(h.evidencia),
  ];
}

/** Guarda un documento de forma incremental, sin cargar hallazgos en RAM. */
export async function registrarDocumentoND(args: {
  documentoDriveId: string;
  nombre: string;
  neuronId: string;
  carpetaDrive?: string;
  paginasTotal?: number;
}): Promise<void> {
  await prepararTablaND();
  await turso.execute({
    sql: `INSERT INTO nd_documentos
      (documento_drive_id,nombre,neuron_id,carpeta_drive,estado,paginas_total)
      VALUES (?,?,?,?, 'en_proceso',?)
      ON CONFLICT(documento_drive_id) DO UPDATE SET
        nombre=excluded.nombre,
        neuron_id=excluded.neuron_id,
        carpeta_drive=excluded.carpeta_drive,
        paginas_total=COALESCE(excluded.paginas_total,nd_documentos.paginas_total),
        estado='en_proceso',
        terminado_en=NULL`,
    args: [args.documentoDriveId, args.nombre, args.neuronId, args.carpetaDrive || null, args.paginasTotal ?? null],
  });
}

/**
 * Persiste una página completa en una sola transacción de Turso.
 * El lote es pequeño (solo la página) y se descarta al terminar.
 */
export async function guardarPaginaND(
  hallazgos: HallazgoND[],
  documentoDriveId: string,
  pagina: number,
): Promise<number> {
  await prepararTablaND();
  if (!hallazgos.length) {
    await turso.execute({
      sql: `INSERT INTO nd_paginas(documento_drive_id,pagina,estado,hallazgos)
            VALUES(?,?,'procesada',0)
            ON CONFLICT(documento_drive_id,pagina) DO UPDATE SET
              estado='procesada', hallazgos=0, procesada_en=CURRENT_TIMESTAMP`,
      args: [documentoDriveId, pagina],
    });
    return 0;
  }

  const statements: Array<{ sql: string; args: any[] }> = [];
  const claves: string[] = [];

  for (const h of hallazgos) {
    const e = h.evidencia;
    const clave = claveUnica(h);
    claves.push(clave);
    const args = argsBase(h, clave);

    statements.push({
      sql: `INSERT OR IGNORE INTO nd_hallazgos_raw
        (clave_unica,neuron_id,tipo,campo,texto_original,texto_normalizado,
         entidad_candidata,valor,valor_texto,unidad,simbolo,contexto,idioma,
         confianza,evidencia_json,metadatos_json,documento_drive_id,pagina,
         posicion_inicio,posicion_fin,seccion)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        clave,h.neuronId,h.tipo,h.campo || null,h.textoOriginal,h.textoNormalizado,
        h.entidadCandidata || null,h.valor ?? null,h.valorTexto || null,h.unidad || null,h.simbolo || null,
        h.contexto,h.idioma,h.confianza,JSON.stringify(h.evidencia),h.metadatos ? JSON.stringify(h.metadatos) : null,
        e.documento ? (textoSeguro(h.metadatos?.documentoDriveId) || e.documento) : documentoDriveId,
        e.pagina ?? pagina,e.posicionInicio ?? null,e.posicionFin ?? null,e.seccion || null,
      ],
    });

    const tabla = tablaProyeccion(h.tipo);
    if (tabla) {
      statements.push({
        sql: `INSERT OR IGNORE INTO ${tabla}
          (clave_unica,documento_drive_id,neuron_id,pagina,campo,entidad_candidata,
           texto,valor,valor_texto,unidad,simbolo,contexto,evidencia_json)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        args: args,
      });
    }
  }

  statements.push({
    sql: `INSERT INTO nd_paginas(documento_drive_id,pagina,estado,hallazgos)
          VALUES(?,?,'procesada',?)
          ON CONFLICT(documento_drive_id,pagina) DO UPDATE SET
            estado='procesada',hallazgos=excluded.hallazgos,procesada_en=CURRENT_TIMESTAMP`,
    args: [documentoDriveId, pagina, hallazgos.length],
  });

  await turso.batch(statements, 'write');
  return hallazgos.length;
}

export async function finalizarDocumentoND(documentoDriveId: string): Promise<void> {
  await prepararTablaND();
  await turso.execute({
    sql: `UPDATE nd_documentos SET
      estado='completo',
      paginas_procesadas=(SELECT COUNT(*) FROM nd_paginas WHERE documento_drive_id=? AND estado='procesada'),
      hallazgos_total=(SELECT COUNT(*) FROM nd_hallazgos_raw WHERE documento_drive_id=?),
      terminado_en=CURRENT_TIMESTAMP
      WHERE documento_drive_id=?`,
    args: [documentoDriveId, documentoDriveId, documentoDriveId],
  });
}

/** Compatibilidad: permite a código existente guardar un lote, pero en batch. */
export async function guardarHallazgosND(hallazgos: HallazgoND[]): Promise<void> {
  if (!hallazgos.length) return;
  const documentoDriveId = textoSeguro(hallazgos[0].metadatos?.documentoDriveId) || hallazgos[0].evidencia.documento;
  const porPagina = new Map<number, HallazgoND[]>();
  for (const h of hallazgos) {
    const p = h.evidencia.pagina;
    const lista = porPagina.get(p) || [];
    lista.push(h);
    porPagina.set(p, lista);
  }
  for (const [pagina, lista] of porPagina) await guardarPaginaND(lista, documentoDriveId, pagina);
}
