// ============================================================
// cargarComponentesLista.ts
// Carga tu lista de materiales -> componentes a Supabase
// (catalogo_materiales + componentes_materiales), usando el mismo
// cliente que ya usa el resto de la app (src/supabase/client.ts).
//
// - Si el material ya existe en catalogo_materiales (por nombre),
//   NO lo duplica: reutiliza su id_material.
// - Si el componente ya existe para ese material, tampoco lo
//   duplica.
// - No borra ni modifica nada existente, solo agrega lo que falta.
//
// Uso (desde la raíz de ARKON):
//   npx ts-node --transpile-only cargarComponentesLista.ts
// ============================================================

import { supabase } from './src/supabase/client';

// material -> lista de componentes (de tu lista)
const DATOS: Record<string, string[]> = {
  'Talco Industrial': ['Talco (Silicato de Magnesio)', 'Clorita', 'Dolomita', 'Magnesita', 'Cuarzo', 'Calcita'],
  'Cemento Portland': ['Silicato tricálcico (Alita)', 'Silicato dicálcico (Belita)', 'Aluminato tricálcico (Celita)', 'Ferroaluminato tetracálcico (Felita)', 'Yeso (regulador de fraguado)', 'Cal libre', 'Magnesia', 'Álcalis (Na₂O, K₂O)', 'Anhidrita', 'Compuestos minoritarios (TiO₂, Mn₂O₃, P₂O₅, etc.)'],
  'Arcilla Expandida': ['Óxido de silicio', 'Óxido de aluminio', 'Óxido de hierro (III)', 'Óxido de calcio', 'Óxido de magnesio', 'Óxido de potasio', 'Óxido de sodio', 'Dióxido de titanio', 'Óxido de manganeso', 'Piroclastos / vidrio volcánico', 'Arcillas (caolinita, illita, montmorillonita)', 'Materia orgánica'],
  'Cal Hidráulica': ['Óxido de calcio (cal viva)', 'Hidróxido de calcio', 'Dióxido de silicio reactivo', 'Aluminato de calcio hidratado', 'Silicato de calcio hidratado', 'Carbonato de calcio', 'Óxido de magnesio', 'Óxido de aluminio', 'Óxido de hierro', 'Álcalis (K₂O, Na₂O)'],
  'Perlita Expandida': ['Óxido de silicio', 'Óxido de aluminio', 'Óxido de sodio', 'Óxido de potasio', 'Óxido de calcio', 'Óxido de magnesio', 'Óxido de hierro', 'Dióxido de titanio', 'Agua (estructural)'],
  'Bentonita Sódica': ['Montmorillonita sódica', 'Cuarzo', 'Feldespato', 'Cristobalita', 'Illita', 'Caolinita', 'Calcita / Dolomita', 'Óxidos de hierro', 'Óxido de magnesio', 'Óxido de potasio', 'Óxido de sodio', 'Materia orgánica'],
  'Vermiculita expandida': ['Vermiculita (filosilicato)', 'Cuarzo', 'Feldespato', 'Biotita', 'Clorita', 'Óxido de hierro', 'Óxido de magnesio', 'Óxido de calcio', 'Óxido de aluminio'],
  'Humo de Sílice': ['Sílice amorfa', 'Carbono (hollín)', 'Óxido de aluminio', 'Óxido de hierro', 'Óxido de calcio', 'Óxido de magnesio', 'Álcalis (Na₂O + K₂O)', 'Dióxido de titanio', 'Azufre'],
  'Vidrio Molido': ['Óxido de silicio', 'Óxido de sodio', 'Óxido de calcio', 'Óxido de magnesio', 'Óxido de aluminio', 'Óxido de potasio', 'Óxido de hierro', 'Trióxido de azufre', 'Óxido de bario', 'Óxido de zinc'],
  'Yeso Molido': ['Sulfato de calcio dihidratado', 'Carbonato de calcio', 'Arcillas (caolinita, illita)', 'Cuarzo', 'Óxido de hierro', 'Óxido de magnesio', 'Álcalis', 'Anhidrita (yeso deshidratado)'],
  'Resina Epoxi': ['Resina de Bisfenol-A diglicidil éter (DGEBA)', 'Diluyentes reactivos (alcoholes glicidílicos)', 'Aditivos modificadores de reología', 'Agentes anti-espuma', 'Estabilizadores (antioxidantes)', 'Poliaminoamida', 'Trietilenetetramina (TETA)', 'Aceleradores (salicilato de sodio, etc.)', 'Diluyentes no reactivos', 'Agentes de acoplamiento'],
  'Resina Poliéster': ['Poliéster insaturado (basado en ácido maleico/ftálico y glicoles)', 'Estireno (monómero reactivo + diluyente)', 'Acelerador (octoato de cobalto)', 'Inhibidor (hidroquinona, terc-butilcatecol)', 'Agentes tixotrópicos (sílice pirogénica)', 'Parafina (para curado al aire)', 'Estabilizadores UV'],
  'Tiza Molida': ['Carbonato de calcio', 'Carbonato de magnesio', 'Óxido de hierro', 'Óxido de aluminio', 'Dióxido de silicio', 'Materia orgánica (en tiza natural)', 'Agua'],
  'Fibra de Vidrio': ['Óxido de silicio', 'Óxido de aluminio', 'Óxido de calcio', 'Óxido de boro', 'Óxido de magnesio', 'Óxido de sodio', 'Óxido de potasio', 'Óxido de hierro', 'Dióxido de titanio', 'Fluoruros'],
  'Cartón Triturado': ['Celulosa', 'Hemicelulosa', 'Lignina', 'Agua', 'Carbonato de calcio (carga mineral)', 'Caolín (arcilla)', 'Colas, adhesivos, resinas', 'Almidón (encolado)', 'Tintas (pigmentos, negro de carbón)', 'Alumbre (sulfato de aluminio)'],
  'Queratina': ['Queratina (alfa o beta)', 'Agua', 'Lípidos (grasas)', 'Cenizas (minerales)', 'Cistina', 'Aminoácidos libres'],
  'Piedra Pómez': ['Óxido de silicio', 'Óxido de aluminio', 'Óxido de potasio', 'Óxido de sodio', 'Óxido de calcio', 'Óxido de hierro (FeO + Fe₂O₃)', 'Óxido de magnesio', 'Dióxido de titanio', 'Óxido de manganeso', 'Fósforo (P₂O₅)', 'Azufre', 'Cloro, flúor'],
  'Bagazo de Caña': ['Celulosa', 'Hemicelulosa', 'Lignina', 'Agua', 'Cenizas (minerales)', 'Ceras / extractivos', 'Proteínas'],
  'Carbón Activado': ['Carbono amorfo (microcristalino)', 'Cenizas (minerales)', 'Agua', 'Azufre', 'Nitrógeno', 'Oxígeno en grupos funcionales'],
  'Ocre Rojo': ['Hematita', 'Caolinita', 'Cuarzo', 'Calcita', 'Yeso', 'Goethita', 'Óxido de manganeso', 'Óxido de magnesio', 'Óxido de aluminio', 'Dióxido de silicio amorfo', 'Agua (higroscópica)'],
  'Ocre Amarillo': ['Goethita', 'Caolinita', 'Cuarzo', 'Calcita', 'Hematita', 'Yeso', 'Óxido de manganeso', 'Óxido de magnesio', 'Óxido de aluminio', 'Agua (higroscópica)'],
};

async function main() {
  let materialesCreados = 0;
  let materialesExistentes = 0;
  let componentesCreados = 0;
  let componentesExistentes = 0;

  for (const [nombreMaterial, componentes] of Object.entries(DATOS)) {
    // 1) Buscar si el material ya existe
    const { data: existente, error: errorBusqueda } = await supabase
      .from('catalogo_materiales')
      .select('id_material')
      .eq('nombre', nombreMaterial)
      .maybeSingle();

    if (errorBusqueda) {
      console.error(`❌ Error buscando "${nombreMaterial}": ${errorBusqueda.message}`);
      continue;
    }

    let idMaterial: string;

    if (existente) {
      idMaterial = (existente as any).id_material;
      materialesExistentes++;
      console.log(`↪️  "${nombreMaterial}" ya existía en catalogo_materiales`);
    } else {
      const { data: creado, error: errorInsert } = await supabase
        .from('catalogo_materiales')
        .insert({ nombre: nombreMaterial, familia: 'Sin clasificar' })
        .select('id_material')
        .single();

      if (errorInsert || !creado) {
        console.error(`❌ Error creando material "${nombreMaterial}": ${errorInsert?.message}`);
        continue;
      }
      idMaterial = (creado as any).id_material;
      materialesCreados++;
      console.log(`✅ Material creado: "${nombreMaterial}"`);
    }

    // 2) Cargar componentes de ese material
    for (const nombreComponente of componentes) {
      const { data: compExistente } = await supabase
        .from('componentes_materiales')
        .select('id')
        .eq('nombre', nombreComponente)
        .eq('id_material', idMaterial)
        .maybeSingle();

      if (compExistente) {
        componentesExistentes++;
        continue;
      }

      const { error: errorComp } = await supabase
        .from('componentes_materiales')
        .insert({ nombre: nombreComponente, id_material: idMaterial });

      if (errorComp) {
        console.error(`   ❌ Error creando componente "${nombreComponente}" de "${nombreMaterial}": ${errorComp.message}`);
      } else {
        componentesCreados++;
      }
    }
    console.log(`   → ${componentes.length} componentes de "${nombreMaterial}" procesados`);
  }

  console.log('\n🏁 Terminado.');
  console.log(`Materiales creados: ${materialesCreados} | ya existían: ${materialesExistentes}`);
  console.log(`Componentes creados: ${componentesCreados} | ya existían: ${componentesExistentes}`);
}

main().catch((err) => {
  console.error('Error general:', err);
  process.exit(1);
});
