import { NeuronBase } from '../base/NeuronBase';

export class N022_CalorEspecifico extends NeuronBase {
  readonly neuronId = 'N-022';
  readonly propertyName = 'calor_especifico';
  readonly orientation = 'direct';
  readonly group = 'thermal';
  readonly descripcion = 'Energía necesaria para elevar la temperatura de 1 kg en 1 K';
  readonly unidadReferencia = 'J/(kg·K)';
  readonly relatedProperties = ['conductividad_termica', 'difusividad_termica', 'densidad_aparente'];
  readonly rangoFisicoMin = 100;
  readonly rangoFisicoMax = 5000;
  readonly confianzaPorDefecto = 0.95;
}