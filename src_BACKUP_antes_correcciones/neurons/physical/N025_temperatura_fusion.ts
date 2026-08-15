import { NeuronBase } from '../base/NeuronBase';

export class N025_TemperaturaFusion extends NeuronBase {
  readonly neuronId = 'N-025';
  readonly propertyName = 'temperatura_fusion';
  readonly orientation = 'direct';
  readonly group = 'thermal_limits';
  readonly descripcion = 'Temperatura de fusión del material';
  readonly unidadReferencia = '°C';
  readonly relatedProperties = ['temperatura_servicio', 'expansion_termica', 'calor_especifico'];
  readonly rangoFisicoMin = 100;
  readonly rangoFisicoMax = 3000;
  readonly confianzaPorDefecto = 0.98;
}