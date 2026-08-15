import { NeuronBase } from '../base/NeuronBase';

export class N040_CaO extends NeuronBase {
  readonly neuronId = 'N-040';
  readonly propertyName = 'cao';
  readonly orientation = 'direct';
  readonly group = 'composition';
  readonly descripcion = 'Contenido de óxido de calcio (CaO)';
  readonly unidadReferencia = '%';
  readonly relatedProperties = ['ph', 'mgo', 'resistencia_compresion'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 100;
  readonly confianzaPorDefecto = 0.98;
}