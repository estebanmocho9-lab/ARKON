import { NeuronBase } from '../base/NeuronBase';

export class N005_IndiceVacios extends NeuronBase {
  readonly neuronId = 'N-005';
  readonly propertyName = 'indice_vacios';
  readonly orientation = 'direct';
  readonly group = 'porosity';
  readonly descripcion = 'Relación entre volumen de vacíos y volumen de sólidos';
  readonly unidadReferencia = 'adimensional';
  readonly relatedProperties = ['porosidad_total', 'densidad_aparente', 'densidad_real'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 10;
  readonly confianzaPorDefecto = 0.95;
}
