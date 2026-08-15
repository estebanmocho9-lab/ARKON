// ============================================================
// src/comprehension-neuron/tests/parte2.test.ts
// Los 8 tests obligatorios de la Sección 24 del documento,
// corridos contra tu "Densidad aparente" y tus unidades reales
// (kg/m³, g/cm³, MPa) — no contra propiedades inventadas.
//
// Corré con: npx ts-node src/comprehension-neuron/tests/parte2.test.ts
// ============================================================

import { obtenerPropiedades } from '../diccionario/propiedades';
import { obtenerUnidades } from '../diccionario/unidades';
import { obtenerMagnitudes } from '../diccionario/magnitudes';
import { obtenerDimensiones } from '../diccionario/dimensiones';
import { validarDimensionalDetallado, evaluarAusenciaDeUnidad } from '../validacion/validadorDimensional';
import { validarFisicoDetallado } from '../validacion/validadorFisico';
import { convertir } from '../conocimiento/conversionesUnidades';
import { Valor } from '../tipos/valores';
import { Id } from '../tipos/ids';

let fallos = 0;
function verificar(descripcion: string, condicion: boolean, detalle?: unknown) {
  if (condicion) {
    console.log(`  ✅ ${descripcion}`);
  } else {
    console.log(`  ❌ ${descripcion}`, detalle ?? '');
    fallos++;
  }
}

function valorDePrueba(numero: number, unidad: Id<'UNI'> | null, texto: string): Valor {
  return {
    id: 'VAL-000001' as Id<'VAL'>,
    texto_original: texto,
    numero,
    unidad,
    valor_minimo: null,
    valor_maximo: null,
    incertidumbre: null,
    operador: null,
    aproximacion: false,
    normalizado: null,
    posicionAbsoluta: 0,
  };
}

async function correr() {
  const propiedades = obtenerPropiedades();
  const unidades = obtenerUnidades();
  const magnitudes = obtenerMagnitudes();
  const dimensiones = obtenerDimensiones();

  const densidadAparente = propiedades.find(p => p.nombre_principal === 'Densidad aparente');
  const kgM3 = unidades.find(u => u.simbolo === 'kg/m3');
  const gCm3 = unidades.find(u => u.simbolo === 'g/cm3');
  const mpa = unidades.find(u => u.simbolo === 'MPa' && u.magnitud !== kgM3?.magnitud);

  if (!densidadAparente || !kgM3 || !gCm3 || !mpa) {
    console.log('❌ No se encontraron las propiedades/unidades reales necesarias para el test — revisar nombres exactos en propiedades.ts/unidades.ts');
    process.exitCode = 1;
    return;
  }

  console.log('\n=== TEST 1 — Correcto (120 kg/m³ para Densidad aparente) ===');
  const r1 = validarDimensionalDetallado(densidadAparente, valorDePrueba(120, kgM3.id, '120 kg/m³'), kgM3, magnitudes, dimensiones);
  verificar('Resultado PASS', r1.estado === 'PASS', r1);

  console.log('\n=== TEST 2 — Unidad incompatible (120 MPa para Densidad aparente) ===');
  const r2 = validarDimensionalDetallado(densidadAparente, valorDePrueba(120, mpa.id, '120 MPa'), mpa, magnitudes, dimensiones);
  verificar('Resultado FAIL', r2.estado === 'FAIL', r2);

  console.log('\n=== TEST 3 — Sin unidad y sin contexto (120, sola) ===');
  const r3 = validarDimensionalDetallado(densidadAparente, valorDePrueba(120, null, '120'), null, magnitudes, dimensiones);
  verificar('Resultado UNKNOWN', r3.estado === 'UNKNOWN', r3);

  console.log('\n=== TEST 4 — Unidad contextual (encabezado "Densidad aparente (kg/m³)") ===');
  const r4 = evaluarAusenciaDeUnidad(densidadAparente, kgM3, 'CONTEXTUAL', magnitudes, dimensiones);
  verificar('Resultado PASS', r4.estado === 'PASS', r4);

  console.log('\n=== TEST 5 — Número de página (2030, con evidencia documental contradictoria) ===');
  const r5 = evaluarAusenciaDeUnidad(densidadAparente, null, 'AUSENTE', magnitudes, dimensiones, 'la posición coincide con un número de página, no con una celda de tabla');
  verificar('Resultado FAIL', r5.estado === 'FAIL', r5);

  console.log('\n=== TEST 6 — Conversión válida (2 g/cm³ → 2000 kg/m³) ===');
  const valorOrigen = valorDePrueba(2, gCm3.id, '2 g/cm³');
  const convertido = convertir(valorOrigen, kgM3, unidades);
  verificar('Devuelve un Valor (no null)', convertido !== null);
  verificar('El texto original se conserva intacto', convertido?.texto_original === '2 g/cm³');
  verificar('El valor original (numero) no se modificó', convertido?.numero === 2);
  verificar('normalizado.numero === 2000', convertido?.normalizado?.numero === 2000, convertido?.normalizado);
  verificar('normalizado.unidad apunta a kg/m3', convertido?.normalizado?.unidad === kgM3.id);

  console.log('\n=== TEST 7 — Conversión imposible (kg/m³ → MPa) ===');
  const conversionImposible = convertir(valorDePrueba(120, kgM3.id, '120 kg/m³'), mpa, unidades);
  verificar('Devuelve null', conversionImposible === null);

  console.log('\n=== TEST 8 — Rango físico desconocido ===');
  const r8 = validarFisicoDetallado(densidadAparente.id, 120);
  verificar('Resultado UNKNOWN (RESTRICCIONES_FISICAS está vacío a propósito)', r8.estado === 'UNKNOWN', r8);

  console.log('\n=== Resumen ===');
  if (fallos === 0) {
    console.log('🟢 Los 8 tests obligatorios de la Parte 2 pasaron, contra datos reales de tu catálogo.');
  } else {
    console.log(`🔴 ${fallos} test(s) fallaron.`);
    process.exitCode = 1;
  }
}

correr();
