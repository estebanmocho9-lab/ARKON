import { NeuronBase } from '../base/NeuronBase';

export class N070_RelacionEsbeltez extends NeuronBase {
  readonly neuronId = 'N-70-INV';
  readonly propertyName = 'relacion_esbeltez';
  readonly orientation = 'inverse' as const;
  readonly group = 'mechanical';
  readonly descripcion = 'Relación de esbeltez lateral (1/nu) — expansión transversal';
  readonly unidadReferencia = '-';
  readonly relatedProperties = ['complacencia_elastica', 'complacencia_cizalladura'];
  readonly rangoFisicoMin = 2;
  readonly rangoFisicoMax = 10;
  readonly confianzaPorDefecto = 0.95;
}
