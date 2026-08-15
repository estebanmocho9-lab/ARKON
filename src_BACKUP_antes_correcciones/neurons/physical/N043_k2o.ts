import { NeuronBase } from '../base/NeuronBase';

export class N043_K2O extends NeuronBase {
  readonly neuronId = 'N-043';
  readonly propertyName = 'k2o';
  readonly orientation = 'direct';
  readonly group = 'composition';
  readonly descripcion = 'Contenido de óxido de potasio (K₂O)';
  readonly unidadReferencia = '%';
  readonly relatedProperties = ['na2o', 'cec', 'ph'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 100;
  readonly confianzaPorDefecto = 0.98;
}