import { NeuronBase } from '../base/NeuronBase';

export class N039_Fe2O3 extends NeuronBase {
  readonly neuronId = 'N-039';
  readonly propertyName = 'fe2o3';
  readonly orientation = 'direct';
  readonly group = 'composition';
  readonly descripcion = 'Contenido de óxido férrico (Fe₂O₃)';
  readonly unidadReferencia = '%';
  readonly relatedProperties = ['sio2', 'al2o3', 'conductividad_electrica'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 100;
  readonly confianzaPorDefecto = 0.98;
}