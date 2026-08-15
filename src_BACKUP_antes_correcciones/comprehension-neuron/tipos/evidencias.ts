// ============================================================
// src/comprehension-neuron/tipos/evidencias.ts
// EVI — la prueba. Responde: "¿de dónde salió exactamente esta
// afirmación?". Toda Relación ACEPTADA tiene que poder señalar a
// una Evidencia concreta (Regla 10 de tu documento: toda
// afirmación aceptada debe poder rastrearse hasta evidencia
// concreta del documento).
// ============================================================

import { Id } from './ids';
import { CoordenadaCompleta } from './coordenadas';

export interface Evidencia {
  id: Id<'EVI'>;
  coordenada: CoordenadaCompleta;
  // El fragmento de texto real, tal como está en el documento —
  // esto es lo que le permite a un humano (o a otra IA) confirmar
  // la afirmación sin ir a abrir el PDF de nuevo.
  fragmentoTexto: string;
  // Qué entidades participan de esta evidencia — para que se
  // pueda preguntar "¿qué evidencia respalda esta relación?" y
  // recibir el fragmento exacto, no una referencia vaga.
  entidadesInvolucradas: Id[];
}
