import { NeuronBase } from '../base/NeuronBase';

export class N041_MgO extends NeuronBase {
  readonly neuronId = 'N-041';
  readonly propertyName = 'mgo';
  readonly orientation = 'direct';
  readonly group = 'composition';
  readonly descripcion = 'Contenido de óxido de magnesio (MgO)';
  readonly unidadReferencia = '%';
  readonly relatedProperties = ['cao', 'sio2', 'expansion_termica'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 100;
  readonly confianzaPorDefecto = 0.98;
}