import { AIProductFamily, AINeuronProfile, TursoEvidenceCandidate } from './types';
import { getAINeuronTursoClient } from './aiTursoClient';

export interface TursoSearchResult {
  configured: boolean;
  evidence: TursoEvidenceCandidate[];
  tablesRead: string[];
  warnings: string[];
}

const MAX_TERMS = 16;
const MAX_EVIDENCE = 10;
const MAX_EXCERPT_CHARS = 1600;

function safeTerms(values: string[]): string[] {
  const unique = new Set<string>();
  for (const value of values) {
    const term = String(value ?? '').replace(/[\u0000-\u001f]/g, ' ').replace(/[%_]/g, ' ').replace(/\s+/g, ' ').trim();
    if (term.length >= 3) unique.add(term.slice(0, 100));
    if (unique.size >= MAX_TERMS) break;
  }
  return [...unique];
}

function parseObject(value: unknown): Record<string, any> | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch { return null; }
}

function text(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const result = String(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim();
  return result || null;
}

function numberOrNull(value: unknown): number | null {
  const result = Number(value);
  return value !== null && value !== undefined && Number.isFinite(result) ? result : null;
}

function likeGroup(columns: string[], terms: string[]): { sql: string; args: string[] } {
  if (!terms.length) return { sql: '1 = 1', args: [] };
  const clauses: string[] = [];
  const args: string[] = [];
  for (const term of terms) {
    for (const column of columns) {
      clauses.push(`LOWER(COALESCE(${column}, '')) LIKE ?`);
      args.push(`%${term.toLowerCase()}%`);
    }
  }
  return { sql: `(${clauses.join(' OR ')})`, args };
}

function materialTermsFor(family: AIProductFamily, materialName: string, materialId?: string | null): string[] {
  // The resolved catalog material is the primary identity. Do not widen a
  // component lookup (e.g. perlita) to every material in its host product
  // family (e.g. yeso), which would mix evidence from different substances.
  const exactName = String(materialName ?? '').trim();
  if (exactName) return safeTerms([exactName]);
  const aliases = family === 'mdf'
    ? ['MDF', 'tablero MDF', 'medium density fibreboard', 'medium density fiberboard']
    : family === 'gypsum'
      ? ['yeso', 'placa de yeso', 'gypsum board', 'plasterboard']
      : family === 'concrete' ? ['hormigón', 'bloque de hormigón', 'concrete block'] : [];
  return safeTerms(aliases.length ? aliases : [String(materialId ?? '')]);
}

function mapNDRow(row: Record<string, any>): TursoEvidenceCandidate {
  const evidence = parseObject(row.evidencia_json);
  const metadata = parseObject(row.metadatos_json);
  const excerpt = text(evidence?.fragmento ?? evidence?.excerpt ?? evidence?.texto ?? row.dato_documental ?? row.texto_original ?? row.texto_normalizado ?? row.contexto) ?? '';
  return {
    id: `nd:${text(row.id) ?? 'unknown'}`,
    table: 'nd_hallazgos_raw',
    material: text(row.entidad_principal ?? row.entidad_candidata),
    property: text(row.aspecto ?? row.campo ?? row.tipo),
    document: text(evidence?.documento ?? row.documento_drive_id ?? metadata?.documento ?? metadata?.nombre_documento),
    page: numberOrNull(evidence?.pagina ?? row.pagina),
    excerpt: excerpt.slice(0, MAX_EXCERPT_CHARS),
    rawValue: row.valor ?? text(row.valor_texto),
    unit: text(row.unidad),
    condition: text(row.contexto ?? metadata?.condicion_ensayo ?? metadata?.estado_material),
    method: text(metadata?.metodo_ensayo ?? metadata?.metodo ?? evidence?.tipoDocumento),
    sourceType: text(evidence?.tipoDocumento ?? metadata?.tipo_documento),
    confidence: numberOrNull(row.confianza),
  };
}

/**
 * Recupera candidatos solamente de tablas de extracción conocidas. No escribe,
 * no ejecuta SQL generado por el modelo y nunca devuelve filas sin procedencia.
 * La consulta usa exclusivamente la cuenta ARKON_AI_TURSO_* y tablas ND
 * definidas en src/turso/esquemaND.ts; no adivina el esquema legado.
 */
export async function searchTursoEvidence(
  family: AIProductFamily,
  productName: string,
  profile: AINeuronProfile,
  materialId?: string | null,
  stateName?: string | null,
): Promise<TursoSearchResult> {
  const turso = getAINeuronTursoClient();
  if (!turso) {
    return { configured: false, evidence: [], tablesRead: [], warnings: ['La cuenta Turso dedicada a las neuronas IA no está configurada en el servidor ARKON.'] };
  }
  const materialGroup = likeGroup(
    ['entidad_principal', 'entidad_candidata', 'dato_documental', 'texto_original', 'texto_normalizado', 'contexto'],
    materialTermsFor(family, productName, materialId),
  );
  const propertyTerms = safeTerms([profile.corePropertyName, profile.attribute, ...profile.evidenceTerms, ...profile.cables.flatMap(cable => cable.searchTerms)]);
  const stateTerms = safeTerms([stateName ?? '']);
  const stateGroup = stateTerms.length ? likeGroup(['contexto', 'dato_documental', 'texto_original', 'texto_normalizado'], stateTerms) : { sql: '1 = 1', args: [] };
  const propertyGroup = likeGroup(
    ['aspecto', 'campo', 'tipo', 'dato_documental', 'texto_original', 'texto_normalizado', 'contexto'],
    propertyTerms,
  );

  const evidence: TursoEvidenceCandidate[] = [];
  const tablesRead: string[] = [];
  const warnings: string[] = [];

  try {
    const result = await turso.execute({
      sql: `SELECT id, tipo, campo, texto_original, texto_normalizado, entidad_candidata, entidad_principal,
                   aspecto, dato_documental, valor, valor_texto, unidad, contexto, confianza,
                   evidencia_json, metadatos_json, documento_drive_id, pagina, seccion
            FROM nd_hallazgos_raw
            WHERE ${materialGroup.sql} AND ${propertyGroup.sql} AND ${stateGroup.sql}
            ORDER BY confianza DESC, pagina ASC LIMIT ?`,
      args: [...materialGroup.args, ...propertyGroup.args, ...stateGroup.args, MAX_EVIDENCE],
    });
    tablesRead.push('nd_hallazgos_raw');
    evidence.push(...result.rows.map((r: any) => mapNDRow(r as Record<string, any>)));
  } catch {
    warnings.push('No se pudo consultar nd_hallazgos_raw; puede no existir o tener otra versión de esquema.');
  }

  try {
    const materialTerms = materialTermsFor(family, productName, materialId);
    const materialMatch = likeGroup(['e.entidad', 'd.dato_documental'], materialTerms);
    const propertyMatch = likeGroup(['d.aspecto', 'd.dato_documental'], propertyTerms);
    const dataStateMatch = stateTerms.length ? likeGroup(['d.dato_documental', 'd.evidencia_json'], stateTerms) : { sql: '1 = 1', args: [] };
    const result = await turso.execute({
      sql: `SELECT d.id, d.documento_drive_id, d.pagina, d.aspecto, d.dato_documental,
                   d.evidencia_json, e.entidad AS material
            FROM nd_datos_entidad d
            LEFT JOIN nd_entidades_documentales e ON e.clave_entidad = d.clave_entidad
            WHERE ${materialMatch.sql} AND ${propertyMatch.sql} AND ${dataStateMatch.sql}
            ORDER BY d.pagina ASC LIMIT ?`,
      args: [...materialMatch.args, ...propertyMatch.args, ...dataStateMatch.args, MAX_EVIDENCE],
    });
    tablesRead.push('nd_datos_entidad');
    for (const row of result.rows as any[]) {
      const ev = parseObject(row.evidencia_json);
      evidence.push({
        id: `nd-data:${text(row.id) ?? 'unknown'}`,
        table: 'nd_datos_entidad',
        material: text(row.material),
        property: text(row.aspecto),
        document: text(row.documento_drive_id) ?? text(ev?.documento),
        page: numberOrNull(row.pagina ?? ev?.pagina),
        excerpt: (text(row.dato_documental) ?? '').slice(0, MAX_EXCERPT_CHARS),
        rawValue: numberOrNull(ev?.valor) ?? text(ev?.valor_texto),
        unit: text(ev?.unidad),
        condition: text(ev?.contexto),
        method: text(ev?.metodo_ensayo ?? ev?.metodo),
        sourceType: text(ev?.tipoDocumento),
        confidence: numberOrNull(ev?.confianza),
      });
    }
  } catch {
    warnings.push('No se pudo consultar nd_datos_entidad; confirma que el esquema ND esté desplegado en la cuenta Turso IA.');
  }

  const deduplicated = new Map<string, TursoEvidenceCandidate>();
  for (const item of evidence) {
    if (!item.document || !item.excerpt) continue;
    if (!deduplicated.has(item.id)) deduplicated.set(item.id, item);
  }
  return { configured: true, evidence: [...deduplicated.values()].slice(0, MAX_EVIDENCE), tablesRead, warnings };
}
