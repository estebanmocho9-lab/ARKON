import { NeuronBase } from '../base/NeuronBase';

export class N077_ResistenciaMatriz extends NeuronBase {
  readonly neuronId = 'N-77-INV';
  readonly propertyName = 'resistencia_matriz';
  readonly orientation = 'inverse' as const;
  readonly group = 'transport';
  readonly descripcion = 'Resistencia de matriz — frena el flujo de fluidos';
  readonly unidadReferencia = 'm/s';
  readonly relatedProperties = ['resistividad_hidraulica', 'rectitud_flujo'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 100;
  readonly confianzaPorDefecto = 0.95;
}
