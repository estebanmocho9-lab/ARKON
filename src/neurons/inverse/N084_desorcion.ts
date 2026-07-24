import { NeuronBase } from '../base/NeuronBase';

export class N084_Desorcion extends NeuronBase {
  readonly neuronId = 'N-84-INV';
  readonly propertyName = 'desorcion';
  readonly orientation = 'inverse' as const;
  readonly group = 'chemical';
  readonly descripcion = 'Desorción — capacidad de liberar moléculas adsorbidas';
  readonly unidadReferencia = '-';
  readonly relatedProperties = ['capacidad_anionica', 'lisura_geometrica'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 10;
  readonly confianzaPorDefecto = 0.95;
}
