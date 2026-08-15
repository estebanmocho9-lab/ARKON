import { NeuronBase } from '../base/NeuronBase';

export class N002_DensidadAparente extends NeuronBase {
  readonly neuronId = 'N-002';
  readonly propertyName = 'densidad_aparente';
  readonly orientation = 'direct';
  readonly group = 'density';
  readonly descripcion = 'Masa por unidad de volumen total (incluyendo poros)';
  readonly unidadReferencia = 'g/cm³';
  readonly relatedProperties = ['densidad_real', 'porosidad_total', 'absorcion_agua'];
  readonly rangoFisicoMin = 0.1;
  readonly rangoFisicoMax = 3.0;
  readonly confianzaPorDefecto = 0.95;
}