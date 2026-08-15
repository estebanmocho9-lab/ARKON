import { NeuronBase } from '../base/NeuronBase';

export class N014_ModuloYoung extends NeuronBase {
  readonly neuronId = 'N-014';
  readonly propertyName = 'modulo_young';
  readonly orientation = 'direct';
  readonly group = 'elasticity';
  readonly descripcion = 'Módulo de elasticidad longitudinal (rigidez)';
  readonly unidadReferencia = 'GPa';
  readonly relatedProperties = ['resistencia_compresion', 'poisson', 'modulo_corte'];
  readonly rangoFisicoMin = 0.001;
  readonly rangoFisicoMax = 200;
  readonly confianzaPorDefecto = 0.97;
}