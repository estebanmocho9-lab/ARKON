import { NeuronBase } from '../base/NeuronBase';

export class N016_ModuloVolumetrico extends NeuronBase {
  readonly neuronId = 'N-016';
  readonly propertyName = 'modulo_volumetrico';
  readonly orientation = 'direct';
  readonly group = 'elasticity';
  readonly descripcion = 'Módulo de compresibilidad volumétrica';
  readonly unidadReferencia = 'GPa';
  readonly relatedProperties = ['modulo_young', 'poisson', 'modulo_corte'];
  readonly rangoFisicoMin = 0.001;
  readonly rangoFisicoMax = 150;
  readonly confianzaPorDefecto = 0.97;
}