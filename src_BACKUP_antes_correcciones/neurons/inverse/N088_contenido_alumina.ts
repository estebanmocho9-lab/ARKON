import { NeuronBase } from '../base/NeuronBase';

export class N088_ContenidoAlumina extends NeuronBase {
  readonly neuronId = 'N-88-INV';
  readonly propertyName = 'contenido_alumina';
  readonly orientation = 'inverse' as const;
  readonly group = 'composition';
  readonly descripcion = 'Contenido de alúmina — refractariedad e índice de fundición';
  readonly unidadReferencia = '%';
  readonly relatedProperties = ['actividad_puzolana', 'contenido_ferrico'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 100;
  readonly confianzaPorDefecto = 0.95;
}
