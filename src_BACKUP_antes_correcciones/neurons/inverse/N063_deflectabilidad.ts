import { NeuronBase } from '../base/NeuronBase';

export class N063_Deflectabilidad extends NeuronBase {
  readonly neuronId = 'N-63-INV';
  readonly propertyName = 'deflectabilidad';
  readonly orientation = 'inverse' as const;
  readonly group = 'mechanical';
  readonly descripcion = 'Deflectabilidad — deformación máxima antes de rotura';
  readonly unidadReferencia = 'MPa';
  readonly relatedProperties = ['complacencia_elastica', 'inv_cohesion'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 150;
  readonly confianzaPorDefecto = 0.95;
}
