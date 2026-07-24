import { NeuronBase } from '../base/NeuronBase';

export class N003_PorosidadTotal extends NeuronBase {
  readonly neuronId = 'N-003';
  readonly propertyName = 'porosidad_total';
  readonly orientation = 'direct';
  readonly group = 'porosity';
  readonly descripcion = 'Fracción de volumen de vacíos respecto al volumen total';
  readonly unidadReferencia = '%';
  readonly relatedProperties = ['densidad_aparente', 'absorcion_agua', 'resistencia_compresion'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 100;
  readonly confianzaPorDefecto = 0.95;
}