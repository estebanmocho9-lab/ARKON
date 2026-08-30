// test-mezcla-simulada.ts
// Este script prueba la lógica de mezcla sin necesidad de Supabase real.
// Usa valores simulados para los componentes.

const mockSupabase = {
  from: (table: string) => ({
    select: (_fields: string) => ({
      eq: (_col: string, val: any) => ({
        eq: (_col2: string, val2: any) => ({
          maybeSingle: async () => {
            if (table === 'datos_materiales') {
              const mockData: Record<string, number> = {
                'YESO:densidad_aparente': 55,
                'PERLITA:densidad_aparente': 30,
                'TALCO:densidad_aparente': 45,
              };
              const key = `${val}:${val2}`;
              const valor = mockData[key];
              if (valor !== undefined) return { data: { valor_normalizado: valor }, error: null };
            }
            return { data: null, error: null };
          }
        })
      })
    })
  })
} as any;

// Este test está dentro de src/neurons/, por eso los imports suben un nivel.
import * as supabaseModule from '../supabase/client';
const originalSupabase = supabaseModule.supabase;
(supabaseModule as any).supabase = mockSupabase;

import { N002_DensidadAparente } from './physical/N002_densidad_aparente';

async function test() {
  console.log('=== PRUEBA DE MEZCLA SIMULADA (densidad aparente) ===\n');

  const neurona = new N002_DensidadAparente();
  const resultado = await neurona.process({
    materialId: 'MEZCLA-TEST',
    estado: 'E01',
    componentes: [
      { materialId: 'YESO', fraccion: 0.75 },
      { materialId: 'PERLITA', fraccion: 0.10 },
      { materialId: 'TALCO', fraccion: 0.10 },
      { materialId: 'ADITIVO', fraccion: 0.05 }
    ]
  });

  console.log('Resultado de la mezcla:');
  console.log(`  Valor compuesto (0-100): ${resultado.valorCompuesto}`);
  console.log(`  Valor inverso: ${resultado.valorInverso}`);
  console.log(`  Anomalías: ${resultado.anomalias.length ? resultado.anomalias : 'ninguna'}`);
  console.log(`  Confianza: ${resultado.confianza}`);

  (supabaseModule as any).supabase = originalSupabase;
}

test().catch(console.error);