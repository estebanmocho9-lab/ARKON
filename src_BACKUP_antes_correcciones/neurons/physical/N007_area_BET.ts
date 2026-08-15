import { NeuronBase } from '../base/NeuronBase';

export class N007_AreaBET extends NeuronBase {
  readonly neuronId = 'N-007';
  readonly propertyName = 'area_BET';
  readonly orientation = 'direct';
  readonly group = 'particle';
  readonly descripcion = 'Superficie específica medida por método BET';
  readonly unidadReferencia = 'm²/g';
  readonly relatedProperties = ['tamaño_particula', 'adsorcion', 'porosidad_total'];
  readonly rangoFisicoMin = 0.1;
  readonly rangoFisicoMax = 1000;
  readonly confianzaPorDefecto = 0.97;
}