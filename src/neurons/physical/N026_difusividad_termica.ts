import { NeuronBase } from '../base/NeuronBase';

export class N026_DifusividadTermica extends NeuronBase {
  readonly neuronId = 'N-026';
  readonly propertyName = 'difusividad_termica';
  readonly orientation = 'direct';
  readonly group = 'thermal';
  readonly descripcion = 'Velocidad de propagación de cambios de temperatura';
  readonly unidadReferencia = 'mm²/s';
  readonly relatedProperties = ['conductividad_termica', 'calor_especifico', 'densidad_aparente'];
  readonly rangoFisicoMin = 0.01;
  readonly rangoFisicoMax = 1000;
  readonly confianzaPorDefecto = 0.95;
}