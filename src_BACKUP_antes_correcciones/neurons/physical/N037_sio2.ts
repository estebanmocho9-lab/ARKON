import { NeuronBase } from '../base/NeuronBase';

export class N037_SiO2 extends NeuronBase {
  readonly neuronId = 'N-037';
  readonly propertyName = 'sio2';
  readonly orientation = 'direct';
  readonly group = 'composition';
  readonly descripcion = 'Contenido de dióxido de silicio (SiO₂)';
  readonly unidadReferencia = '%';
  readonly relatedProperties = ['al2o3', 'cao', 'ph'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 100;
  readonly confianzaPorDefecto = 0.98;
}