import { NeuronBase } from '../base/NeuronBase';

export class N006_TamanoParticula extends NeuronBase {
  readonly neuronId = 'N-006';
  readonly propertyName = 'tamaño_particula';
  readonly orientation = 'direct';
  readonly group = 'particle';
  readonly descripcion = 'Diámetro medio de partícula';
  readonly unidadReferencia = 'µm';
  readonly relatedProperties = ['area_BET', 'volumen_poro', 'porosidad_total'];
  readonly rangoFisicoMin = 0.001;
  readonly rangoFisicoMax = 1000;
  readonly confianzaPorDefecto = 0.95;
}