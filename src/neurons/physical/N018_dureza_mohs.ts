import { NeuronBase } from '../base/NeuronBase';

export class N018_DurezaMohs extends NeuronBase {
  readonly neuronId = 'N-018';
  readonly propertyName = 'dureza_mohs';
  readonly orientation = 'direct';
  readonly group = 'mechanical';
  readonly descripcion = 'Dureza según escala de Mohs (1 a 10)';
  readonly unidadReferencia = 'adimensional';
  readonly relatedProperties = ['resistencia_compresion', 'angulo_friccion', 'energia_superficial'];
  readonly rangoFisicoMin = 1;
  readonly rangoFisicoMax = 10;
  readonly confianzaPorDefecto = 0.95;
}