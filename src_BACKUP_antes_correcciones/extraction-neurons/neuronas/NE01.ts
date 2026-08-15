// ============================================================
// src/extraction-neurons/neuronas/NE01.ts
// Neurona de extracción para la subcarpeta "01" de Drive.
// Toda la lógica real vive en NeuronExtraccionBase.
// ============================================================

import { NeuronExtraccionBase } from '../base/NeuronExtraccionBase';

export class NE01 extends NeuronExtraccionBase {
  readonly neuronId = 'NE-01';
  readonly numeroCarpeta = '01';
}
