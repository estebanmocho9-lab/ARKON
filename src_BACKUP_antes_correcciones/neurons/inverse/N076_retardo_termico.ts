import { NeuronBase } from '../base/NeuronBase';

export class N076_RetardoTermico extends NeuronBase {
  readonly neuronId = 'N-76-INV';
  readonly propertyName = 'retardo_termico';
  readonly orientation = 'inverse' as const;
  readonly group = 'thermal';
  readonly descripcion = 'Retardo térmico — inercia ante cambios de temperatura';
  readonly unidadReferencia = '10⁻⁶m²/s';
  readonly relatedProperties = ['resistividad_termica', 'sensibilidad_termica'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 100;
  readonly confianzaPorDefecto = 0.95;
}
