import { NeuronBase } from '../base/NeuronBase';

export class N054_Impermeabilidad extends NeuronBase {
  readonly neuronId = 'N-54-INV';
  readonly propertyName = 'impermeabilidad';
  readonly orientation = 'inverse' as const;
  readonly group = 'porosity';
  readonly descripcion = 'Impermeabilidad — resistencia al ingreso de agua';
  readonly unidadReferencia = '%';
  readonly relatedProperties = ['compacidad', 'coseno_angulo'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 100;
  readonly confianzaPorDefecto = 0.95;
}
