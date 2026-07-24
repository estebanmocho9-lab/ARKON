import { NeuronBase } from '../base/NeuronBase';

export class N020_Poisson extends NeuronBase {
  readonly neuronId = 'N-020';
  readonly propertyName = 'poisson';
  readonly orientation = 'direct';
  readonly group = 'elasticity';
  readonly descripcion = 'Coeficiente de Poisson (relación de deformación lateral a axial)';
  readonly unidadReferencia = 'adimensional';
  readonly relatedProperties = ['modulo_young', 'modulo_corte', 'modulo_volumetrico'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 0.5;
  readonly confianzaPorDefecto = 0.95;
}