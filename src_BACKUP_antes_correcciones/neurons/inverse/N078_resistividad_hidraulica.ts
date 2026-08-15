import { NeuronBase } from '../base/NeuronBase';

export class N078_ResistividadHidraulica extends NeuronBase {
  readonly neuronId = 'N-78-INV';
  readonly propertyName = 'resistividad_hidraulica';
  readonly orientation = 'inverse' as const;
  readonly group = 'transport';
  readonly descripcion = 'Resistividad hidráulica (1/K) — frena el paso del agua';
  readonly unidadReferencia = 'm/s';
  readonly relatedProperties = ['resistencia_matriz', 'compacidad'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 100;
  readonly confianzaPorDefecto = 0.95;
}
