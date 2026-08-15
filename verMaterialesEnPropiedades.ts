// ============================================================
// verMaterialesEnPropiedades.ts
// Solo lectura — no borra nada. Cuenta cuántas filas de
// propiedades_extraidas hay por cada valor de "material", para
// ver de un vistazo cuáles son basura (categorías genéricas
// viejas de MATERIALES_SEMILLA, ya sacadas del código pero cuyas
// filas viejas siguen en la tabla) y cuáles son materiales reales
// de tu catálogo.
//
// Uso: npx ts-node --transpile-only verMaterialesEnPropiedades.ts
// ============================================================

import { turso } from './src/turso/tursoClient';

// Las categorías genéricas que sacamos de MATERIALES_SEMILLA —
// si aparecen acá, son candidatas a basura.
const CATEGORIAS_GENERICAS_VIEJAS = [
  'Polímero termoplástico', 'Polímero termoestable', 'Cerámico técnico',
  'Cerámico poroso', 'Yeso', 'Cal', 'Cemento', 'Arcilla', 'Vidrio',
  'Madera', 'Elastómero', 'Espuma polimérica', 'Compuesto CFRP',
  'Compuesto GFRP', 'Granito', 'Arena', 'Acero', 'Aluminio', 'Cobre',
];

async function main() {
  const totalRes = await turso.execute('SELECT COUNT(*) as total FROM propiedades_extraidas');
  const total = (totalRes.rows[0] as any).total;
  console.log(`📊 Total de filas en propiedades_extraidas: ${total}\n`);

  const porMaterial = await turso.execute(
    `SELECT material, COUNT(*) as cantidad FROM propiedades_extraidas
     GROUP BY material ORDER BY cantidad DESC`
  );

  let totalGenerico = 0;
  let totalReal = 0;
  let totalSinMaterial = 0;

  console.log('── Genéricas viejas (candidatas a borrar) ──');
  for (const fila of porMaterial.rows) {
    const material = (fila as any).material as string | null;
    const cantidad = (fila as any).cantidad as number;
    if (material && CATEGORIAS_GENERICAS_VIEJAS.some(g => g.toLowerCase() === material.toLowerCase())) {
      console.log(`  ${material}: ${cantidad} filas`);
      totalGenerico += cantidad;
    }
  }

  console.log('\n── Sin material (columna vacía/null) ──');
  for (const fila of porMaterial.rows) {
    const material = (fila as any).material as string | null;
    const cantidad = (fila as any).cantidad as number;
    if (!material) {
      console.log(`  (vacío): ${cantidad} filas`);
      totalSinMaterial += cantidad;
    }
  }

  console.log('\n── Materiales reales (se quedan, no se tocan) ──');
  for (const fila of porMaterial.rows) {
    const material = (fila as any).material as string | null;
    const cantidad = (fila as any).cantidad as number;
    if (material && !CATEGORIAS_GENERICAS_VIEJAS.some(g => g.toLowerCase() === material.toLowerCase())) {
      console.log(`  ${material}: ${cantidad} filas`);
      totalReal += cantidad;
    }
  }

  console.log(`\n🏁 Resumen: ${totalGenerico} filas de categorías genéricas viejas | ${totalSinMaterial} sin material | ${totalReal} de materiales reales.`);
}

main().catch((err) => {
  console.error('Error general:', err);
  process.exit(1);
});
