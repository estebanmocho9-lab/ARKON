import { NeuronBase } from '../base/NeuronBase';

export class N034_Adsorcion extends NeuronBase {
  readonly neuronId = 'N-034';
  readonly propertyName = 'adsorcion';
  readonly orientation = 'direct';
  readonly group = 'chemical';
  readonly descripcion = 'Capacidad de adsorción de sustancias (ej. colorantes, metales)';
  readonly unidadReferencia = 'mg/g';
  readonly relatedProperties = ['area_BET', 'cec', 'potencial_zeta'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 1000;
  readonly confianzaPorDefecto = 0.90;
}