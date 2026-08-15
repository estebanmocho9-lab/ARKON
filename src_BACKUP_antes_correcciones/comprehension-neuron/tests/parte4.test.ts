// ============================================================
// src/comprehension-neuron/tests/parte4.test.ts
// Los 5 casos obligatorios de la Sección 26, corridos contra
// "Densidad aparente" real y un catálogo de materiales de prueba
// (mismo criterio que parte3.test.ts: Supabase no es alcanzable
// desde acá, así que se usan 2 entradas reales de tu lista de 21
// escritas a mano solo para esta prueba).
//
// Corré con: npx ts-node src/comprehension-neuron/tests/parte4.test.ts
// ============================================================

import { Material } from '../tipos/entidades';
import { Id } from '../tipos/ids';
import { procesarCandidato, EntradaProcesamiento } from '../neuronaComprension';
import { MemoriaTemporalDocumento } from '../../extraction-neurons/comprension/tipos';
import { BloqueMaterial } from '../../extraction-neurons/comprension/gestorBloques';

let fallos = 0;
function verificar(descripcion: string, condicion: boolean, detalle?: unknown) {
  if (condicion) console.log(`  ✅ ${descripcion}`);
  else {
    console.log(`  ❌ ${descripcion}`, detalle ?? '');
    fallos++;
  }
}

const catalogoDePrueba: Material[] = [
  { id: 'MAT-000010' as Id<'MAT'>, nombre_principal: 'Vermiculita', nombre_en: 'Vermiculite', sinonimos: [], familia: 'FAM-000001' as Id<'FAM'>, subfamilia: null, variante_de: null, estado: 'activo' },
  { id: 'MAT-000011' as Id<'MAT'>, nombre_principal: 'Vermiculita Expandida', nombre_en: 'Expanded Vermiculite', sinonimos: [], familia: 'FAM-000001' as Id<'FAM'>, subfamilia: null, variante_de: null, estado: 'activo' },
  { id: 'MAT-000012' as Id<'MAT'>, nombre_principal: 'Cemento Portland', nombre_en: 'Portland Cement', sinonimos: [], familia: 'FAM-000002' as Id<'FAM'>, subfamilia: null, variante_de: null, estado: 'activo' },
];

const memoriaVacia: MemoriaTemporalDocumento = {
  documento: 'doc-test',
  driveFileId: 'x',
  idioma: 'es',
  temaPrincipal: null,
  autor: null,
  norma: null,
  anio: null,
  tipoDocumento: null,
  arbol: [],
  lineaDeTiempo: [],
  materialesRelevantes: [],
  nivelConfianzaComprension: 'Alto',
};

function bloqueDePrueba(tipoNodoDominante: string | null): BloqueMaterial {
  return {
    id: 0,
    inicio: 0,
    fin: 500,
    materialDeclarado: null,
    origenMaterialDeclarado: 'sin_determinar',
    capituloActivo: null,
    seccionActiva: null,
    tipoNodoDominante: tipoNodoDominante as any,
    motivoCierre: 'fin_documento',
  };
}

async function correr() {
  console.log('\n=== CASO A — Dato correcto (Vermiculita Expandida, Densidad aparente, 120 kg/m³) ===');
  const textoA = 'Vermiculita Expandida\nDensidad aparente: 120 kg/m3';
  const entradaA: EntradaProcesamiento = {
    documentoId: 'doc-caso-a',
    textoCompleto: textoA,
    conceptoMaterialTexto: 'Vermiculita Expandida',
    propiedadTexto: 'Densidad aparente',
    posicionPropiedad: textoA.indexOf('Densidad aparente'),
    candidatosValor: [{ texto: '120 kg/m3', posicion: textoA.indexOf('120') }],
    unidadExplicitaTexto: 'kg/m3',
    encabezadoContextual: null,
    tabla: null,
    bloque: bloqueDePrueba(null),
    memoria: memoriaVacia,
    catalogoMateriales: catalogoDePrueba,
  };
  const resultadoA = procesarCandidato(entradaA);
  verificar('Se construyó una hipótesis', resultadoA.hipotesis !== null, resultadoA);
  verificar('Resultado final: ACEPTADO', resultadoA.hipotesis?.estado === 'ACEPTADO', resultadoA.hipotesis);

  console.log('\n=== CASO B — Número de página (Cemento Portland, Densidad aparente, "2030" tras "Página") ===');
  const textoB = 'Cemento Portland\nDensidad aparente\nPágina 2030';
  const posicion2030 = textoB.indexOf('2030');
  const entradaB: EntradaProcesamiento = {
    documentoId: 'doc-caso-b',
    textoCompleto: textoB,
    conceptoMaterialTexto: 'Cemento Portland',
    propiedadTexto: 'Densidad aparente',
    posicionPropiedad: textoB.indexOf('Densidad aparente'),
    candidatosValor: [{ texto: '2030', posicion: posicion2030 }],
    unidadExplicitaTexto: null,
    encabezadoContextual: null,
    tabla: null,
    bloque: bloqueDePrueba(null),
    memoria: memoriaVacia,
    catalogoMateriales: catalogoDePrueba,
  };
  const resultadoB = procesarCandidato(entradaB);
  verificar(
    'NO se construyó una hipótesis ACEPTADA (el "2030" se filtró en asociarValor por ser número de página, o quedó sin candidato)',
    resultadoB.hipotesis === null || resultadoB.hipotesis.estado !== 'ACEPTADO',
    resultadoB
  );

  console.log('\n=== CASO C — Material heredado sin evidencia propia en el fragmento ===');
  // El fragmento de evidencia que se arma alrededor de la
  // propiedad NO va a contener la palabra "Vermiculita" porque
  // está deliberadamente lejos (rellenamos con texto de relleno) —
  // simula el caso "el material se heredó de otro bloque".
  const relleno = 'x'.repeat(300);
  const textoC = `Vermiculita\n${relleno}\nDensidad aparente: 120 kg/m3`;
  const entradaC: EntradaProcesamiento = {
    documentoId: 'doc-caso-c',
    textoCompleto: textoC,
    conceptoMaterialTexto: 'Vermiculita',
    propiedadTexto: 'Densidad aparente',
    posicionPropiedad: textoC.indexOf('Densidad aparente'),
    candidatosValor: [{ texto: '120 kg/m3', posicion: textoC.indexOf('120') }],
    unidadExplicitaTexto: 'kg/m3',
    encabezadoContextual: null,
    tabla: null,
    bloque: bloqueDePrueba(null),
    memoria: memoriaVacia,
    catalogoMateriales: catalogoDePrueba,
  };
  const resultadoC = procesarCandidato(entradaC);
  verificar('Resultado RECHAZADO (material sin evidencia propia en el fragmento)', resultadoC.hipotesis?.estado === 'RECHAZADO', resultadoC.hipotesis);
  verificar('El motivo menciona el problema documental', resultadoC.validaciones.documental === 'FAIL', resultadoC.validaciones);

  console.log('\n=== CASO D — Vermiculita genérica (no debe convertirse en Vermiculita Expandida) ===');
  const textoD = 'Vermiculita\nLa vermiculita se expande al calentarse.\nDensidad aparente: 120 kg/m3';
  const entradaD: EntradaProcesamiento = {
    documentoId: 'doc-caso-d',
    textoCompleto: textoD,
    conceptoMaterialTexto: 'Vermiculita',
    propiedadTexto: 'Densidad aparente',
    posicionPropiedad: textoD.indexOf('Densidad aparente'),
    candidatosValor: [{ texto: '120 kg/m3', posicion: textoD.indexOf('120') }],
    unidadExplicitaTexto: 'kg/m3',
    encabezadoContextual: null,
    tabla: null,
    bloque: bloqueDePrueba(null),
    memoria: memoriaVacia,
    catalogoMateriales: catalogoDePrueba,
  };
  const resultadoD = procesarCandidato(entradaD);
  verificar('El material resuelto es Vermiculita (MAT-000010), NO Vermiculita Expandida', resultadoD.hipotesis?.material === 'MAT-000010', resultadoD.hipotesis);

  console.log('\n=== CASO E — Propiedad no típica pero explícita (no debe rechazarse solo por eso) ===');
  // "Color" no es una propiedad de tu diccionario real hoy, así que
  // acá lo importante NO es que dé ACEPTADO (no existe esa
  // propiedad en el catálogo todavía), sino confirmar que el
  // motivo de rechazo/pendiente sea "propiedad no encontrada en el
  // catálogo", nunca "propiedad no típica para este material" — esa
  // regla de rechazo automático no debe existir en ningún lado.
  const textoE = 'Vermiculita\nColor: marrón oscuro';
  const entradaE: EntradaProcesamiento = {
    documentoId: 'doc-caso-e',
    textoCompleto: textoE,
    conceptoMaterialTexto: 'Vermiculita',
    propiedadTexto: 'Color',
    posicionPropiedad: textoE.indexOf('Color'),
    candidatosValor: [{ texto: 'marrón oscuro', posicion: textoE.indexOf('marrón') }],
    unidadExplicitaTexto: null,
    encabezadoContextual: null,
    tabla: null,
    bloque: bloqueDePrueba(null),
    memoria: memoriaVacia,
    catalogoMateriales: catalogoDePrueba,
  };
  const resultadoE = procesarCandidato(entradaE);
  verificar(
    'El motivo es "no se pudo resolver la propiedad", nunca algo tipo "no típica para este material"',
    resultadoE.motivos.every(m => !m.toLowerCase().includes('tipica') && !m.toLowerCase().includes('típica')),
    resultadoE.motivos
  );

  console.log('\n=== Resumen ===');
  if (fallos === 0) {
    console.log('🟢 Los 5 casos obligatorios de la Parte 4 pasaron.');
  } else {
    console.log(`🔴 ${fallos} caso(s) fallaron.`);
    process.exitCode = 1;
  }
}

correr();
