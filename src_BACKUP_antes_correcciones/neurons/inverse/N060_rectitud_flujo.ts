import { NeuronBase } from '../base/NeuronBase';

export class N060_RectitudFlujo extends NeuronBase {
  readonly neuronId = 'N-60-INV';
  readonly propertyName = 'rectitud_flujo';
  readonly orientation = 'inverse' as const;
  readonly group = 'particle';
  readonly descripcion = 'Rectitud de flujo — camino más directo posible';
  readonly unidadReferencia = '-';
  readonly relatedProperties = ['estrechez_capilar', 'resistividad_hidraulica'];
  readonly rangoFisicoMin = 0.5;
  readonly rangoFisicoMax = 1.0;
  readonly confianzaPorDefecto = 0.95;
}
