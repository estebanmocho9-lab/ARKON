import { NeuronBase } from '../base/NeuronBase';

export class N001_DensidadReal extends NeuronBase {
  readonly neuronId = 'N-001';
  readonly propertyName = 'densidad_real';
  readonly orientation = 'direct';
  readonly group = 'density';
  readonly descripcion = 'Masa por unidad de volumen sólido sin poros';
  readonly unidadReferencia = 'g/cm³';
  readonly relatedProperties = ['densidad_aparente', 'porosidad_total', 'resistencia_compresion'];
  readonly rangoFisicoMin = 0.5;
  readonly rangoFisicoMax = 5.5;
  readonly confianzaPorDefecto = 0.98;
}