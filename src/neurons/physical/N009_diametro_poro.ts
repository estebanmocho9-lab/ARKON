import { NeuronBase } from '../base/NeuronBase';

export class N009_DiametroPoro extends NeuronBase {
  readonly neuronId = 'N-009';
  readonly propertyName = 'diametro_poro';
  readonly orientation = 'direct';
  readonly group = 'pore';
  readonly descripcion = 'Diámetro medio de poro';
  readonly unidadReferencia = 'nm';
  readonly relatedProperties = ['volumen_poro', 'permeabilidad_intrinseca', 'tortuosidad'];
  readonly rangoFisicoMin = 1;
  readonly rangoFisicoMax = 100000;
  readonly confianzaPorDefecto = 0.95;
}