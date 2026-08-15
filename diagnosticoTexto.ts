// ============================================================
// diagnosticoTexto.ts
// Muestra el texto CRUDO de una página de un PDF, tal cual lo
// entrega extraerPaginas() — antes de cualquier normalización.
// Sirve para ver si el texto conserva saltos de línea reales o
// viene todo corrido en un solo bloque, que es justo lo que
// necesitamos saber para arreglar el detector de encabezados.
//
// Uso:
//   npx ts-node --transpile-only diagnosticoTexto.ts 01 "" 10
//
// Argumentos: numeroCarpeta, filtroNombre (puede ir vacío ""),
// número de página a mostrar (por defecto 10).
// ============================================================

import * as dotenv from 'dotenv';
dotenv.config();

import {
  resolverSubcarpetaPorNombre,
  listarPDFs,
  descargarArchivo,
  extraerIdCarpeta,
} from './src/extraction-neurons/drive/driveReader';
import { extraerPaginas } from './src/extraction-neurons/pdf/pdfParser';

async function main() {
  const numeroCarpeta = process.argv[2] || '01';
  const filtroNombre = process.argv[3]?.toLowerCase() || undefined;
  const numeroPagina = parseInt(process.argv[4] || '10', 10);

  const carpetaMadre = process.env.CARPETA_MADRE_DRIVE_ID;
  if (!carpetaMadre) {
    console.error('❌ Falta CARPETA_MADRE_DRIVE_ID.');
    return;
  }
  const carpetaId = await resolverSubcarpetaPorNombre(extraerIdCarpeta(carpetaMadre), numeroCarpeta);
  const archivos = await listarPDFs(carpetaId);
  const elegido = filtroNombre ? archivos.find(a => a.nombre.toLowerCase().includes(filtroNombre)) : archivos[0];

  if (!elegido) {
    console.error('❌ No encontré ningún PDF.');
    return;
  }

  console.log(`📖 Analizando: "${elegido.nombre}"\n`);
  const buffer = await descargarArchivo(elegido.id);
  const paginas = await extraerPaginas(buffer);

  const indice = Math.min(numeroPagina, paginas.length - 1);
  const texto = paginas[indice].texto || '';

  console.log(`═══ Página ${paginas[indice].pagina} de ${paginas.length} — texto CRUDO (primeros 1500 caracteres) ═══\n`);
  console.log(JSON.stringify(texto.substring(0, 1500)));

  console.log('\n═══ Diagnóstico ═══');
  const cantidadSaltosLinea = (texto.match(/\n/g) || []).length;
  console.log(`Cantidad de saltos de línea (\\n) en esta página: ${cantidadSaltosLinea}`);
  console.log(`Longitud total del texto de esta página: ${texto.length} caracteres`);
  if (cantidadSaltosLinea === 0) {
    console.log('⚠️  CONFIRMADO: esta página no tiene NINGÚN salto de línea real.');
    console.log('   El texto viene como un solo bloque corrido — hay que ajustar el');
    console.log('   detector de encabezados para no depender de "\\n".');
  } else if (cantidadSaltosLinea < 5) {
    console.log('⚠️  Muy pocos saltos de línea para el tamaño del texto — probablemente');
    console.log('   solo separa párrafos grandes, no cada línea/título individual.');
  } else {
    console.log('✅ Hay saltos de línea reales y en buena cantidad — el detector debería');
    console.log('   poder reconocer títulos. Si no los encontró, el problema puede ser');
    console.log('   el formato exacto de la numeración de este documento en particular.');
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
