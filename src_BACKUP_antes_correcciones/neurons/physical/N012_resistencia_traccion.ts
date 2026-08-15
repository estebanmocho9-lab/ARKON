import { NeuronBase } from '../base/NeuronBase';

export class N012_ResistenciaTraccion extends NeuronBase {
  readonly neuronId = 'N-012';
  readonly propertyName = 'resistencia_traccion';
  readonly orientation = 'direct';
  readonly group = 'mechanical';
  readonly descripcion = 'Tensión máxima de tracción antes de la falla';
  readonly unidadReferencia = 'MPa';
  readonly relatedProperties = ['resistencia_compresion', 'modulo_young', 'cohesion'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 100;
  readonly confianzaPorDefecto = 0.95;
}
