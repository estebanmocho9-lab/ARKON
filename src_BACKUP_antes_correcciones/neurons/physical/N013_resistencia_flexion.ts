import { NeuronBase } from '../base/NeuronBase';

export class N013_ResistenciaFlexion extends NeuronBase {
  readonly neuronId = 'N-013';
  readonly propertyName = 'resistencia_flexion';
  readonly orientation = 'direct';
  readonly group = 'mechanical';
  readonly descripcion = 'Tensión máxima de flexión antes de la fractura';
  readonly unidadReferencia = 'MPa';
  readonly relatedProperties = ['resistencia_compresion', 'resistencia_traccion', 'modulo_young'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 50;
  readonly confianzaPorDefecto = 0.95;
}
