// ============================================================
// src/index.ts
// IMPULSO IA — PUNTO DE ENTRADA PRINCIPAL
// Lee productos y contextos desde Supabase (tabla 'productos').
// No hay listas hardcodeadas. Cualquier material/contexto nuevo
// se agrega en Supabase y el sistema lo procesa automáticamente.
// ============================================================

import * as dotenv from 'dotenv';
dotenv.config();

import { syncMaterialesToSupabase, listarMaterialesSupabase } from './sheets/syncData';
import { activarNeuronas } from './core/activationEngine';
import { supabase } from './supabase/client';

// ── Descripción legible de cada propiedad ─────────────────────
function describir(prop: string, valor: number, nivel: 'alto' | 'bajo'): string | null {
  const descripciones: Record<string, { alto: string; bajo: string }> = {
    absorcion_agua:           { alto: 'Absorción de agua elevada — absorbe humedad en exceso',         bajo: 'Baja absorción — buena resistencia a la humedad' },
    porosidad_total:          { alto: 'Alta porosidad — estructura interna con muchos poros',           bajo: 'Baja porosidad — material compacto y denso' },
    permeabilidad_intrinseca: { alto: 'Alta permeabilidad — los fluidos atraviesan fácilmente',         bajo: 'Baja permeabilidad — buena barrera contra fluidos' },
    conductividad_hidraulica: { alto: 'Alta conductividad hidráulica — el agua fluye fácilmente',       bajo: 'Baja conductividad hidráulica — resistencia al flujo' },
    indice_vacios:            { alto: 'Alto índice de vacíos — baja densidad relativa',                 bajo: 'Bajo índice de vacíos — estructura densa' },
    resistencia_compresion:   { alto: 'Alta resistencia a compresión — material robusto',               bajo: 'Baja resistencia — riesgo de falla estructural' },
    resistencia_traccion:     { alto: 'Alta resistencia a tracción',                                    bajo: 'Baja resistencia — riesgo de fractura por tensión' },
    resistencia_flexion:      { alto: 'Alta resistencia a flexión',                                     bajo: 'Baja resistencia — riesgo de rotura por doblado' },
    modulo_young:             { alto: 'Material muy rígido — alta rigidez elástica',                    bajo: 'Material flexible — baja rigidez elástica' },
    cohesion:                 { alto: 'Alta cohesión interna',                                          bajo: 'Baja cohesión — tendencia a desintegrarse' },
    dureza_mohs:              { alto: 'Material duro — resistente al rayado',                           bajo: 'Material blando — susceptible al rayado' },
    densidad_real:            { alto: 'Alta densidad real — material pesado',                           bajo: 'Baja densidad real — material liviano' },
    densidad_aparente:        { alto: 'Alta densidad aparente',                                         bajo: 'Baja densidad aparente — material poroso o ligero' },
    conductividad_termica:    { alto: 'Alta conductividad térmica — transfiere calor rápidamente',      bajo: 'Baja conductividad — buen aislante térmico' },
    temperatura_servicio:     { alto: 'Alta temperatura de servicio — resistente al calor',             bajo: 'Baja temperatura de servicio — riesgo de degradación' },
    huella_carbono:           { alto: 'Huella de carbono elevada — impacto ambiental alto',             bajo: 'Huella de carbono baja — material sustentable' },
    modulo_corte:             { alto: 'Alta rigidez al corte',                                          bajo: 'Baja rigidez al corte — deformable bajo carga lateral' },
    modulo_volumetrico:       { alto: 'Alta resistencia a compresión volumétrica',                      bajo: 'Baja resistencia volumétrica — compresible' },
    angulo_friccion:          { alto: 'Alto ángulo de fricción — mayor resistencia al deslizamiento',   bajo: 'Bajo ángulo de fricción — superficie deslizante' },
    conductividad_electrica:  { alto: 'Alta conductividad eléctrica — buen conductor',                  bajo: 'Baja conductividad — buen aislante eléctrico' },
    energia_incorporada:      { alto: 'Alta energía incorporada — proceso de fabricación intensivo',    bajo: 'Baja energía incorporada — proceso eficiente' },
    reciclabilidad:           { alto: 'Alta reciclabilidad — material reutilizable',                    bajo: 'Baja reciclabilidad — difícil de reciclar' },
  };
  const d = descripciones[prop];
  if (!d) return `${prop}: valor ${nivel} (${valor.toFixed(1)})`;
  return nivel === 'alto' ? d.alto : d.bajo;
}

// ── Análisis de un producto ────────────────────────────────────
async function generarResultadoReal(
  materialId: string,
  producto: string,
  contexto: string
): Promise<void> {
  console.log(`\n🔬 Analizando: ${producto} (${materialId})`);

  const resultado = await activarNeuronas(materialId, contexto);

  if (resultado.neuronasActivadas.length === 0) {
    console.log(`⚠️  Sin datos suficientes para ${producto}`);
    console.log(`   Propiedades faltantes: ${resultado.propiedadesPendientes.join(', ')}`);
    await supabase.from('resultados').upsert({
      producto,
      problema_detectado: 'DATOS_INSUFICIENTES',
      causas_fisicas: [
        `Faltan datos en NORMALIZACION para ${materialId}`,
        `Propiedades sin datos: ${resultado.propiedadesPendientes.slice(0, 3).join(', ')}`,
      ],
      soluciones_propuestas: ['Completá los valores en NORMALIZACION y volvé a correr el sistema'],
      compatibilidades: [],
      mejoras: [],
      confianza_general: 0,
      neuronas_activadas: 0,
      inferencias_generadas: 0,
      coherencia_global: 0,
      propiedades_pendientes: resultado.propiedadesPendientes,
      fecha: new Date().toISOString(),
    }, { onConflict: 'producto' });
    return;
  }

  const activaciones = resultado.neuronasActivadas;
  const confianzaPromedio = activaciones.reduce((sum, n) => sum + (n.confianza ?? 0), 0) / activaciones.length;

  const causas: string[] = [];
  const soluciones: string[] = [];

  for (const neurona of activaciones) {
    const valor = neurona.valorCompuesto;
    const anomalias = neurona.anomalias;
    const prop = neurona.propertyName;

    if (valor > 60) {
      const d = describir(prop, valor, 'alto');
      if (d) causas.push(d);
    }
    if (valor < 35) {
      const d = describir(prop, valor, 'bajo');
      if (d) soluciones.push(d);
    }
    if (anomalias && anomalias.length > 0) {
      causas.push(...anomalias.slice(0, 1));
    }

    // Mostrar índices intermedios calculados por scientific_formulas
    if (neurona.indicesIntermedios && Object.keys(neurona.indicesIntermedios).length > 0) {
      console.log(`   📐 ${prop} → índices: ${JSON.stringify(neurona.indicesIntermedios)}`);
    }
  }

  const coberturaPorc = resultado.coberturaPorc ??
    (resultado.propiedadesConDatos / Math.max(resultado.totalNeuronas, 1) * 100);

  // Problema principal — leído de Supabase si existe, sino descripción genérica
  const { data: problemaDB } = await supabase
    .from('problemas')
    .select('descripcion')
    .eq('nombre_problema', contexto)
    .maybeSingle();

  const problemaPrincipal = problemaDB?.descripcion ?? `Análisis de ${contexto} completado`;

  const causasFinales = causas.slice(0, 4).length > 0
    ? causas.slice(0, 4)
    : [`Análisis con ${activaciones.length} neuronas (${coberturaPorc.toFixed(0)}% cobertura)`];

  const solucionesFinales = soluciones.slice(0, 4).length > 0
    ? soluciones.slice(0, 4)
    : ['Completá las propiedades faltantes en NORMALIZACION para mayor precisión'];

  if (resultado.propiedadesPendientes.length > 0) {
    causasFinales.push(
      `Sin datos (ignoradas): ${resultado.propiedadesPendientes.slice(0, 3).join(', ')}`
    );
  }

  const { error } = await supabase.from('resultados').upsert({
    producto,
    problema_detectado: problemaPrincipal,
    causas_fisicas: causasFinales,
    soluciones_propuestas: solucionesFinales,
    compatibilidades: [],
    mejoras: [],
    confianza_general: Math.round(confianzaPromedio * 100) / 100,
    neuronas_activadas: activaciones.length,
    inferencias_generadas: activaciones.length,
    coherencia_global: Math.round(coberturaPorc) / 100,
    propiedades_pendientes: resultado.propiedadesPendientes,
    fecha: new Date().toISOString(),
  }, { onConflict: 'producto' });

  if (error) {
    console.error(`❌ Error guardando resultado:`, error.message);
  } else {
    console.log(`✅ Resultado guardado — ${producto}`);
    console.log(`   Confianza: ${(confianzaPromedio * 100).toFixed(1)}%`);
    console.log(`   Neuronas activadas: ${activaciones.length}/${resultado.totalNeuronas}`);
    console.log(`   Cobertura: ${coberturaPorc.toFixed(0)}%`);
    if (resultado.propiedadesPendientes.length > 0) {
      console.log(`   Sin datos (ignoradas): ${resultado.propiedadesPendientes.join(', ')}`);
    }
  }
}

// ── MAIN ───────────────────────────────────────────────────────
async function main() {
  console.log('\n═══════════════════════════════════════');
  console.log('🧠 IMPULSO IA — Sistema Neuronal Físico');
  console.log('═══════════════════════════════════════\n');

  // PASO 1 — Sincronizar Google Sheets → Supabase
  await syncMaterialesToSupabase();

  // PASO 2 — Verificar materiales disponibles
  const materiales = await listarMaterialesSupabase();
  console.log(`\n📦 Materiales en Supabase: ${materiales.length > 0 ? materiales.join(', ') : 'ninguno'}`);

  if (materiales.length === 0) {
    console.log('\n⚠️  No hay materiales en Supabase.');
    console.log('   Asegurate que NORMALIZACION tenga datos y volvé a correr.');
    return;
  }

  // PASO 3 — Leer productos desde Supabase
  // Para agregar un nuevo producto/material/contexto:
  // INSERT INTO productos (nombre, material_id, contexto, activo)
  // VALUES ('Nombre del producto', 'MA.XXX', 'contexto', true)
  console.log('\n🔬 Iniciando análisis de productos...\n');

  const { data: productos, error: errorProductos } = await supabase
    .from('productos')
    .select('nombre, material_id, contexto')
    .eq('activo', true)
    .order('id', { ascending: true });

  if (errorProductos || !productos || productos.length === 0) {
    console.log('⚠️  No hay productos activos en la tabla "productos" de Supabase.');
    console.log('   Agregá filas con: nombre, material_id, contexto, activo=true');
    console.log('   Contextos disponibles:');
    console.log('   humedad | fragilidad | termico | aislamiento_termico |');
    console.log('   quimico | estructural | sustentabilidad | peso | general');
    return;
  }

  for (const p of productos) {
    if (!materiales.includes(p.material_id)) {
      console.log(`⏭️  ${p.nombre} — ${p.material_id} no disponible en NORMALIZACION`);
      continue;
    }
    await generarResultadoReal(p.material_id, p.nombre, p.contexto);
  }

  console.log('\n🚀 CICLO COMPLETO FINALIZADO\n');
}

main().catch(console.error);
