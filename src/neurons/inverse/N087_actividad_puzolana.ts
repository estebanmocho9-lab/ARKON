import { NeuronBase } from '../base/NeuronBase';

export class N087_ActividadPuzolana extends NeuronBase {
  readonly neuronId = 'N-87-INV';
  readonly propertyName = 'actividad_puzolana';
  readonly orientation = 'inverse' as const;
  readonly group = 'composition';
  readonly descripcion = 'Actividad puzolánica — reactividad de la sílice con cal';
  readonly unidadReferencia = '%';
  readonly relatedProperties = ['cal_libre', 'contenido_alumina'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 100;
  readonly confianzaPorDefecto = 0.95;
}
