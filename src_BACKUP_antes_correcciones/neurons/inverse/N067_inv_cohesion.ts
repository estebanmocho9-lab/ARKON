import { NeuronBase } from '../base/NeuronBase';

export class N067_InvCohesion extends NeuronBase {
  readonly neuronId = 'N-67-INV';
  readonly propertyName = 'inv_cohesion';
  readonly orientation = 'inverse' as const;
  readonly group = 'mechanical';
  readonly descripcion = 'INV_Cohesión — friabilidad, tendencia a desmoronarse bajo carga';
  readonly unidadReferencia = 'kPa';
  readonly relatedProperties = ['resistencia_compresion_inv', 'blandura'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 100;
  readonly confianzaPorDefecto = 0.95;
}
