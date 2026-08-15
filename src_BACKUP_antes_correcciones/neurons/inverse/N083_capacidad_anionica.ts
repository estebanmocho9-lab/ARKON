import { NeuronBase } from '../base/NeuronBase';

export class N083_CapacidadAnionica extends NeuronBase {
  readonly neuronId = 'N-83-INV';
  readonly propertyName = 'capacidad_anionica';
  readonly orientation = 'inverse' as const;
  readonly group = 'chemical';
  readonly descripcion = 'Capacidad de intercambio aniónico';
  readonly unidadReferencia = 'meq/100g';
  readonly relatedProperties = ['poh', 'desorcion'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 200;
  readonly confianzaPorDefecto = 0.95;
}
