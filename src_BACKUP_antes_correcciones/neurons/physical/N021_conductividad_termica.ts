import { NeuronBase } from '../base/NeuronBase';

export class N021_ConductividadTermica extends NeuronBase {
  readonly neuronId = 'N-021';
  readonly propertyName = 'conductividad_termica';
  readonly orientation = 'direct';
  readonly group = 'thermal';
  readonly descripcion = 'Capacidad de transmitir calor por conducción';
  readonly unidadReferencia = 'W/(m·K)';
  readonly relatedProperties = ['porosidad_total', 'calor_especifico', 'difusividad_termica'];
  readonly rangoFisicoMin = 0.01;
  readonly rangoFisicoMax = 500;
  readonly confianzaPorDefecto = 0.95;
}