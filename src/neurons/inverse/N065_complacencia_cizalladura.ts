import { NeuronBase } from '../base/NeuronBase';

export class N065_ComplacenciaCizalladura extends NeuronBase {
  readonly neuronId = 'N-65-INV';
  readonly propertyName = 'complacencia_cizalladura';
  readonly orientation = 'inverse' as const;
  readonly group = 'mechanical';
  readonly descripcion = 'Complacencia de cizalladura (1/G) — flexibilidad al corte';
  readonly unidadReferencia = '1/GPa';
  readonly relatedProperties = ['complacencia_elastica', 'relacion_esbeltez'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 10;
  readonly confianzaPorDefecto = 0.95;
}
