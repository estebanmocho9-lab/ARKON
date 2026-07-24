import { NeuronBase } from '../base/NeuronBase';

export class N036_PotencialZeta extends NeuronBase {
  readonly neuronId = 'N-036';
  readonly propertyName = 'potencial_zeta';
  readonly orientation = 'direct';
  readonly group = 'surface';
  readonly descripcion = 'Potencial eléctrico en la interfaz sólido-líquido';
  readonly unidadReferencia = 'mV';
  readonly relatedProperties = ['ph', 'cec', 'espesor_doble_capa'];
  readonly rangoFisicoMin = -100;
  readonly rangoFisicoMax = 100;
  readonly confianzaPorDefecto = 0.95;
}