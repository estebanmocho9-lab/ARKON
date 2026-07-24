import { NeuronBase } from '../base/NeuronBase';

export class N032_Ph extends NeuronBase {
  readonly neuronId = 'N-032';
  readonly propertyName = 'ph';
  readonly orientation = 'direct';
  readonly group = 'chemical';
  readonly descripcion = 'pH en solución acuosa';
  readonly unidadReferencia = 'adimensional';
  readonly relatedProperties = ['cao', 'cec', 'potencial_zeta'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 14;
  readonly confianzaPorDefecto = 0.98;
}