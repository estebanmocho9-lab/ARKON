// ============================================================
// probarUnPDF.ts
// Prueba el motor de extracción actualizado sobre UN SOLO PDF,
// mostrando por pantalla lo que encuentra. NO guarda nada en
// Turso ni en Supabase, NO toca ningún checkpoint — es de solo
// lectura, pensado para verificar que las cosas nuevas (estados,
// estado natural, componentes por patrón) están funcionando
// antes de reprocesar carpetas enteras.
//
// Uso:
//   npx ts-node --transpile-only probarUnPDF.ts 01
//   npx ts-node --transpile-only probarUnPDF.ts 01 "cemento"
//
// El primer argumento es el número de carpeta (01, 02, ...).
// El segundo (opcional) es un pedazo del nombre del archivo, para
// elegir cuál PDF probar; si no lo pasás, usa el primero legible
// que encuentre.
// ============================================================

import {
  resolverSubcarpetaPorNombre,
  listarPDFs,
  descargarArchivo,
} from './src/extraction-neurons/drive/driveReader';
import { extraerPaginas } from './src/extraction-neurons/pdf/pdfParser';
import { cargarDiccionarioMateriales, cargarDiccionarioComponentes } from './src/extraction-neurons/diccionarios/materiales';
import { analizarPagina } from './src/extraction-neurons/base/motorExtraccion';
import { extraerEstadoNatural } from './src/extraction-neurons/base/extractorESP001';

const PALABRAS_ESTADOS_NUEVOS = ['absorción', 'absorcion', 'higroscóp', 'higroscop', 'expansi', 'hincham', 'contracc', 'retracc'];

async function main() {
  const numeroCarpeta = process.argv[2] || '01';
  const filtroNombre = process.argv[3]?.toLowerCase();

  console.log(`📂 Buscando carpeta ${numeroCarpeta}...`);
  const carpetaId = await resolverSubcarpetaPorNombre(numeroCarpeta);
  const archivos = await listarPDFs(carpetaId);

  const elegido = filtroNombre
    ? archivos.find((a) => a.nombre.toLowerCase().includes(filtroNombre))
    : archivos[0];

  if (!elegido) {
    console.error('❌ No encontré ningún PDF que coincida.');
    return;
  }

  console.log(`📖 Probando con: "${elegido.nombre}"\n`);

  const buffer = await descargarArchivo(elegido.id);
  let paginas;
  try {
    paginas = await extraerPaginas(buffer);
  } catch (err: any) {
    console.error(`❌ No se pudo extraer texto de este PDF: ${err.message}`);
    console.log('   Probá con otro archivo: npx ts-node --transpile-only probarUnPDF.ts', numeroCarpeta, '"<pedazo del nombre>"');
    return;
  }

  console.log(`✅ ${paginas.length} páginas de texto extraídas. Cargando diccionarios...\n`);
  const materiales = await cargarDiccionarioMateriales();
  const componentes = await cargarDiccionarioComponentes();

  let totalRegistros = 0;
  let componentesEncontrados: { pagina: number; material: string | null; componente: string; catalogado: boolean }[] = [];
  let estadosNuevosEncontrados: { pagina: number; condicion: string }[] = [];
  let estadoNaturalEncontrado: { pagina: number; material: string; estado: string }[] = [];
  const nombresComponentesCatalogados = new Set(componentes.map((c) => c.nombre_es.toLowerCase()));

  const PAGINAS_A_PROBAR = Math.min(paginas.length, 30); // no hace falta el libro entero para la prueba

  for (let i = 0; i < PAGINAS_A_PROBAR; i++) {
    const { pagina, texto } = paginas[i];
    const { registros } = analizarPagina(texto, materiales, componentes);
    totalRegistros += registros.length;

    for (const r of registros) {
      if (r.componente) {
        componentesEncontrados.push({
          pagina,
          material: r.material,
          componente: r.componente,
          catalogado: nombresComponentesCatalogados.has(r.componente.toLowerCase()),
        });
      }
      if (r.condicion_ensayo && PALABRAS_ESTADOS_NUEVOS.some((p) => r.condicion_ensayo!.toLowerCase().includes(p))) {
        estadosNuevosEncontrados.push({ pagina, condicion: r.condicion_ensayo });
      }
    }

    const estadoNatural = extraerEstadoNatural(texto, materiales);
    for (const en of estadoNatural) {
      estadoNaturalEncontrado.push({ pagina, material: en.material, estado: en.estado_natural });
    }
  }

  console.log(`\n📊 RESULTADOS (primeras ${PAGINAS_A_PROBAR} páginas de ${paginas.length}):\n`);
  console.log(`Total de propiedades encontradas: ${totalRegistros}\n`);

  console.log(`── Componentes encontrados (${componentesEncontrados.length}) ──`);
  if (componentesEncontrados.length === 0) console.log('  (ninguno en estas páginas)');
  for (const c of componentesEncontrados.slice(0, 20)) {
    console.log(`  pág.${c.pagina} | material: ${c.material || '(sin material)'} | componente: "${c.componente}" | ${c.catalogado ? 'ya en tu catálogo' : '🆕 NUEVO (detectado por patrón)'}`);
  }

  console.log(`\n── Estados nuevos (absorción/higroscópico/expansión/contracción) (${estadosNuevosEncontrados.length}) ──`);
  if (estadosNuevosEncontrados.length === 0) console.log('  (ninguno en estas páginas)');
  for (const e of estadosNuevosEncontrados.slice(0, 20)) {
    console.log(`  pág.${e.pagina} | "${e.condicion}"`);
  }

  console.log(`\n── Estado natural detectado (${estadoNaturalEncontrado.length}) ──`);
  if (estadoNaturalEncontrado.length === 0) console.log('  (ningún material de tu lista mencionado en estas páginas)');
  const unicos = Array.from(new Map(estadoNaturalEncontrado.map((e) => [e.material, e])).values());
  for (const e of unicos) {
    console.log(`  ${e.material} → ${e.estado}`);
  }

  console.log('\n🏁 Prueba terminada. No se guardó nada en Turso ni en Supabase, no se tocó ningún checkpoint.');
}

main().catch((err) => {
  console.error('Error general:', err);
  process.exit(1);
});
