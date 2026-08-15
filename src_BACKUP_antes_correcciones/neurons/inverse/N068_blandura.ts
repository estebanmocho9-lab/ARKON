import { NeuronBase } from '../base/NeuronBase';

export class N068_Blandura extends NeuronBase {
  readonly neuronId = 'N-68-INV';
  readonly propertyName = 'blandura';
  readonly orientation = 'inverse' as const;
  readonly group = 'mechanical';
  readonly descripcion = 'Blandura — facilidad de rayado y penetración';
  readonly unidadReferencia = 'Escala';
  readonly relatedProperties = ['inv_cohesion', 'resistencia_compresion_inv'];
  readonly rangoFisicoMin = 1;
  readonly rangoFisicoMax = 10;
  readonly confianzaPorDefecto = 0.95;
}
