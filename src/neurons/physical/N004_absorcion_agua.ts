import { NeuronBase } from '../base/NeuronBase';

export class N004_AbsorcionAgua extends NeuronBase {
  readonly neuronId = 'N-004';
  readonly propertyName = 'absorcion_agua';
  readonly orientation = 'direct';
  readonly group = 'absorption';
  readonly descripcion = 'Porcentaje de agua absorbida respecto al peso seco';
  readonly unidadReferencia = '%';
  readonly relatedProperties = ['porosidad_total', 'permeabilidad_intrinseca', 'angulo_contacto'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 100;
  readonly confianzaPorDefecto = 0.95;
}