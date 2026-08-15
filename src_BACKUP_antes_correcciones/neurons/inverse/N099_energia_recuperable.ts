import { NeuronBase } from '../base/NeuronBase';

export class N099_EnergiaRecuperable extends NeuronBase {
  readonly neuronId = 'N-99-INV';
  readonly propertyName = 'energia_recuperable';
  readonly orientation = 'inverse' as const;
  readonly group = 'environmental';
  readonly descripcion = 'Energía recuperable residual — energía reutilizable';
  readonly unidadReferencia = 'MJ/kg';
  readonly relatedProperties = ['captura_carbono', 'no_reciclable'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 300;
  readonly confianzaPorDefecto = 0.95;
}
