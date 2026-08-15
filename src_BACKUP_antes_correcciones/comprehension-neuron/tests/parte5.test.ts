// ============================================================
// src/comprehension-neuron/tests/parte5.test.ts
// Los 4 casos obligatorios del enrutador (Sección 20) + la prueba
// de guardado de pendientes (Sección 21) — esta última solo arma
// el registro y confirma su forma; no llega a escribir en Turso de
// verdad porque esta prueba no tiene credenciales reales (eso se
// corre en Cloud Shell, con tu .env real).
//
// Corré con: npx ts-node src/comprehension-neuron/tests/parte5.test.ts
// ============================================================

import { Id } from '../tipos/ids';
import { Hipotesis } from '../tipos/hipotesis';
import { enrutarResultados } from '../enrutadorResultados';
import { HipotesisConContexto } from '../../turso/guardarPendientesRevision';
import { Propiedad } from '../tipos/entidades';
import { Valor } from '../tipos/valores';
import { Evidencia } from '../tipos/evidencias';

let fallos = 0;
function verificar(descripcion: string, condicion: boolean, detalle?: unknown) {
  if (condicion) console.log(`  ✅ ${descripcion}`);
  else {
    console.log(`  ❌ ${descripcion}`, detalle ?? '');
    fallos++;
  }
}

function hipotesisDePrueba(id: string, estado: Hipotesis['estado']): Hipotesis {
  return {
    id: id as Id<'HYP'>,
    material: null,
    propiedad: 'PRO-000001' as Id<'PRO'>,
    valor: 'VAL-000001' as Id<'VAL'>,
    unidad: null,
    evidencia: 'EVI-000001' as Id<'EVI'>,
    comprobaciones: { documental: 'PASS', semantica: 'PASS', dimensional: 'PASS', matematica: 'UNKNOWN', fisica: 'UNKNOWN', evidencia: 'PASS' },
    estado,
    motivo: `Hipótesis de prueba en estado ${estado}`,
    motivos: [`Hipótesis de prueba en estado ${estado}`],
    fechaEvaluacion: new Date().toISOString(),
  };
}

function correr() {
  console.log('\n=== CASO A — Una hipótesis ACEPTADO ===');
  const rA = enrutarResultados([hipotesisDePrueba('HYP-A', 'ACEPTADO')]);
  verificar('paraGuardar.length === 1', rA.paraGuardar.length === 1);
  verificar('paraRevision.length === 0', rA.paraRevision.length === 0);
  verificar('descartados.length === 0', rA.descartados.length === 0);

  console.log('\n=== CASO B — Una hipótesis RECHAZADO ===');
  const rB = enrutarResultados([hipotesisDePrueba('HYP-B', 'RECHAZADO')]);
  verificar('paraGuardar.length === 0', rB.paraGuardar.length === 0);
  verificar('paraRevision.length === 0', rB.paraRevision.length === 0);
  verificar('descartados.length === 1', rB.descartados.length === 1);

  console.log('\n=== CASO C — Otra hipótesis RECHAZADO (confirma que no se mezcla con la anterior) ===');
  const rC = enrutarResultados([hipotesisDePrueba('HYP-C', 'RECHAZADO')]);
  verificar('descartados.length === 1', rC.descartados.length === 1);
  verificar('Es la hipótesis C, no quedó pegada la B de la corrida anterior', rC.descartados[0].id === 'HYP-C');

  console.log('\n=== CASO D — Una hipótesis PENDIENTE ===');
  const rD = enrutarResultados([hipotesisDePrueba('HYP-D', 'PENDIENTE')]);
  verificar('paraGuardar.length === 0', rD.paraGuardar.length === 0);
  verificar('paraRevision.length === 1', rD.paraRevision.length === 1);
  verificar('descartados.length === 0', rD.descartados.length === 0);

  console.log('\n=== Caso mixto — las 3 juntas no se pisan entre sí ===');
  const rMixto = enrutarResultados([hipotesisDePrueba('HYP-1', 'ACEPTADO'), hipotesisDePrueba('HYP-2', 'PENDIENTE'), hipotesisDePrueba('HYP-3', 'RECHAZADO')]);
  verificar('1 en cada balde', rMixto.paraGuardar.length === 1 && rMixto.paraRevision.length === 1 && rMixto.descartados.length === 1, rMixto);

  console.log('\n=== Prueba de guardado de pendientes (forma del registro, sin escribir a Turso real) ===');
  const propiedadDePrueba: Propiedad = {
    id: 'PRO-000001' as Id<'PRO'>,
    nombre_principal: 'Densidad aparente',
    nombre_en: 'Apparent density',
    sinonimos: [],
    simbolos: ['ρ'],
    categoria: 'Propiedad',
    tipo_propiedad: 'Física',
    magnitudes: [],
  };
  const valorDePrueba: Valor = {
    id: 'VAL-000001' as Id<'VAL'>,
    texto_original: '120 kg/m³',
    numero: 120,
    unidad: null,
    valor_minimo: null,
    valor_maximo: null,
    incertidumbre: null,
    operador: null,
    aproximacion: false,
    normalizado: null,
    posicionAbsoluta: 100,
  };
  const evidenciaDePrueba: Evidencia = {
    id: 'EVI-000001' as Id<'EVI'>,
    coordenada: { documento: 'DOC-000001' as Id<'DOC'>, pagina: null, bloque: null, tabla: null, fila: null, columna: null, posicionAbsoluta: 100 },
    fragmentoTexto: 'Vermiculita — densidad aparente: 120 kg/m³ (dato sin material confirmado)',
    entidadesInvolucradas: [],
  };
  const item: HipotesisConContexto = {
    hipotesis: hipotesisDePrueba('HYP-PENDIENTE', 'PENDIENTE'),
    neuronaId: 'NE-01',
    documento: 'manual_de_prueba.pdf',
    driveFileId: 'drive-id-123',
    pagina: 45,
    capitulo: 'Capítulo 3',
    material: null,
    propiedad: propiedadDePrueba,
    valor: valorDePrueba,
    unidad: null,
    evidencia: evidenciaDePrueba,
  };
  verificar('El item tiene todos los campos que pide la tabla (documento, página, capítulo, propiedad, valor, fragmento, motivo)', !!(item.documento && item.pagina && item.capitulo && item.propiedad.nombre_principal && item.valor.texto_original && item.evidencia.fragmentoTexto && item.hipotesis.motivos.length > 0));
  verificar('El estado de la hipótesis es PENDIENTE (guardarLotePendientes solo acepta este estado)', item.hipotesis.estado === 'PENDIENTE');

  console.log('\n=== Resumen ===');
  if (fallos === 0) {
    console.log('🟢 Los tests de la Parte 5 pasaron.');
  } else {
    console.log(`🔴 ${fallos} test(s) fallaron.`);
    process.exitCode = 1;
  }
}

correr();
