import { NeuronBase } from '../base/NeuronBase';

export class N045_AnguloContacto extends NeuronBase {
  readonly neuronId = 'N-045';
  readonly propertyName = 'angulo_contacto';
  readonly orientation = 'direct';
  readonly group = 'surface';
  readonly descripcion = 'Ángulo de contacto con agua';
  readonly unidadReferencia = '°';
  readonly relatedProperties = ['energia_superficial', 'absorcion_agua', 'trabajo_adhesion'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 180;
  readonly confianzaPorDefecto = 0.95;
}