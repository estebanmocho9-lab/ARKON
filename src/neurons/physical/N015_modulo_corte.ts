import { NeuronBase } from '../base/NeuronBase';

export class N015_ModuloCorte extends NeuronBase {
  readonly neuronId = 'N-015';
  readonly propertyName = 'modulo_corte';
  readonly orientation = 'direct';
  readonly group = 'elasticity';
  readonly descripcion = 'Módulo de elasticidad transversal';
  readonly unidadReferencia = 'GPa';
  readonly relatedProperties = ['modulo_young', 'poisson', 'modulo_volumetrico'];
  readonly rangoFisicoMin = 0.001;
  readonly rangoFisicoMax = 80;
  readonly confianzaPorDefecto = 0.97;
}