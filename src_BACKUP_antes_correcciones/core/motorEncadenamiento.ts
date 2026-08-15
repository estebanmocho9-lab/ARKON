// ============================================================
// src/core/motorEncadenamiento.ts
// EL AGENTE — motor de encadenamiento (forward chaining).
//
// Extiende inferenceEngine.ts: en vez de aplicar UNA regla y
// devolver el resultado, aplica TODAS las reglas posibles sobre
// los hechos que tiene, junta las conclusiones como hechos
// nuevos, y vuelve a aplicar reglas sobre esos — hasta que no
// aparece nada nuevo o se llega al limite de profundidad.
//
// Usa tres fuentes de reglas, en este orden de prioridad:
//   1. Las reglas fijas de inferenceEngine.ts (REGLAS)
//   2. Las reglas extraidas de libros y ya VALIDADAS por vos
//      (tabla reglas_extraidas en Turso, estado = 'validada')
//   3. El mapa de relaciones de relationEngine.ts, para saber
//      que otras propiedades conviene revisar despues de cada paso
//
// Cada conclusion queda con su cadena de razonamiento completa,
// para poder mostrar SIEMPRE por que el agente llego a ese resultado.
// ============================================================

import { turso } from '../turso/tursoClient';
import { MAPA_RELACIONES } from './relationEngine';

// --------------------------------------------
// TIPOS
// --------------------------------------------

export interface HechoConocido {
  propiedad: string;
  valor: number | null;
  fuente: string; // 'dato_inicial' | 'regla_fija' | 'regla_extraida:<id>'
}

export interface PasoRazonamiento {
  regla_aplicada: string;
  propiedad_disparadora: string;
  conclusion: string;
  confianza: number;
  origen: 'fija' | 'extraida';
}

export interface ResultadoEncadenamiento {
  hechos_finales: HechoConocido[];
  cadena_razonamiento: PasoRazonamiento[];
  conclusion_principal: string | null;
  confianza_combinada: number;
  profundidad_alcanzada: number;
}

interface ReglaExtraidaDB {
  id: number;
  propiedad_causa: string;
  direccion_causa: string;
  propiedad_efecto: string;
  direccion_efecto: string;
  condicion: string | null;
  confianza: number;
}

// --------------------------------------------
// REGLAS FIJAS (calcadas de inferenceEngine.ts, mismo formato)
// Si en el futuro se editan alla, conviene sincronizar aca o
// mover esto a un archivo compartido — por ahora se mantienen
// juntas a proposito para no romper lo que ya funciona.
// --------------------------------------------

interface ReglaFija {
  propiedad: string;
  condicion: (valor: number) => boolean;
  consecuencia: string;
  confianza: number;
}

const REGLAS_FIJAS: ReglaFija[] = [
  { propiedad: 'porosidad', condicion: (v) => v > 70,
    consecuencia: 'Alta porosidad reduce resistencia mecanica y aumenta absorcion de agua',
    confianza: 0.9 },
  { propiedad: 'porosidad', condicion: (v) => v < 20,
    consecuencia: 'Baja porosidad aumenta densidad y resistencia mecanica',
    confianza: 0.85 },
  { propiedad: 'absorcion', condicion: (v) => v > 60,
    consecuencia: 'Alta absorcion puede causar degradacion por humedad en el tiempo',
    confianza: 0.88 },
  { propiedad: 'cohesion', condicion: (v) => v < 30,
    consecuencia: 'Baja cohesion genera fragilidad y riesgo de desintegracion',
    confianza: 0.92 },
  { propiedad: 'humedad', condicion: (v) => v > 60,
    consecuencia: 'Alta humedad acelera corrosion y degradacion quimica',
    confianza: 0.91 },
  { propiedad: 'conductividad_termica', condicion: (v) => v < 20,
    consecuencia: 'Baja conductividad termica actua como buen aislante',
    confianza: 0.93 },
  { propiedad: 'microfisuracion', condicion: (v) => v > 50,
    consecuencia: 'Microfisuras altas comprometen integridad estructural a largo plazo',
    confianza: 0.94 },
];

// --------------------------------------------
// TRAER REGLAS EXTRAIDAS Y VALIDADAS DESDE TURSO
// Solo las que vos ya revisaste y marcaste como 'validada'
// --------------------------------------------

async function traerReglasValidadas(): Promise<ReglaExtraidaDB[]> {
  try {
    const resultado = await turso.execute(
      `SELECT id, propiedad_causa, direccion_causa, propiedad_efecto,
              direccion_efecto, condicion, confianza
       FROM reglas_extraidas
       WHERE estado = 'validada'`
    );
    return resultado.rows as unknown as ReglaExtraidaDB[];
  } catch (error) {
    console.error('Error trayendo reglas validadas de Turso:', error);
    return [];
  }
}

// --------------------------------------------
// UN PASO DE ENCADENAMIENTO
// Revisa los hechos actuales contra ambas fuentes de reglas,
// devuelve las conclusiones NUEVAS de esta vuelta (no repite
// una conclusion que ya este en la cadena).
// --------------------------------------------

function aplicarReglasFijas(
  hechos: HechoConocido[],
  yaConcluido: Set<string>
): PasoRazonamiento[] {
  const pasos: PasoRazonamiento[] = [];

  for (const hecho of hechos) {
    if (hecho.valor === null) continue;

    const reglas = REGLAS_FIJAS.filter(
      (r) => r.propiedad === hecho.propiedad && r.condicion(hecho.valor as number)
    );

    for (const regla of reglas) {
      const clave = `fija:${regla.propiedad}:${regla.consecuencia}`;
      if (yaConcluido.has(clave)) continue;
      yaConcluido.add(clave);

      pasos.push({
        regla_aplicada: `${regla.propiedad} ${regla.condicion.toString()}`,
        propiedad_disparadora: hecho.propiedad,
        conclusion: regla.consecuencia,
        confianza: regla.confianza,
        origen: 'fija',
      });
    }
  }

  return pasos;
}

function aplicarReglasExtraidas(
  hechos: HechoConocido[],
  reglasDB: ReglaExtraidaDB[],
  yaConcluido: Set<string>
): PasoRazonamiento[] {
  const pasos: PasoRazonamiento[] = [];
  const propiedadesConocidas = new Set(hechos.map((h) => h.propiedad));

  for (const regla of reglasDB) {
    if (!propiedadesConocidas.has(regla.propiedad_causa)) continue;

    const clave = `extraida:${regla.id}`;
    if (yaConcluido.has(clave)) continue;
    yaConcluido.add(clave);

    const direccion =
      regla.direccion_efecto === 'aumenta' ? 'aumenta' : 'disminuye';

    pasos.push({
      regla_aplicada: `regla_extraida_${regla.id}`,
      propiedad_disparadora: regla.propiedad_causa,
      conclusion: `${regla.propiedad_efecto} ${direccion}${
        regla.condicion ? ` (condicion: ${regla.condicion})` : ''
      }`,
      confianza: regla.confianza,
      origen: 'extraida',
    });
  }

  return pasos;
}

// --------------------------------------------
// EXPANDIR HECHOS CON EL MAPA DE RELACIONES
// Cuando una propiedad se activa, agrega las relacionadas
// como "hechos a revisar" en la proxima vuelta (sin valor
// todavia — solo para que el motor sepa que mirar despues).
// --------------------------------------------

function expandirPorRelaciones(
  hechos: HechoConocido[]
): HechoConocido[] {
  const nombresConocidos = new Set(hechos.map((h) => h.propiedad));
  const nuevos: HechoConocido[] = [];

  for (const hecho of hechos) {
    const relacionadas = MAPA_RELACIONES[hecho.propiedad] || [];
    for (const rel of relacionadas) {
      if (!nombresConocidos.has(rel)) {
        nombresConocidos.add(rel);
        nuevos.push({ propiedad: rel, valor: null, fuente: 'relacion_sugerida' });
      }
    }
  }

  return nuevos;
}

// --------------------------------------------
// FUNCION PRINCIPAL — ENCADENAR
// Punto de entrada del agente: le das los hechos iniciales
// (propiedades con valor, ej. de un material o una mezcla) y
// devuelve todo lo que pudo deducir, con la cadena completa.
// --------------------------------------------

const PROFUNDIDAD_MAXIMA = 5; // evita loops infinitos si dos reglas se retroalimentan

export async function encadenar(
  hechosIniciales: HechoConocido[]
): Promise<ResultadoEncadenamiento> {
  const reglasDB = await traerReglasValidadas();

  let hechos = [...hechosIniciales];
  const cadena: PasoRazonamiento[] = [];
  const yaConcluido = new Set<string>();

  let profundidad = 0;
  let huboNuevo = true;

  while (huboNuevo && profundidad < PROFUNDIDAD_MAXIMA) {
    huboNuevo = false;
    profundidad++;

    const pasosFijos = aplicarReglasFijas(hechos, yaConcluido);
    const pasosExtraidos = aplicarReglasExtraidas(hechos, reglasDB, yaConcluido);
    const pasosNuevos = [...pasosFijos, ...pasosExtraidos];

    if (pasosNuevos.length > 0) {
      cadena.push(...pasosNuevos);
      huboNuevo = true;
    }

    const hechosExpandidos = expandirPorRelaciones(hechos);
    if (hechosExpandidos.length > 0) {
      hechos = [...hechos, ...hechosExpandidos];
      huboNuevo = true;
    }
  }

  const confianzaCombinada =
    cadena.length > 0
      ? cadena.reduce((acc, p) => acc + p.confianza, 0) / cadena.length
      : 0;

  return {
    hechos_finales: hechos,
    cadena_razonamiento: cadena,
    conclusion_principal: cadena.length > 0 ? cadena[cadena.length - 1].conclusion : null,
    confianza_combinada: Number(confianzaCombinada.toFixed(3)),
    profundidad_alcanzada: profundidad,
  };
}

// --------------------------------------------
// IMPRIMIR LA CADENA EN CONSOLA (para debug / demo)
// --------------------------------------------

export function imprimirCadena(resultado: ResultadoEncadenamiento) {
  console.log(`\n=== CADENA DE RAZONAMIENTO (${resultado.profundidad_alcanzada} pasos de profundidad) ===`);
  resultado.cadena_razonamiento.forEach((paso, i) => {
    console.log(
      `${i + 1}. [${paso.origen}] "${paso.propiedad_disparadora}" -> ${paso.conclusion} (confianza: ${paso.confianza})`
    );
  });
  console.log(`\nConclusion principal: ${resultado.conclusion_principal}`);
  console.log(`Confianza combinada: ${resultado.confianza_combinada}`);
}
