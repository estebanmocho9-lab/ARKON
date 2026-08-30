import * as dotenv from 'dotenv';
dotenv.config();

import { supabase } from './src/supabase/client';
import { activarNeuronas } from './src/core/activationEngine';

const MATERIAL_ID = process.env.TEST_MATERIAL_ID || 'M.010';
const PRODUCT_NAME = 'Placa de yeso antihumedad';

const MAYOR_ES_PEOR = new Set([
  'absorcion_agua', 'porosidad_total', 'indice_vacios_e', 'indice_vacios',
  'permeabilidad_intrinseca', 'conductividad_hidraulica', 'difusion_agua',
  'difusion_gases', 'difusion_ionica', 'conductividad_termica',
  'expansion_termica', 'huella_carbono', 'energia_incorporada',
  'no_reciclable', 'blandura', 'coef_deslizamiento', 'deflectabilidad',
  'compresibilidad', 'sensibilidad_termica', 'contraccion_termica',
  'temperatura_falla'
]);

const MENOR_ES_PEOR = new Set([
  'resistencia_compresion', 'resistencia_traccion', 'resistencia_flexion',
  'modulo_young', 'modulo_corte', 'modulo_volumetrico', 'cohesion',
  'dureza_mohs', 'angulo_friccion', 'temperatura_servicio',
  'impermeabilidad', 'indice_solidos', 'resistencia_matriz',
  'resistividad_hidraulica', 'resistencia_difusion', 'resistencia_gases',
  'resistencia_ionica', 'estabilidad_cohesiva', 'reciclabilidad'
]);

function nivelProblema(prop: string, valor: number): string | null {
  const p = prop.toLowerCase();
  if (MAYOR_ES_PEOR.has(p)) {
    if (valor >= 90) return 'CRITICO';
    if (valor >= 80) return 'ALTO';
    if (valor >= 70) return 'MODERADO';
    return null;
  }
  if (MENOR_ES_PEOR.has(p)) {
    if (valor <= 10) return 'CRITICO';
    if (valor <= 15) return 'ALTO';
    if (valor <= 20) return 'MODERADO';
    return null;
  }
  return valor >= 80 ? 'ALTO' : null;
}

function fmt(v: unknown): string {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(2) : String(v);
}

async function main() {
  console.log('\n============================================================');
  console.log('🧪 ARKON — DIAGNÓSTICO INTEGRAL REAL');
  console.log(`📦 Producto: ${PRODUCT_NAME}`);
  console.log(`🧱 Material: ${MATERIAL_ID}`);
  console.log('============================================================\n');

  const { data: producto, error: productoError } = await supabase
    .from('productos')
    .select('id,nombre,material_id,contexto,composicion,activo')
    .eq('material_id', MATERIAL_ID)
    .eq('activo', true)
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (productoError) throw productoError;
  if (!producto) throw new Error(`No existe producto activo con material_id=${MATERIAL_ID}`);

  console.log(`✅ Producto real encontrado: ${producto.nombre}`);
  console.log(`   Contexto almacenado: ${producto.contexto ?? 'sin contexto'}`);
  console.log(`   Composición almacenada: ${JSON.stringify(producto.composicion ?? {})}`);

  console.log('\n🔬 PASO 1 — Activar TODO el sistema (contexto general)');
  const resultado = await activarNeuronas(MATERIAL_ID, 'general');

  console.log(`\n📊 COBERTURA: ${resultado.neuronasConDatos}/${resultado.totalNeuronas} neuronas (${resultado.coberturaPorc.toFixed(1)}%)`);
  console.log(`🎯 Confianza promedio: ${resultado.confianzaPromedio.toFixed(3)}`);
  console.log(`⏭️ Propiedades sin datos: ${resultado.propiedadesPendientes.length}`);

  const problemas = resultado.neuronasActivadas
    .map(n => ({ n, nivel: nivelProblema(n.propertyName, n.valorCompuesto) }))
    .filter(x => x.nivel !== null)
    .sort((a, b) => {
      const order: Record<string, number> = { CRITICO: 0, ALTO: 1, MODERADO: 2 };
      return order[a.nivel!] - order[b.nivel!];
    });

  console.log(`\n🚨 PROBLEMAS DETECTADOS: ${problemas.length}`);
  if (!problemas.length) console.log('   Ningún problema supera los umbrales operativos actuales.');
  for (const { n, nivel } of problemas) {
    console.log(`   [${nivel}] ${n.neuronId} ${n.propertyName} = ${fmt(n.valorCompuesto)}/100 | confianza=${fmt(n.confianza)}`);
    if (n.anomalias?.length) console.log(`      anomalías: ${n.anomalias.join(' | ')}`);
  }

  console.log('\n📋 PASO 2 — Todas las neuronas activadas');
  for (const n of resultado.neuronasActivadas) {
    console.log(`   ${n.neuronId} | ${n.propertyName} | ${fmt(n.valorCompuesto)} | inv=${fmt(n.valorInverso)} | conf=${fmt(n.confianza)} | fórmulas=${n.metadatos?.formulasEvaluadas ?? 0}`);
  }

  console.log('\n⚠️ PASO 3 — Anomalías y datos faltantes');
  const anomalías = resultado.neuronasActivadas.flatMap(n =>
    (n.anomalias ?? []).map(a => `${n.neuronId}/${n.propertyName}: ${a}`)
  );
  console.log(`   Anomalías: ${anomalías.length}`);
  for (const a of anomalías) console.log(`   - ${a}`);
  if (resultado.propiedadesPendientes.length) {
    console.log('   Faltantes:');
    for (const p of resultado.propiedadesPendientes) console.log(`   - ${p}`);
  }

  const propsProblema = problemas.map(x => x.n.propertyName);

  console.log('\n🛠️ PASO 4 — Soluciones reales en reglas_mejora/mejoras');
  const { data: reglas } = await supabase
    .from('reglas_mejora')
    .select('neurona_id,condicion,solucion,prioridad')
    .order('prioridad', { ascending: false })
    .limit(200);

  let soluciones = 0;
  for (const r of reglas ?? []) {
    const texto = `${r.neurona_id ?? ''} ${r.condicion ?? ''}`.toLowerCase();
    const coincide = propsProblema.some(p => texto.includes(p.toLowerCase()));
    if (coincide && r.solucion) {
      soluciones++;
      console.log(`   - [prioridad ${r.prioridad ?? 0}] ${r.neurona_id}: ${r.solucion}`);
      if (soluciones >= 12) break;
    }
  }

  const { data: mejoras } = await supabase
    .from('mejoras')
    .select('problema,causa,solucion,material_sugerido,contexto,productos_aplicables')
    .eq('activo', true)
    .limit(300);

  let mejorasMostradas = 0;
  for (const m of mejoras ?? []) {
    const texto = [m.problema, m.causa, m.contexto, m.material_sugerido]
      .filter(Boolean).join(' ').toLowerCase();
    if (propsProblema.some(p => texto.includes(p.toLowerCase())) || texto.includes('yeso')) {
      console.log(`   - Mejora: ${m.solucion}${m.material_sugerido ? ` | material sugerido=${m.material_sugerido}` : ''}`);
      mejorasMostradas++;
      if (mejorasMostradas >= 12) break;
    }
  }
  if (!soluciones && !mejorasMostradas) console.log('   ⚠️ No se encontró una solución registrada para los problemas detectados.');

  console.log('\n🧮 PASO 5 — Fórmulas científicas vinculadas a los problemas');
  const { data: formulas } = await supabase
    .from('scientific_formulas')
    .select('id,nombre,descripcion,propiedad_a,propiedad_b,tipo_relacion,ecuacion,forma_computable,variables_input,output_nombre,output_unidad,dominio_fisico,rango_valido,peso_cientifico,confianza,fuente')
    .limit(500);

  let formulasMostradas = 0;
  for (const f of formulas ?? []) {
    const pa = String(f.propiedad_a ?? '').toLowerCase();
    const pb = String(f.propiedad_b ?? '').toLowerCase();
    if (!propsProblema.some(p => pa.includes(p.toLowerCase()) || pb.includes(p.toLowerCase()))) continue;
    formulasMostradas++;
    console.log(`   - ${f.id} | ${f.nombre ?? 'sin nombre'}`);
    console.log(`     relación: ${f.propiedad_a} ↔ ${f.propiedad_b} | tipo=${f.tipo_relacion ?? 'n/d'}`);
    console.log(`     ecuación: ${f.ecuacion ?? 'n/d'}`);
    console.log(`     computable: ${f.forma_computable ?? 'n/d'}`);
    console.log(`     entradas: ${f.variables_input ?? 'n/d'} | salida=${f.output_nombre ?? 'n/d'} ${f.output_unidad ?? ''}`);
    console.log(`     dominio: ${f.dominio_fisico ?? 'n/d'} | rango=${f.rango_valido ?? 'n/d'} | confianza=${f.confianza ?? 'n/d'} | fuente=${f.fuente ?? 'n/d'}`);
    if (formulasMostradas >= 15) break;
  }
  if (!formulasMostradas) console.log('   ⚠️ No hay fórmulas científicas registradas para las propiedades problemáticas.');

  console.log('\n⚡ PASO 6 — Cruces científicos disponibles');
  const { data: cruces } = await supabase
    .from('cruces_cientificos')
    .select('nombre_cruce,propiedades_requeridas,formula,descripcion,problema,activo')
    .eq('activo', true)
    .limit(300);

  let crucesEvaluables = 0;
  const disponibles = new Set(resultado.neuronasActivadas.map(n => n.propertyName));
  for (const c of cruces ?? []) {
    const requeridas = Array.isArray(c.propiedades_requeridas) ? c.propiedades_requeridas.map(String) : [];
    const presentes = requeridas.filter(p => disponibles.has(p));
    if (!presentes.length) continue;
    const cobertura = requeridas.length ? presentes.length / requeridas.length * 100 : 0;
    console.log(`   - ${c.nombre_cruce}: ${presentes.length}/${requeridas.length} (${cobertura.toFixed(0)}%) | ${c.problema ?? c.descripcion ?? ''}`);
    console.log(`     fórmula: ${c.formula ?? 'n/d'}`);
    crucesEvaluables++;
    if (crucesEvaluables >= 20) break;
  }
  if (!crucesEvaluables) console.log('   ⚠️ No hay cruces científicos utilizables con las propiedades disponibles.');

  console.log('\n🧩 PASO 7 — Contradicciones TRIZ');
  const { data: triz } = await supabase
    .from('triz_contradicciones')
    .select('param_triz_mejora,param_triz_empeora,propiedades_mejora,propiedades_empeora,nombres_principios')
    .eq('activo', true)
    .limit(500);

  let trizMostradas = 0;
  for (const t of triz ?? []) {
    const props = [...(Array.isArray(t.propiedades_mejora) ? t.propiedades_mejora : []), ...(Array.isArray(t.propiedades_empeora) ? t.propiedades_empeora : [])].map(String).join(' ').toLowerCase();
    if (!propsProblema.some(p => props.includes(p.toLowerCase()))) continue;
    console.log(`   - mejora=${t.param_triz_mejora ?? 'n/d'} | empeora=${t.param_triz_empeora ?? 'n/d'}`);
    console.log(`     principios: ${Array.isArray(t.nombres_principios) ? t.nombres_principios.slice(0, 5).join(', ') : 'n/d'}`);
    trizMostradas++;
    if (trizMostradas >= 10) break;
  }
  if (!trizMostradas) console.log('   ⚠️ No hay contradicciones TRIZ registradas para las propiedades problemáticas.');

  console.log('\n🏁 RESUMEN DEL DIAGNÓSTICO');
  console.log(`   Neuronas con datos: ${resultado.neuronasConDatos}/${resultado.totalNeuronas}`);
  console.log(`   Problemas: ${problemas.length}`);
  console.log(`   Anomalías: ${anomalías.length}`);
  console.log(`   Propiedades faltantes: ${resultado.propiedadesPendientes.length}`);
  console.log(`   Fórmulas encontradas: ${formulasMostradas}`);
  console.log(`   Cruces utilizables: ${crucesEvaluables}`);
  console.log(`   TRIZ encontrados: ${trizMostradas}`);
  console.log('\n✅ PRUEBA INTEGRAL FINALIZADA — no se modificaron datos de Supabase.\n');
}

main().catch(error => {
  console.error('\n❌ DIAGNÓSTICO INTEGRAL FALLÓ:', error?.message ?? error);
  process.exit(1);
});
