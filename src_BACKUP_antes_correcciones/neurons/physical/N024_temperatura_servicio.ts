import { NeuronBase } from '../base/NeuronBase';

export class N024_TemperaturaServicio extends NeuronBase {
  readonly neuronId = 'N-024';
  readonly propertyName = 'temperatura_servicio';
  readonly orientation = 'direct';
  readonly group = 'thermal_limits';
  readonly descripcion = 'Temperatura máxima de servicio sin degradación significativa';
  readonly unidadReferencia = '°C';
  readonly relatedProperties = ['expansion_termica', 'temperatura_fusion', 'calor_especifico'];
  readonly rangoFisicoMin = -50;
  readonly rangoFisicoMax = 2000;
  readonly confianzaPorDefecto = 0.97;
}