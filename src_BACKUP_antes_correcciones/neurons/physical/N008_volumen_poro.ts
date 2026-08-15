import { NeuronBase } from '../base/NeuronBase';

export class N008_VolumenPoro extends NeuronBase {
  readonly neuronId = 'N-008';
  readonly propertyName = 'volumen_poro';
  readonly orientation = 'direct';
  readonly group = 'pore';
  readonly descripcion = 'Volumen de poros por unidad de masa';
  readonly unidadReferencia = 'cm³/g';
  readonly relatedProperties = ['porosidad_total', 'diametro_poro', 'absorcion_agua'];
  readonly rangoFisicoMin = 0.001;
  readonly rangoFisicoMax = 10;
  readonly confianzaPorDefecto = 0.95;
}