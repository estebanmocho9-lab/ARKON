import { NeuronBase } from '../base/NeuronBase';

export class N057_LisuraGeometrica extends NeuronBase {
  readonly neuronId = 'N-57-INV';
  readonly propertyName = 'lisura_geometrica';
  readonly orientation = 'inverse' as const;
  readonly group = 'particle';
  readonly descripcion = 'Lisura geométrica — superficie baja indica partícula lisa';
  readonly unidadReferencia = 'm²/g';
  readonly relatedProperties = ['superficie_especifica_blaine', 'volumen_esqueleto'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 50;
  readonly confianzaPorDefecto = 0.95;
}
