import { NeuronBase } from '../base/NeuronBase';

export class N038_Al2O3 extends NeuronBase {
  readonly neuronId = 'N-038';
  readonly propertyName = 'al2o3';
  readonly orientation = 'direct';
  readonly group = 'composition';
  readonly descripcion = 'Contenido de alúmina (Al₂O₃)';
  readonly unidadReferencia = '%';
  readonly relatedProperties = ['sio2', 'fe2o3', 'cec'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 100;
  readonly confianzaPorDefecto = 0.98;
}