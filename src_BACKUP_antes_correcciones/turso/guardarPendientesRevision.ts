// ============================================================
// src/turso/guardarPendientesRevision.ts
// Gemelo de guardarPropiedadesTurso.ts (mismo patrón de conexión
// y de turso.batch), pero para la tabla nueva
// propiedades_pendientes_revision.
//
// DESVÍO NECESARIO de la firma que pedía el documento
// (`guardarLotePendientes(hipotesis: Hipotesis[])`): una Hipotesis
// por sí sola solo tiene IDs (MAT-XXXXXX, PRO-XXXXXX, VAL-XXXXXX...)
// — nunca el texto legible (nombre del material, valor encontrado,
// fragmento). Guardar "MAT-000004" en la columna `material` de la
// tabla de revisión sería inútil para quien tenga que revisarlo a
// mano. Por eso esta función recibe la Hipotesis JUNTO con las
// entidades ya resueltas (Material, Propiedad, Valor, Unidad,
// Evidencia) — que es exactamente lo que ya tiene armado
// neuronaComprension.ts en el momento en que termina de procesar
// un candidato, así que no le cuesta nada extra a quien la llame
// en la integración real (Parte 6).
// ============================================================

import { turso } from './tursoClient';
import { Hipotesis } from '../comprehension-neuron/tipos/hipotesis';
import { Material, Propiedad, Unidad } from '../comprehension-neuron/tipos/entidades';
import { Valor } from '../comprehension-neuron/tipos/valores';
import { Evidencia } from '../comprehension-neuron/tipos/evidencias';

export interface HipotesisConContexto {
  hipotesis: Hipotesis;
  neuronaId: string;
  documento: string;
  driveFileId: string;
  pagina: number | null;
  capitulo: string | null;
  material: Material | null;
  propiedad: Propiedad;
  valor: Valor;
  unidad: Unidad | null;
  evidencia: Evidencia;
}

export async function guardarLotePendientes(items: HipotesisConContexto[]): Promise<void> {
  if (items.length === 0) return;

  // No vuelve a decidir nada — solo guarda lo que la Parte 4 ya
  // decidió. Si alguien pasa una hipótesis que no está PENDIENTE,
  // se ignora acá (defensivo, no debería pasar si el enrutador se
  // usó bien) en vez de guardarla en el lugar equivocado.
  const pendientes = items.filter(i => i.hipotesis.estado === 'PENDIENTE');
  if (pendientes.length === 0) return;

  try {
    await turso.batch(
      pendientes.map(i => ({
        sql: `INSERT INTO propiedades_pendientes_revision (
                neurona_id, documento, drive_file_id, pagina, capitulo,
                nombre_propiedad, material, valor_encontrado, unidad,
                fragmento_texto, validacion_documental, validacion_semantica,
                validacion_dimensional, validacion_fisica, motivo_pendiente
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          i.neuronaId,
          i.documento,
          i.driveFileId,
          i.pagina,
          i.capitulo,
          i.propiedad.nombre_principal,
          i.material?.nombre_principal ?? null,
          i.valor.texto_original,
          i.unidad?.simbolo ?? null,
          i.evidencia.fragmentoTexto,
          i.hipotesis.comprobaciones.documental,
          i.hipotesis.comprobaciones.semantica,
          i.hipotesis.comprobaciones.dimensional,
          i.hipotesis.comprobaciones.fisica,
          i.hipotesis.motivos.join(' | ') || i.hipotesis.motivo || '',
        ],
      })),
      'write'
    );
  } catch (error) {
    console.error('Error guardando lote de pendientes en Turso:', error);
  }
}
