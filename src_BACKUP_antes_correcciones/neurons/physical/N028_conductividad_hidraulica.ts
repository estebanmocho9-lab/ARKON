import { NeuronBase } from '../base/NeuronBase';

export class N028_ConductividadHidraulica extends NeuronBase {
  readonly neuronId = 'N-028';
  readonly propertyName = 'conductividad_hidraulica';
  readonly orientation = 'direct';
  readonly group = 'permeability';
  readonly descripcion = 'Conductividad hidráulica saturada';
  readonly unidadReferencia = 'm/s';
  readonly relatedProperties = ['permeabilidad_intrinseca', 'porosidad_total', 'absorcion_agua'];
  readonly rangoFisicoMin = 1e-12;
  readonly rangoFisicoMax = 1;
  readonly confianzaPorDefecto = 0.95;
}