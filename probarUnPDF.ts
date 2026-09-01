// ============================================================
// probarUnPDF.ts
// Prueba el motor ND sobre UN SOLO PDF, mostrando por pantalla
// evidencia documental amplia. NO guarda nada en Turso/Supabase
// ni toca checkpoints.
//
// Uso:
//   npx ts-node --transpile-only probarUnPDF.ts 01
//   npx ts-node --transpile-only probarUnPDF.ts 01 "vermiculite"
// ============================================================

import * as dotenv from 'dotenv';
dotenv.config();

import { resolverSubcarpetaPorNombre, listarPDFs, descargarArchivo, extraerIdCarpeta } from './src/extraction-neurons/drive/driveReader';
import { extraerPaginas } from './src/extraction-neurons/pdf/pdfParser';
import { extraerNDCompleto } from './src/extraction-neurons/base/extractorNDCompleto';
import { HallazgoND } from './src/extraction-neurons/memoria-nd/tipos';

function contar(hallazgos: HallazgoND[], tipo: HallazgoND['tipo']): number {
  return hallazgos.filter(h => h.tipo === tipo).length;
}

function imprimirEjemplos(hallazgos: HallazgoND[], tipo: HallazgoND['tipo'], limite = 8): void {
  const lista = hallazgos.filter(h => h.tipo === tipo).slice(0, limite);
  if (!lista.length) { console.log('  (ninguno)'); return; }
  for (const h of lista) {
    const campo = h.campo ? ` [${h.campo}]` : '';
    console.log(`  pág.${h.evidencia.pagina}${campo}: ${h.textoOriginal.slice(0, 500)}`);
  }
}

async function main() {
  const numeroCarpeta = process.argv[2] || '01';
  const filtroNombre = process.argv[3]?.toLowerCase();
  const configurada = process.env.CARPETA_MADRE_DRIVE_ID?.trim();
  if (!configurada) {
    throw new Error(
      'Falta CARPETA_MADRE_DRIVE_ID. Cargá el ID en .env o exportalo en la sesión.'
    );
  }

  const carpetaId = await resolverSubcarpetaPorNombre(extraerIdCarpeta(configurada), numeroCarpeta);
  const archivos = await listarPDFs(carpetaId);
  const candidatos = filtroNombre ? archivos.filter(a => a.nombre.toLowerCase().includes(filtroNombre)) : archivos;
  const elegido = candidatos[0];

  if (!elegido) {
    console.error('❌ No encontré ningún PDF que coincida.');
    if (filtroNombre) console.log(`   Filtro utilizado: "${filtroNombre}"`);
    console.log(`   PDFs disponibles: ${archivos.length}`);
    for (const a of archivos.slice(0, 10)) console.log(`      - ${a.nombre}`);
    return;
  }

  console.log(`📖 Probando ND con: "${elegido.nombre}"`);
  const buffer = await descargarArchivo(elegido.id);
  const paginas = await extraerPaginas(buffer);
  console.log(`✅ ${paginas.length} páginas de texto extraídas.`);

  const hallazgos: HallazgoND[] = [];
  for (const { pagina, texto } of paginas) {
    if (!texto || texto.trim().length < 20) continue;
    hallazgos.push(...extraerNDCompleto(texto, pagina, elegido.nombre, `ND_TEST_${numeroCarpeta}`));
  }

  console.log('\n════════════════════════════════════════════════════════════');
  console.log('📊 RESULTADO — ND EXTRACCIÓN DOCUMENTAL');
  console.log('════════════════════════════════════════════════════════════');
  console.log(`Documento: ${elegido.nombre}`);
  console.log(`Páginas:   ${paginas.length}`);
  console.log(`Hallazgos: ${hallazgos.length}\n`);
  console.log(`DEFINICIONES:     ${contar(hallazgos, 'DEFINICION')}`);
  console.log(`MATERIALES:       ${contar(hallazgos, 'MATERIAL')}`);
  console.log(`COMPONENTES:      ${contar(hallazgos, 'COMPONENTE')}`);
  console.log(`PROPIEDADES:      ${contar(hallazgos, 'PROPIEDAD')} (menciones, sin interpretar valores)`);
  console.log(`ATRIBUTOS:        ${contar(hallazgos, 'ATRIBUTO')}`);
  console.log(`RELACIONES:       ${contar(hallazgos, 'RELACION')}`);
  console.log(`CONDICIONES:      ${contar(hallazgos, 'CONDICION')}`);
  console.log(`MÉTODOS:          ${contar(hallazgos, 'METODO')}`);
  console.log(`INSTRUMENTOS:     ${contar(hallazgos, 'INSTRUMENTO')}`);
  console.log(`APLICACIONES:     ${contar(hallazgos, 'APLICACION')}`);
  console.log(`COMPORTAMIENTO:   ${contar(hallazgos, 'COMPORTAMIENTO')}`);
  console.log(`NORMAS:           ${contar(hallazgos, 'NORMA')}`);
  console.log(`EVIDENCIA:        ${contar(hallazgos, 'EVIDENCIA')}`);
  console.log(`SIN CLASIFICAR:   ${contar(hallazgos, 'DESCONOCIDO')}`);

  console.log('\n── EJEMPLOS DE FRAGMENTOS COMPLETOS ──');
  for (const tipo of ['DEFINICION','RELACION','COMPORTAMIENTO','EVIDENCIA','METODO','APLICACION','NORMA'] as HallazgoND['tipo'][]) {
    console.log(`\n[${tipo}]`);
    imprimirEjemplos(hallazgos, tipo);
  }

  console.log('\n🏁 Prueba terminada.');
  console.log('   No se guardó nada en Turso ni Supabase.');
  console.log('   No se tocó ningún checkpoint.');
  console.log('   ND conserva evidencia documental; NE queda encargada de la extracción cuantitativa fina.');
}

main().catch(err => { console.error('Error general:', err); process.exit(1); });
