// ============================================================
// src/comprehension-neuron/razonamiento/construirRelaciones.ts
// Junta Material + Propiedad + Valor + Unidad + Evidencia en una
// "relación candidata" — que es EXACTAMENTE lo que la Parte 1 ya
// llamó Hipótesis (tipos/hipotesis.ts): "una Relación TODAVÍA no
// validada". La Sección 30 de este documento describe ese mismo
// concepto con otras palabras ("RELACIÓN CANDIDATA, no DATO
// VALIDADO") — en vez de crear un tipo paralelo que signifique lo
// mismo, se usa Hipotesis tal cual ya existía. REL (tipos/
// relaciones.ts) queda reservado para lo que la Parte 4 confirme
// como ACEPTADO — no lo produce esta Parte 3.
// ============================================================

import { Id, registroIds } from '../tipos/ids';
import { Material, Propiedad, Unidad } from '../tipos/entidades';
import { Valor } from '../tipos/valores';
import { Evidencia } from '../tipos/evidencias';
import { Hipotesis } from '../tipos/hipotesis';

export function construirRelacionCandidata(material: Material | null, propiedad: Propiedad, valor: Valor, unidad: Unidad | null, evidencia: Evidencia): Hipotesis {
  const claveHipotesis = `${material?.id ?? 'sin-material'}::${propiedad.id}::${valor.id}::${evidencia.id}`;

  return {
    id: registroIds.obtenerOAsignar('HYP', claveHipotesis) as Id<'HYP'>,
    material: material?.id ?? null,
    propiedad: propiedad.id,
    valor: valor.id,
    unidad: unidad?.id ?? null,
    evidencia: evidencia.id,
    // Las cinco comprobaciones quedan en UNKNOWN — esta Parte 3 NO
    // decide todavía si la relación es válida (Sección 32: "no
    // crear el decisor final"). Eso corre en la Parte 4, que va a
    // completar este mismo objeto con los resultados reales de
    // validadorDimensional.ts, validadorFisico.ts, y los
    // validadores documental/semántico que todavía faltan.
    comprobaciones: {
      documental: 'UNKNOWN',
      semantica: 'UNKNOWN',
      dimensional: 'UNKNOWN',
      matematica: 'UNKNOWN',
      fisica: 'UNKNOWN',
      evidencia: 'UNKNOWN',
    },
    estado: 'PENDIENTE',
    motivo: 'Relación candidata construida por la Parte 3 — todavía no pasó por los validadores de la Parte 4.',
    motivos: [],
    fechaEvaluacion: null,
  };
}
