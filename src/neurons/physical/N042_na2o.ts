import { NeuronBase } from '../base/NeuronBase';

export class N042_Na2O extends NeuronBase {
  readonly neuronId = 'N-042';
  readonly propertyName = 'na2o';
  readonly orientation = 'direct';
  readonly group = 'composition';
  readonly descripcion = 'Contenido de óxido de sodio (Na₂O)';
  readonly unidadReferencia = '%';
  readonly relatedProperties = ['k2o', 'ph', 'conductividad_electrica'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 100;
  readonly confianzaPorDefecto = 0.98;
}