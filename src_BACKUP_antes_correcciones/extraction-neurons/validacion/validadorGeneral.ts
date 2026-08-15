// ============================================================
// src/extraction-neurons/validacion/validadorGeneral.ts
// Última parada antes de Turso. Recibe lo que armó el
// Consolidador para un bloque y decide, registro por registro,
// si se guarda, y dos cosas más: si hay que forzar el nivel de
// confianza para abajo, o si hay que descartar el bloque ENTERO
// sin mirar el contenido.
//
// Va en una carpeta nueva, validacion/, separada de
// consolidacion/ a propósito (Regla del Manual I: "Nunca se
// modificarán las memorias" desde acá) — el Consolidador arma,
// el Validador decide. Así el día de mañana se puede cambiar una
// regla de validación (por ejemplo, endurecer el umbral de
// confianza) sin tocar la lógica de cómo se arman los registros.
//
// Esto es lo que resuelve tu bug de forma explícita y auditable:
// antes de mirar un solo registro, se pregunta si el bloque
// entero es un índice/bibliografía/referencias. Si lo es, se
// descarta todo de una, sin importar qué palabras haya adentro
// ni qué tan bien armado esté el registro — un dato bien armado
// que viene de un índice sigue siendo un dato falso.
// ============================================================

import { BloqueMaterial, esBloqueDescartable } from '../comprension/gestorBloques';
import { RegistroConsolidado } from '../consolidacion/consolidador';

export interface RegistroDescartado {
  registro: RegistroConsolidado;
  motivo: string;
}

export interface ResultadoValidacion {
  validos: RegistroConsolidado[];
  descartados: RegistroDescartado[];
  // true si se descartó el bloque completo por ser estructural
  // (índice/bibliografía/referencias) — útil para logging, así
  // en la consola queda visible que el sistema SÍ se dio cuenta
  // de que esa página era un índice, en vez de fallar en
  // silencio como pasaba antes.
  bloqueDescartadoPorEstructura: boolean;
}

export function validarBloque(bloque: BloqueMaterial, registros: RegistroConsolidado[]): ResultadoValidacion {
  // ── Regla 1, la del bug: bloque estructural → cero registros,
  //    sin excepción. Esto es lo que le faltaba al sistema viejo:
  //    nunca existía este punto de corte. ──────────────────────────
  if (esBloqueDescartable(bloque)) {
    return {
      validos: [],
      descartados: registros.map(r => ({
        registro: r,
        motivo: `Bloque descartado: nodo estructural de tipo "${bloque.tipoNodoDominante}" (${bloque.capituloActivo ?? 'sin capítulo'}), no contiene datos reales`,
      })),
      bloqueDescartadoPorEstructura: true,
    };
  }

  const validos: RegistroConsolidado[] = [];
  const descartados: RegistroDescartado[] = [];

  for (const registro of registros) {
    // ── Regla 2: sin material, no se guarda. El Consolidador ya
    //    filtra la mayoría de estos casos mandándolos a
    //    "candidatos" antes de llegar acá, pero se revalida por
    //    las dudas — un registro nunca debería llegar con material
    //    null, y si llega, no pasa. ─────────────────────────────────
    if (!registro.material) {
      descartados.push({ registro, motivo: 'Sin material asociado' });
      continue;
    }

    // ── Regla 3: sin valor numérico Y sin ser una categoría que no
    //    lo necesita (Constante/Ecuación/Ley), no se guarda. Ídem
    //    Regla 2, el Consolidador ya filtra esto, se revalida acá
    //    porque es justo la regla que faltaba para el caso
    //    "resina epoxi sin valores" — nunca debería llegar un
    //    registro así, pero si llega por algún camino nuevo que se
    //    agregue después, se corta acá también. ─────────────────────
    const noNecesitaValor = ['Constante', 'Ecuación', 'Ley'].includes(registro.categoria ?? '');
    if (!registro.valor_encontrado && !registro.ecuacion_formula && !noNecesitaValor) {
      descartados.push({ registro, motivo: 'Sin valor numérico ni ecuación, y la categoría lo requiere' });
      continue;
    }

    validos.push(registro);
  }

  return { validos, descartados, bloqueDescartadoPorEstructura: false };
}
