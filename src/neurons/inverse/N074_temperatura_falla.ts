import { NeuronBase } from '../base/NeuronBase';

export class N074_TemperaturaFalla extends NeuronBase {
  readonly neuronId = 'N-74-INV';
  readonly propertyName = 'temperatura_falla';
  readonly orientation = 'inverse' as const;
  readonly group = 'thermal';
  readonly descripcion = 'Temperatura de falla o degradación del material';
  readonly unidadReferencia = '°C';
  readonly relatedProperties = ['resistividad_termica', 'contraccion_termica'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 2000;
  readonly confianzaPorDefecto = 0.95;
}
