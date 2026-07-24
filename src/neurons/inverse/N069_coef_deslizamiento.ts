import { NeuronBase } from '../base/NeuronBase';

export class N069_CoefDeslizamiento extends NeuronBase {
  readonly neuronId = 'N-69-INV';
  readonly propertyName = 'coef_deslizamiento';
  readonly orientation = 'inverse' as const;
  readonly group = 'mechanical';
  readonly descripcion = 'Coeficiente de deslizamiento lubricado';
  readonly unidadReferencia = 'adim';
  readonly relatedProperties = ['inv_cohesion', 'blandura'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 1;
  readonly confianzaPorDefecto = 0.95;
}
