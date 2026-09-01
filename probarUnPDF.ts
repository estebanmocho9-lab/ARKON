// ============================================================
// probarUnPDF.ts
// Prueba ND sobre UN SOLO PDF.
// Procesa página por página y guarda inmediatamente en Turso.
// Nunca acumula todos los hallazgos en RAM ni imprime fragmentos
// masivamente en la terminal.
// ============================================================

import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

function obtenerCarpetaMadreConfigurada(): string | undefined {
  const desdeEntorno = process.env.CARPETA_MADRE_DRIVE_ID?.trim();
  if (desdeEntorno) return desdeEntorno;
  try {
    const contenido = fs.readFileSync('.env', 'utf8');
    const linea = contenido.split(/\r?\n/).find(l => /^CARPETA_MADRE_DRIVE_ID\s*=/.test(l));
    if (!linea) return undefined;
    return linea.slice(linea.indexOf('=') + 1).trim().replace(/^['"]|['"]$/g, '') || undefined;
  } catch { return undefined; }
}

import { resolverSubcarpetaPorNombre, listarPDFs, descargarArchivo, extraerIdCarpeta } from './src/extraction-neurons/drive/driveReader';
import { procesarPaginasIncremental } from './src/extraction-neurons/pdf/pdfParser';
import { extraerNDCompleto } from './src/extraction-neurons/base/extractorNDCompleto';
import { HallazgoND } from './src/extraction-neurons/memoria-nd/tipos';
import {
  prepararTablaND,
  registrarDocumentoND,
  guardarPaginaND,
  finalizarDocumentoND,
} from './src/turso/guardarHallazgosND';
import { turso } from './src/turso/tursoClient';

const TIPOS: HallazgoND['tipo'][] = [
  'DEFINICION','MATERIAL','COMPONENTE','PROPIEDAD','ATRIBUTO','MAGNITUD','RELACION',
  'CONDICION','METODO','INSTRUMENTO','APLICACION','COMPORTAMIENTO','NORMA','FORMULA','EVIDENCIA','DESCONOCIDO',
];

async function main() {
  const numeroCarpeta = process.argv[2] || '01';
  const filtroNombre = process.argv[3]?.toLowerCase();
  const configurada = obtenerCarpetaMadreConfigurada();
  if (!configurada) throw new Error('Falta CARPETA_MADRE_DRIVE_ID.');

  await prepararTablaND();
  const carpetaId = await resolverSubcarpetaPorNombre(extraerIdCarpeta(configurada), numeroCarpeta);
  const archivos = await listarPDFs(carpetaId);
  const candidatos = filtroNombre ? archivos.filter(a => a.nombre.toLowerCase().includes(filtroNombre)) : archivos;
  const elegido = candidatos[0];
  if (!elegido) {
    console.error('❌ No encontré ningún PDF que coincida.');
    console.log(`   PDFs disponibles: ${archivos.length}`);
    return;
  }

  // Usa el ID real de la ND para que el piloto y la corrida productiva
  // compartan la misma identidad y la clave de idempotencia.
  const neuronId = `ND-${numeroCarpeta.padStart(2, '0')}`;
  console.log(`\n🧠 ND PILOTO: "${elegido.nombre}"`);
  console.log(`   Drive ID: ${elegido.id}`);
  console.log('   Persistencia: Turso por página');

  const buffer = await descargarArchivo(elegido.id);
  await registrarDocumentoND({ documentoDriveId: elegido.id, nombre: elegido.nombre, neuronId, carpetaDrive: numeroCarpeta });

  const conteos: Record<string, number> = Object.fromEntries(TIPOS.map(t => [t, 0]));
  const ejemplos: Partial<Record<HallazgoND['tipo'], string[]>> = {};
  let paginas = 0;
  let guardados = 0;

  await procesarPaginasIncremental(buffer, async ({ pagina, texto }, total) => {
    paginas = total;
    if (!texto || texto.trim().length < 20) {
      await guardarPaginaND([], elegido.id, pagina);
      console.log(`   📄 ${pagina}/${total} → sin texto útil`);
      return;
    }

    const hallazgos = extraerNDCompleto(texto, pagina, elegido.nombre, neuronId);
    for (const h of hallazgos) {
      h.metadatos = { ...(h.metadatos || {}), documentoDriveId: elegido.id };
      conteos[h.tipo] = (conteos[h.tipo] || 0) + 1;
      const lista = ejemplos[h.tipo] || [];
      if (lista.length < 2) lista.push(`p.${pagina}: ${h.textoOriginal.slice(0, 220)}`);
      ejemplos[h.tipo] = lista;
    }

    const n = await guardarPaginaND(hallazgos, elegido.id, pagina);
    guardados += n;
    console.log(`   📄 ${pagina}/${total} → ${n} guardados`);
  });

  await finalizarDocumentoND(elegido.id);

  const verificacion = await turso.execute({
    sql: `SELECT COUNT(*) AS total FROM nd_hallazgos_raw WHERE documento_drive_id=? AND neuron_id=?`,
    args: [elegido.id, neuronId],
  });
  const totalTurso = Number(verificacion.rows[0]?.total ?? 0);

  console.log('\n════════════════════════════════════════════════════════════');
  console.log('📊 RESULTADO ND — PILOTO');
  console.log('════════════════════════════════════════════════════════════');
  console.log(`Documento: ${elegido.nombre}`);
  console.log(`Páginas:   ${paginas}`);
  console.log(`Extraídos: ${guardados}`);
  console.log(`Turso:     ${totalTurso}`);
  console.log(`Diferencia por duplicados: ${guardados - totalTurso}`);
  console.log('\nConteos por tipo:');
  for (const tipo of TIPOS) console.log(`  ${tipo.padEnd(15)} ${conteos[tipo] || 0}`);

  console.log('\nEjemplos limitados (máx. 2 por tipo):');
  for (const tipo of TIPOS) {
    const lista = ejemplos[tipo];
    if (lista?.length) {
      console.log(`  [${tipo}]`);
      for (const x of lista) console.log(`    ${x}`);
    }
  }

  console.log('\n🏁 Piloto terminado.');
  console.log('   ✓ Cada página se guardó en Turso antes de continuar.');
  console.log('   ✓ No se acumuló el documento completo en RAM.');
  console.log('   ✓ No se escribió en Supabase ni en propiedades_extraidas.');
}

main().catch(err => { console.error('❌ Error general:', err?.message || err); process.exit(1); });
