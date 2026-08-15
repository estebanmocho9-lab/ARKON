// ============================================================
// src/comprehension-neuron/tests/parte3.test.ts
// Los 8 tests obligatorios de la Sección 40, usando materiales
// reales de tu catálogo (Vermiculita) y propiedades reales
// (Densidad aparente).
//
// Corré con: npx ts-node src/comprehension-neuron/tests/parte3.test.ts
// ============================================================

import { Material } from '../tipos/entidades';
import { Id } from '../tipos/ids';
import { resolverConcepto, palabrasSonContiguas } from '../razonamiento/resolverEntidades';
import { resolverMaterialDetallado } from '../razonamiento/resolverMaterial';
import { detectarTablaEnBloque } from '../mapa/tablas';
import { asociarValor } from '../razonamiento/asociarValor';
import { asociarUnidad } from '../razonamiento/asociarUnidad';
import { construirRelacionCandidata } from '../razonamiento/construirRelaciones';
import { obtenerPropiedades } from '../diccionario/propiedades';
import { obtenerUnidades } from '../diccionario/unidades';
import { Evidencia } from '../tipos/evidencias';
import { Valor } from '../tipos/valores';

let fallos = 0;
function verificar(descripcion: string, condicion: boolean, detalle?: unknown) {
  if (condicion) console.log(`  ✅ ${descripcion}`);
  else {
    console.log(`  ❌ ${descripcion}`, detalle ?? '');
    fallos++;
  }
}

// ── Catálogo de prueba: dos entradas reales de tu lista de 21 —
//    Vermiculita y Perlita Expandida — para probar la Regla de
//    Ambigüedad de la Sección 21 sin depender de Supabase en vivo
//    (que esta prueba no puede alcanzar desde acá). ────────────────
const catalogoDePrueba: Material[] = [
  { id: 'MAT-000001' as Id<'MAT'>, nombre_principal: 'Vermiculita', nombre_en: 'Vermiculite', sinonimos: [], familia: 'FAM-000001' as Id<'FAM'>, subfamilia: null, variante_de: null, estado: 'activo' },
  { id: 'MAT-000002' as Id<'MAT'>, nombre_principal: 'Perlita Expandida', nombre_en: 'Expanded Perlite', sinonimos: ['Perlita'], familia: 'FAM-000001' as Id<'FAM'>, subfamilia: null, variante_de: null, estado: 'activo' },
];

async function correr() {
  console.log('\n=== TEST 1 — Material explícito ("Vermiculita expandida" como span completo) ===');
  const concepto1 = resolverConcepto('Vermiculita expandida');
  verificar('El concepto conserva el texto completo tal como vino', concepto1.texto === 'Vermiculita expandida');

  console.log('\n=== TEST 2 — Material genérico ("Vermiculita" sola) ===');
  const concepto2 = resolverConcepto('Vermiculita');
  verificar('El concepto NO se amplía a "expandida"', concepto2.texto === 'Vermiculita');
  const r2 = resolverMaterialDetallado(concepto2, catalogoDePrueba);
  verificar('Resuelve a MAT-000001 (Vermiculita base), no a Perlita Expandida', r2.material?.id === 'MAT-000001', r2);

  console.log('\n=== TEST 3 — Descripción de comportamiento ("que se expande al calentarse") ===');
  const textoCompleto3 = 'La vermiculita, que se expande al calentarse, presenta una densidad de 120 kg/m³.';
  const posVermiculita = textoCompleto3.indexOf('vermiculita');
  const posExpande = textoCompleto3.indexOf('expande');
  verificar(
    '"vermiculita" y "expande" NO se consideran contiguas (hay coma y "que se" en el medio)',
    !palabrasSonContiguas(textoCompleto3, posVermiculita, 'vermiculita'.length, posExpande)
  );

  console.log('\n=== TEST 4 — Tabla (Vermiculita/Perlita con Densidad) ===');
  const textoTabla = 'Material       Densidad\nVermiculita    120 kg/m3\nPerlita         90 kg/m3';
  const tabla = detectarTablaEnBloque(textoTabla, 'doc-test', 0);
  verificar('Se detectó una tabla', tabla !== null, tabla);
  if (tabla) {
    const asocVermiculita = asociarValor({
      materialTexto: 'Vermiculita',
      propiedadTexto: 'Densidad',
      posicionReferencia: 0,
      tabla,
      candidatosProximidad: [],
      textoCompleto: textoTabla,
    });
    verificar('Vermiculita → 120 kg/m3', asocVermiculita.candidato?.texto === '120 kg/m3', asocVermiculita);

    const asocPerlita = asociarValor({
      materialTexto: 'Perlita',
      propiedadTexto: 'Densidad',
      posicionReferencia: 0,
      tabla,
      candidatosProximidad: [],
      textoCompleto: textoTabla,
    });
    verificar('Perlita → 90 kg/m3', asocPerlita.candidato?.texto === '90 kg/m3', asocPerlita);
  }

  console.log('\n=== TEST 5 — Unidad contextual ("Densidad (kg/m³)" como encabezado) ===');
  const unidades = obtenerUnidades();
  const r5 = asociarUnidad(null, 'Densidad (kg/m3)', unidades);
  verificar('estado === CONTEXTUAL', r5.estado === 'CONTEXTUAL', r5);
  verificar('Resolvió a la unidad kg/m3 real', r5.unidad?.simbolo === 'kg/m3', r5);

  console.log('\n=== TEST 6 — Número irrelevante ("Página 2030") ===');
  const textoConPagina = 'Vermiculita\nPágina 2030\nDensidad aparente';
  const posicionDe2030 = textoConPagina.indexOf('2030');
  const r6 = asociarValor({
    materialTexto: 'Vermiculita',
    propiedadTexto: 'Densidad aparente',
    posicionReferencia: 0,
    tabla: null,
    candidatosProximidad: [{ texto: '2030', posicion: posicionDe2030 }],
    textoCompleto: textoConPagina,
  });
  verificar('2030 NO se toma como candidato de valor (se filtró por ser número de página)', r6.candidato === null, r6);

  console.log('\n=== TEST 7 — Ambigüedad (dos materiales, dos valores, sin estructura de tabla) ===');
  const textoAmbiguo = 'Vermiculita\n120 kg/m3\n\nVermiculita expandida\n90 kg/m3';
  const posValor1 = textoAmbiguo.indexOf('120');
  const posValor2 = textoAmbiguo.indexOf('90');
  // posicionReferencia a mitad de camino entre los dos materiales,
  // para simular que no hay forma estructural de saber a cuál de
  // los dos les corresponde cada valor.
  const posicionMedia = Math.floor((posValor1 + posValor2) / 2);
  const r7 = asociarValor({
    materialTexto: null,
    propiedadTexto: 'Densidad',
    posicionReferencia: posicionMedia,
    tabla: null,
    candidatosProximidad: [
      { texto: '120', posicion: posValor1 },
      { texto: '90', posicion: posValor2 },
    ],
    textoCompleto: textoAmbiguo,
  });
  verificar('Resultado ambiguo, no elige ninguno de los dos por cercanía', r7.ambiguo === true && r7.candidato === null, r7);

  console.log('\n=== TEST 8 — Evidencia completa en la relación candidata ===');
  const propiedadReal = obtenerPropiedades().find(p => p.nombre_principal === 'Densidad aparente')!;
  const kgM3 = unidades.find(u => u.simbolo === 'kg/m3')!;
  const valorDePrueba: Valor = {
    id: 'VAL-000001' as Id<'VAL'>,
    texto_original: '120 kg/m³',
    numero: 120,
    unidad: kgM3.id,
    valor_minimo: null,
    valor_maximo: null,
    incertidumbre: null,
    operador: null,
    aproximacion: false,
    normalizado: null,
    posicionAbsoluta: 245,
  };
  const evidenciaDePrueba: Evidencia = {
    id: 'EVI-000001' as Id<'EVI'>,
    coordenada: { documento: 'DOC-000001' as Id<'DOC'>, pagina: 'PAG-000001' as Id<'PAG'>, bloque: 'BLQ-000001' as Id<'BLQ'>, tabla: null, fila: null, columna: null, posicionAbsoluta: 245 },
    fragmentoTexto: 'Vermiculita expandida — densidad aparente: 120 kg/m³',
    entidadesInvolucradas: [],
  };
  const hipotesis = construirRelacionCandidata(catalogoDePrueba[0], propiedadReal, valorDePrueba, kgM3, evidenciaDePrueba);
  verificar('La relación candidata tiene evidencia asociada', hipotesis.evidencia === evidenciaDePrueba.id);
  verificar('El estado inicial es PENDIENTE, no ACEPTADO', hipotesis.estado === 'PENDIENTE', hipotesis);
  verificar('Las 5 comprobaciones arrancan en UNKNOWN (Parte 4 las completa)', Object.values(hipotesis.comprobaciones).every(c => c === 'UNKNOWN'));

  console.log('\n=== Resumen ===');
  if (fallos === 0) {
    console.log('🟢 Los 8 tests obligatorios de la Parte 3 pasaron.');
  } else {
    console.log(`🔴 ${fallos} test(s) fallaron.`);
    process.exitCode = 1;
  }
}

correr();
