import { NeuronBase } from '../base/NeuronBase';

export class N079_ResistenciaDifusion extends NeuronBase {
  readonly neuronId = 'N-79-INV';
  readonly propertyName = 'resistencia_difusion';
  readonly orientation = 'inverse' as const;
  readonly group = 'transport';
  readonly descripcion = 'Resistencia a difusión de vapor (mu) — barrera de vapor';
  readonly unidadReferencia = 'm²/s';
  readonly relatedProperties = ['impermeabilidad', 'compacidad'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 200;
  readonly confianzaPorDefecto = 0.95;
}
