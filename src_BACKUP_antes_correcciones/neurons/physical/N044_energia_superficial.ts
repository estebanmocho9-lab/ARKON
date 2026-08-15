import { NeuronBase } from '../base/NeuronBase';

export class N044_EnergiaSuperficial extends NeuronBase {
  readonly neuronId = 'N-044';
  readonly propertyName = 'energia_superficial';
  readonly orientation = 'direct';
  readonly group = 'surface';
  readonly descripcion = 'Energía libre superficial';
  readonly unidadReferencia = 'mJ/m²';
  readonly relatedProperties = ['angulo_contacto', 'trabajo_adhesion', 'adsorcion'];
  readonly rangoFisicoMin = 10;
  readonly rangoFisicoMax = 500;
  readonly confianzaPorDefecto = 0.95;
}