import { NeuronBase } from '../base/NeuronBase';

export class N033_Cec extends NeuronBase {
  readonly neuronId = 'N-033';
  readonly propertyName = 'cec';
  readonly orientation = 'direct';
  readonly group = 'chemical';
  readonly descripcion = 'Capacidad de intercambio catiónico';
  readonly unidadReferencia = 'meq/100g';
  readonly relatedProperties = ['ph', 'adsorcion', 'potencial_zeta'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 200;
  readonly confianzaPorDefecto = 0.95;
}