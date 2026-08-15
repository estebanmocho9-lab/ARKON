import { NeuronBase } from '../base/NeuronBase';

export class N011_ResistenciaCompresion extends NeuronBase {
  readonly neuronId = 'N-011';
  readonly propertyName = 'resistencia_compresion';
  readonly orientation = 'direct';
  readonly group = 'mechanical';
  readonly descripcion = 'Tensión máxima de compresión antes de la falla';
  readonly unidadReferencia = 'MPa';
  readonly relatedProperties = ['porosidad_total', 'resistencia_traccion', 'modulo_young'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 500;
  readonly confianzaPorDefecto = 0.95;
}