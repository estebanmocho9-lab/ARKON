import { NeuronBase } from '../base/NeuronBase';

export class N080_ResistenciaGases extends NeuronBase {
  readonly neuronId = 'N-80-INV';
  readonly propertyName = 'resistencia_gases';
  readonly orientation = 'inverse' as const;
  readonly group = 'transport';
  readonly descripcion = 'Resistencia a gases — impedancia al paso de gases';
  readonly unidadReferencia = 'm²/s';
  readonly relatedProperties = ['compacidad', 'rectitud_flujo'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 50;
  readonly confianzaPorDefecto = 0.95;
}
