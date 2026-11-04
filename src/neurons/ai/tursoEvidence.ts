import { AIProductFamily, AINeuronProfile, TursoEvidenceCandidate } from './types';

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

function materialTermsFor(family: AIProductFamily, productName: string): string[] {
  const common = family === 'mdf'
    ? ['MDF', 'tablero MDF', 'mueble de MDF', 'tablero de fibras de densidad media', 'medium density fibreboard', 'medium density fiberboard']
    : family === 'gypsum'
      ? ['yeso', 'placa de yeso', 'placa antihumedad de yeso', 'gypsum board', 'moisture resistant gypsum board', 'plasterboard']
      : ['hormigón', 'hormigon', 'bloque de hormigón', 'bloque de concreto', 'concrete block', 'concrete masonry unit'];
  return safeTerms([productName, ...common]);
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

function mapLegacyRow(row: Record<string, any>): TursoEvidenceCandidate {
  const doc = text(row.documento) ?? text(row.drive_file_id) ?? 'documento-sin-nombre';
  const page = numberOrNull(row.pagina);
  return {
    id: `prop:${text(row.drive_file_id) ?? doc}:${page ?? 's/p'}:${text(row.nombre_propiedad) ?? 'propiedad'}:${text(row.valor_encontrado) ?? 's/v'}`,
    table: 'propiedades_extraidas',
    material: text(row.material ?? row.familia_material ?? row.subfamilia_material),
    property: text(row.nombre_propiedad ?? row.nombre_ingles),
    document: doc,
    page,
    excerpt: (text(row.fragmento_texto ?? row.observaciones ?? row.valor_encontrado) ?? '').slice(0, MAX_EXCERPT_CHARS),
    rawValue: text(row.valor_encontrado),
    unit: text(row.unidad),
    condition: text(row.condicion_ensayo),
    method: text(row.metodo_ensayo ?? row.norma),
    sourceType: text(row.origen_dato),
    confidence: numberOrNull(row.nivel_confianza),
  };
}

/**
 * Recupera candidatos solamente de tablas de extracción conocidas. No escribe,
 * no ejecuta SQL generado por el modelo y nunca devuelve filas sin procedencia.
 * La consulta ND usa el esquema definido en src/turso/esquemaND.ts; también
 * intenta la tabla legada de propiedades extraídas si existe en la DB real.
 */
export async function searchTursoEvidence(
  family: AIProductFamily,
  productName: string,
  profile: AINeuronProfile,
): Promise<TursoSearchResult> {
  if (!process.env.TURSO_DATABASE_URL?.trim() || !process.env.TURSO_AUTH_TOKEN?.trim()) {
    return { configured: false, evidence: [], tablesRead: [], warnings: ['Turso no está configurado en el servidor ARKON.'] };
  }

  const { turso } = await import('../../turso/tursoClient');
  const materialGroup = likeGroup(
    ['entidad_principal', 'entidad_candidata', 'dato_documental', 'texto_original', 'texto_normalizado', 'contexto'],
    materialTermsFor(family, productName),
  );
  const propertyTerms = safeTerms([...profile.evidenceTerms, ...profile.cables.flatMap(c => c.searchTerms)]);
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
            WHERE ${materialGroup.sql} AND ${propertyGroup.sql}
            ORDER BY confianza DESC, pagina ASC LIMIT ?`,
      args: [...materialGroup.args, ...propertyGroup.args, MAX_EVIDENCE],
    });
    tablesRead.push('nd_hallazgos_raw');
    evidence.push(...result.rows.map((r: any) => mapNDRow(r as Record<string, any>)));
  } catch {
    warnings.push('No se pudo consultar nd_hallazgos_raw; puede no existir o tener otra versión de esquema.');
  }

  try {
    const legacyMaterial = likeGroup(
      ['material', 'familia_material', 'subfamilia_material', 'componente', 'fragmento_texto'],
      materialTermsFor(family, productName),
    );
    const legacyProperty = likeGroup(
      ['nombre_propiedad', 'nombre_ingles', 'sinonimos', 'fragmento_texto', 'observaciones'],
      propertyTerms,
    );
    const result = await turso.execute({
      sql: `SELECT documento, drive_file_id, pagina, capitulo, nombre_propiedad, nombre_ingles,
                   familia_material, subfamilia_material, material, componente, unidad,
                   valor_encontrado, condicion_ensayo, metodo_ensayo, norma, nivel_confianza,
                   origen_dato, observaciones, fragmento_texto
            FROM propiedades_extraidas
            WHERE ${legacyMaterial.sql} AND ${legacyProperty.sql}
            LIMIT ?`,
      args: [...legacyMaterial.args, ...legacyProperty.args, MAX_EVIDENCE],
    });
    tablesRead.push('propiedades_extraidas');
    evidence.push(...result.rows.map((r: any) => mapLegacyRow(r as Record<string, any>)));
  } catch {
    warnings.push('No se pudo consultar propiedades_extraidas; puede no existir o tener otra versión de esquema.');
  }

  const deduplicated = new Map<string, TursoEvidenceCandidate>();
  for (const item of evidence) {
    if (!item.document || !item.excerpt) continue;
    if (!deduplicated.has(item.id)) deduplicated.set(item.id, item);
  }
  return { configured: true, evidence: [...deduplicated.values()].slice(0, MAX_EVIDENCE), tablesRead, warnings };
}
