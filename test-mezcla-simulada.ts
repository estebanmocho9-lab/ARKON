// test-mezcla-simulada.ts
// Prueba de l�gica de mezcla con valores simulados (sin Supabase real)

// --- Mock de Supabase ---
const mockSupabase = {
  from: (table: string) => ({
    select: (fields: string) => ({
      eq: (col: string, val: any) => ({
        eq: (col2: string, val2: any) => ({
          maybeSingle: async () => {
            if (table === 'datos_materiales') {
              const mockData: Record<string, number> = {
                'YESO:densidad_aparente': 55,
                'PERLITA:densidad_aparente': 30,
                'TALCO:densidad_aparente': 45,
              };
              const key = `${val}:${val2}`;
              const valor = mockData[key];
              if (valor !== undefined) {
                return { data: { valor_normalizado: valor }, error: null };
              }
            }
            return { data: null, error: null };
          }
        })
      })
    })
  })
} as any;

import * as supabaseModule from './src/supabase/client';
const originalSupabase = supabaseModule.supabase;
(supabaseModule as any).supabase = mockSupabase;

import { N002_DensidadAparente } from './src/neurons/physical/N002_densidad_aparente';

async function test() {
  console.log('=== PRUEBA DE MEZCLA SIMULADA ===\n');
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
  console.log('Valor compuesto:', resultado.valorCompuesto);
  console.log('Valor inverso:', resultado.valorInverso);
  console.log('Anomal�as:', resultado.anomalias.length ? resultado.anomalias : 'ninguna');
}

test().catch(console.error);