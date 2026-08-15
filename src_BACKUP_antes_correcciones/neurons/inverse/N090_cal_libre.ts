import { NeuronBase } from '../base/NeuronBase';

export class N090_CalLibre extends NeuronBase {
  readonly neuronId = 'N-90-INV';
  readonly propertyName = 'cal_libre';
  readonly orientation = 'inverse' as const;
  readonly group = 'composition';
  readonly descripcion = 'Cal libre — índice de acidez relativo al CaO';
  readonly unidadReferencia = '%';
  readonly relatedProperties = ['actividad_puzolana', 'magnesia'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 100;
  readonly confianzaPorDefecto = 0.95;
}
