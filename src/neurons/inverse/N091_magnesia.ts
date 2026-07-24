import { NeuronBase } from '../base/NeuronBase';

export class N091_Magnesia extends NeuronBase {
  readonly neuronId = 'N-91-INV';
  readonly propertyName = 'magnesia';
  readonly orientation = 'inverse' as const;
  readonly group = 'composition';
  readonly descripcion = 'Magnesia — estabilidad volumétrica inmediata';
  readonly unidadReferencia = '%';
  readonly relatedProperties = ['cal_libre', 'contenido_alumina'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 100;
  readonly confianzaPorDefecto = 0.95;
}
