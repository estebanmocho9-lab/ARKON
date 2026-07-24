import { NeuronBase } from '../base/NeuronBase';

export class N075_Solidificacion extends NeuronBase {
  readonly neuronId = 'N-75-INV';
  readonly propertyName = 'solidificacion';
  readonly orientation = 'inverse' as const;
  readonly group = 'thermal';
  readonly descripcion = 'Temperatura de solidificación — punto de transición líquido/sólido';
  readonly unidadReferencia = '°C';
  readonly relatedProperties = ['temperatura_falla', 'resistividad_termica'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 3000;
  readonly confianzaPorDefecto = 0.95;
}
