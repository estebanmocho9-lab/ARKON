import { NeuronBase } from '../base/NeuronBase';

export class N064_ComplacenciaElastica extends NeuronBase {
  readonly neuronId = 'N-64-INV';
  readonly propertyName = 'complacencia_elastica';
  readonly orientation = 'inverse' as const;
  readonly group = 'mechanical';
  readonly descripcion = 'Complacencia elástica (1/E) — flexibilidad ante carga axial';
  readonly unidadReferencia = '1/GPa';
  readonly relatedProperties = ['resistencia_compresion_inv', 'complacencia_cizalladura'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 10;
  readonly confianzaPorDefecto = 0.95;
}
