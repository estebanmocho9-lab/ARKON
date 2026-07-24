import { NeuronBase } from '../base/NeuronBase';

export class N066_Compresibilidad extends NeuronBase {
  readonly neuronId = 'N-66-INV';
  readonly propertyName = 'compresibilidad';
  readonly orientation = 'inverse' as const;
  readonly group = 'mechanical';
  readonly descripcion = 'Compresibilidad (beta=1/K) — facilidad de compresión volumétrica';
  readonly unidadReferencia = '1/GPa';
  readonly relatedProperties = ['complacencia_elastica', 'compacidad'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 10;
  readonly confianzaPorDefecto = 0.95;
}
