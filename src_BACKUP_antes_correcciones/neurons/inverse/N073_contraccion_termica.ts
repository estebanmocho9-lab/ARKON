import { NeuronBase } from '../base/NeuronBase';

export class N073_ContraccionTermica extends NeuronBase {
  readonly neuronId = 'N-73-INV';
  readonly propertyName = 'contraccion_termica';
  readonly orientation = 'inverse' as const;
  readonly group = 'thermal';
  readonly descripcion = 'Contracción térmica — tendencia a contraerse con el frío';
  readonly unidadReferencia = '10⁻⁶/°C';
  readonly relatedProperties = ['complacencia_elastica', 'resistividad_termica'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 50;
  readonly confianzaPorDefecto = 0.95;
}
