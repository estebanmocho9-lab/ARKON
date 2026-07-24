import { NeuronBase } from '../base/NeuronBase';

export class N100_NoReciclable extends NeuronBase {
  readonly neuronId = 'N-100-INV';
  readonly propertyName = 'no_reciclable';
  readonly orientation = 'inverse' as const;
  readonly group = 'environmental';
  readonly descripcion = 'No reciclable — tasa de confinamiento irreversible';
  readonly unidadReferencia = '%';
  readonly relatedProperties = ['captura_carbono', 'energia_recuperable'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 100;
  readonly confianzaPorDefecto = 0.95;
}
