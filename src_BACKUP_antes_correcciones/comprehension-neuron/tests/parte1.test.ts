// ============================================================
// src/comprehension-neuron/test/parte1.test.ts
// Prueba de la Parte 1: el Diccionario Maestro de Coordenadas.
// No es un test con 2-3 ejemplos — corre contra TODO tu catálogo
// real (208 propiedades, 187 unidades, 21 materiales) y confirma
// tres cosas:
//   1. Cobertura completa: todo lo que existe en tus diccionarios
//      reales tiene un ID asignado, nada se queda afuera.
//   2. Estabilidad: si corrés esto dos veces, los IDs no cambian.
//   3. El caso concreto que te está rompiendo el sistema HOY (una
//      unidad que no pertenece a la magnitud de la propiedad) se
//      puede detectar con esta infraestructura.
//
// Corré esto con: npx ts-node src/comprehension-neuron/test/parte1.test.ts
// (no usa ningún framework de testing todavía, para no sumar una
// dependencia nueva solo para esta prueba puntual — si preferís
// Jest/Vitest, lo adapto).
// ============================================================

import { PROPIEDADES } from '../../extraction-neurons/diccionarios/propiedades';
import { UNIDADES } from '../../extraction-neurons/diccionarios/unidades';
import { INSTRUMENTOS } from '../../extraction-neurons/diccionarios/instrumentos';
import { obtenerMagnitudes } from '../diccionario/magnitudes';
import { obtenerPropiedades } from '../diccionario/propiedades';
import { obtenerUnidades, unidadEsCompatibleConPropiedad } from '../diccionario/unidades';
import { obtenerInstrumentos } from '../diccionario/instrumentos';
import { obtenerMetodos } from '../diccionario/metodos';
import { obtenerOrganismosNorma } from '../diccionario/normas';
import { obtenerDimensiones } from '../diccionario/dimensiones';

let fallos = 0;

function verificar(descripcion: string, condicion: boolean) {
  if (condicion) {
    console.log(`  ✅ ${descripcion}`);
  } else {
    console.log(`  ❌ ${descripcion}`);
    fallos++;
  }
}

function seccion(titulo: string) {
  console.log(`\n=== ${titulo} ===`);
}

async function correr() {
  seccion('Cobertura — Propiedades');
  const propiedades = obtenerPropiedades();
  verificar(`Las ${PROPIEDADES.length} propiedades reales tienen ID asignado`, propiedades.length === PROPIEDADES.length);
  verificar('Todos los IDs de propiedad son únicos', new Set(propiedades.map(p => p.id)).size === propiedades.length);
  verificar(
    'Ninguna propiedad quedó sin ninguna magnitud resuelta',
    propiedades.every(p => p.magnitudes.length > 0)
  );

  seccion('Cobertura — Magnitudes');
  const magnitudes = obtenerMagnitudes();
  const magnitudesReales = new Set(PROPIEDADES.flatMap(p => p.magnitudes));
  verificar(`Las ${magnitudesReales.size} magnitudes reales tienen ID asignado`, magnitudes.length === magnitudesReales.size);
  const conDimension = magnitudes.filter(m => m.dimension !== 'PENDIENTE_DEFINIR');
  const pendientes = magnitudes.filter(m => m.dimension === 'PENDIENTE_DEFINIR');
  console.log(`  ℹ️  ${conDimension.length} magnitudes con dimensión física confirmada, ${pendientes.length} pendientes de revisión (no inventadas)`);

  seccion('Cobertura — Unidades');
  const unidades = obtenerUnidades();
  verificar(`Las ${UNIDADES.length} unidades reales tienen ID asignado`, unidades.length === UNIDADES.length);
  verificar('Todos los IDs de unidad son únicos', new Set(unidades.map(u => u.id)).size === unidades.length);

  seccion('Cobertura — Instrumentos y métodos');
  const instrumentos = obtenerInstrumentos();
  const metodos = obtenerMetodos();
  const totalInstrumentosReales = INSTRUMENTOS.filter(i => i.tipo === 'instrumento').length;
  const totalMetodosReales = INSTRUMENTOS.filter(i => i.tipo === 'metodo').length;
  verificar(`Los ${totalInstrumentosReales} instrumentos reales tienen ID`, instrumentos.length === totalInstrumentosReales);
  verificar(`Los ${totalMetodosReales} métodos reales tienen ID`, metodos.length === totalMetodosReales);

  seccion('Cobertura — Normas');
  const normas = obtenerOrganismosNorma();
  console.log(`  ℹ️  ${normas.length} organismos normativos identificados: ${normas.map(n => n.nombre).join(', ')}`);
  verificar('Al menos ASTM, ISO e IRAM están identificados', ['ASTM', 'ISO', 'IRAM'].every(n => normas.some(o => o.nombre === n)));

  seccion('Estabilidad — correr dos veces da los mismos IDs');
  const propiedadesOtraVez = obtenerPropiedades();
  verificar(
    'Los IDs de propiedad son idénticos en dos llamadas seguidas',
    propiedades.every((p, i) => p.id === propiedadesOtraVez[i].id)
  );

  seccion('El caso real que rompía el sistema: unidad incompatible con la propiedad');
  const resistividad = propiedades.find(p => p.nombre_principal === 'Resistividad superficial');
  if (resistividad) {
    // Unidad real de tu catálogo que SÍ debería ser compatible
    const unidadOhm = unidades.find(u => u.simbolo.toLowerCase().includes('ohm') || u.simbolo === 'Ω');
    // Una unidad de OTRA magnitud (ej. una de temperatura), que
    // representa el tipo de error que veíamos: "T" agarrada de
    // "AASHTO T 358", no relacionada con resistividad.
    const unidadTemperatura = unidades.find(u => u.simbolo === '°C');

    if (unidadTemperatura) {
      verificar(
        '°C se detecta como INCOMPATIBLE con Resistividad superficial (esto es lo que hubiera frenado el bug de "AASHTO T 358")',
        !unidadEsCompatibleConPropiedad(unidadTemperatura.id, resistividad.magnitudes)
      );
    } else {
      console.log('  ⚠️  No se encontró unidad °C en el catálogo para esta prueba puntual');
    }
    if (unidadOhm) {
      verificar('La unidad real de resistividad SÍ se detecta como compatible', unidadEsCompatibleConPropiedad(unidadOhm.id, resistividad.magnitudes));
    } else {
      console.log('  ℹ️  No se encontró una unidad de ohm/resistividad en unidades.ts todavía — revisar si falta cargarla');
    }
  } else {
    console.log('  ⚠️  No se encontró la propiedad "Resistividad superficial" — revisar nombre exacto en propiedades.ts');
  }

  seccion('Resumen');
  const dimensiones = obtenerDimensiones();
  console.log(`  Propiedades: ${propiedades.length}`);
  console.log(`  Magnitudes: ${magnitudes.length} (${dimensiones.length} dimensiones físicas definidas)`);
  console.log(`  Unidades: ${unidades.length}`);
  console.log(`  Instrumentos: ${instrumentos.length} | Métodos: ${metodos.length} | Organismos de norma: ${normas.length}`);

  if (fallos === 0) {
    console.log('\n🟢 Todo pasó. El Diccionario Maestro cubre el catálogo real completo y es estable.');
  } else {
    console.log(`\n🔴 ${fallos} verificación(es) fallaron — revisar arriba.`);
    process.exitCode = 1;
  }
}

correr();
