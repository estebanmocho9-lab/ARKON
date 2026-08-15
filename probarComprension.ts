// ============================================================
// probarComprension.ts
// Prueba SOLO la Neurona de Comprensión Documental sobre un PDF
// real de tu Drive: arma la memoria temporal y la muestra por
// pantalla (árbol de estructura, línea de tiempo de contexto,
// idioma, materiales relevantes). NO extrae propiedades, NO
// guarda nada en Turso ni Supabase — es de solo lectura, pensado
// para verificar que la comprensión funciona antes de conectarla
// al resto del pipeline.
//
// Uso (mismo patrón que probarUnPDF.ts, que ya tenías):
//   npx ts-node --transpile-only probarComprension.ts 01
//   npx ts-node --transpile-only probarComprension.ts 01 "yeso"
//
// El primer argumento es el número de carpeta (01, 02, ...).
// El segundo (opcional) es un pedazo del nombre del archivo.
// ============================================================

import {
  resolverSubcarpetaPorNombre,
  listarPDFs,
  descargarArchivo,
  extraerIdCarpeta,
} from './src/extraction-neurons/drive/driveReader';
import { extraerPaginas } from './src/extraction-neurons/pdf/pdfParser';
import { cargarDiccionarioMateriales } from './src/extraction-neurons/diccionarios/materiales';
import { construirMemoriaTemporal } from './src/extraction-neurons/comprension/construirMemoria';
import { NodoEstructura } from './src/extraction-neurons/comprension/tipos';

function imprimirArbol(nodos: NodoEstructura[], profundidad = 0): void {
  for (const nodo of nodos) {
    const sangria = '  '.repeat(profundidad);
    const marca = nodo.tipo === 'tabla' ? '▦' : nodo.tipo === 'figura' ? '🖼' : '§';
    console.log(`${sangria}${marca} [${nodo.tipo}] "${nodo.titulo}" (pos ${nodo.posicionInicio}-${nodo.posicionFin})`);
    if (nodo.hijos.length > 0) imprimirArbol(nodo.hijos, profundidad + 1);
  }
}

async function main() {
  const numeroCarpeta = process.argv[2] || '01';
  const filtroNombre = process.argv[3]?.toLowerCase();

  console.log(`📂 Buscando carpeta ${numeroCarpeta}...`);
  const carpetaMadre = process.env.CARPETA_MADRE_DRIVE_ID;
  if (!carpetaMadre) {
    console.error('❌ Falta la variable de entorno CARPETA_MADRE_DRIVE_ID.');
    return;
  }
  const carpetaId = await resolverSubcarpetaPorNombre(extraerIdCarpeta(carpetaMadre), numeroCarpeta);
  const archivos = await listarPDFs(carpetaId);

  const elegido = filtroNombre
    ? archivos.find((a) => a.nombre.toLowerCase().includes(filtroNombre))
    : archivos[0];

  if (!elegido) {
    console.error('❌ No encontré ningún PDF que coincida.');
    return;
  }

  console.log(`📖 Probando comprensión con: "${elegido.nombre}"\n`);

  const buffer = await descargarArchivo(elegido.id);
  let paginas;
  try {
    paginas = await extraerPaginas(buffer);
  } catch (err: any) {
    console.error(`❌ No se pudo extraer texto de este PDF: ${err.message}`);
    return;
  }

  console.log(`✅ ${paginas.length} páginas extraídas. Cargando diccionario de materiales...\n`);
  const materiales = await cargarDiccionarioMateriales();

  // Mismo criterio de normalización que usará NeuronExtraccionBase.ts
  // en producción, para que esta prueba sea representativa.
  const partesNormalizadas = paginas.map((p) => (p.texto || '').replace(/\s+/g, ' '));
  const textoCompletoDocumento = partesNormalizadas.join(' ');

  console.log('🧠 Construyendo la Memoria Temporal (esto puede tardar unos segundos en documentos grandes)...\n');
  const memoria = construirMemoriaTemporal(textoCompletoDocumento, materiales, elegido.nombre, elegido.id);

  console.log('═══════════════════════════════════════════════════');
  console.log('  RESUMEN DE LA COMPRENSIÓN');
  console.log('═══════════════════════════════════════════════════');
  console.log(`Documento:              ${memoria.documento}`);
  console.log(`Idioma detectado:       ${memoria.idioma}`);
  console.log(`Tema principal:         ${memoria.temaPrincipal || '(no se pudo determinar)'}`);
  console.log(`Confianza comprensión:  ${memoria.nivelConfianzaComprension}`);
  console.log(`Materiales relevantes:  ${memoria.materialesRelevantes.join(', ') || '(ninguno de tu catálogo)'}`);
  console.log(`Nodos en el árbol:      ${memoria.arbol.length} de nivel superior`);
  console.log(`Checkpoints de contexto:${memoria.lineaDeTiempo.length}`);

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  ÁRBOL DE ESTRUCTURA (primeros niveles)');
  console.log('═══════════════════════════════════════════════════');
  if (memoria.arbol.length === 0) {
    console.log('  (no se detectó ninguna estructura jerárquica — el documento se');
    console.log('   tratará como un solo bloque sin material activo por sección)');
  } else {
    imprimirArbol(memoria.arbol);
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  LÍNEA DE TIEMPO DE CONTEXTO (primeros 25 puntos)');
  console.log('═══════════════════════════════════════════════════');
  for (const cp of memoria.lineaDeTiempo.slice(0, 25)) {
    console.log(
      `  pos ${cp.posicion.toString().padStart(7)} | material: ${(cp.materialActivo || '—').padEnd(20)} | ` +
      `origen: ${cp.origenMaterialActivo.padEnd(16)} | capítulo: ${cp.capituloActivo || '—'}`
    );
  }
  if (memoria.lineaDeTiempo.length > 25) {
    console.log(`  ... y ${memoria.lineaDeTiempo.length - 25} puntos más`);
  }

  console.log('\n🏁 Prueba de comprensión terminada. No se guardó nada en Turso ni en Supabase.');
}

main().catch((err) => {
  console.error('Error general:', err);
  process.exit(1);
});
