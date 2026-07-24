import { NeuronBase } from '../base/NeuronBase';

export class N082_Poh extends NeuronBase {
  readonly neuronId = 'N-82-INV';
  readonly propertyName = 'poh';
  readonly orientation = 'inverse' as const;
  readonly group = 'chemical';
  readonly descripcion = 'pOH — basicidad complementaria al pH';
  readonly unidadReferencia = 'Escala';
  readonly relatedProperties = ['capacidad_anionica', 'punto_carga_cero'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 14;
  readonly confianzaPorDefecto = 0.95;
}
