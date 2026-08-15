import { NeuronBase } from '../base/NeuronBase';

export class N089_ContenidoFerrico extends NeuronBase {
  readonly neuronId = 'N-89-INV';
  readonly propertyName = 'contenido_ferrico';
  readonly orientation = 'inverse' as const;
  readonly group = 'composition';
  readonly descripcion = 'Contenido férrico — óxido ferroso reducido (FeO)';
  readonly unidadReferencia = '%';
  readonly relatedProperties = ['contenido_alumina', 'magnesia'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 100;
  readonly confianzaPorDefecto = 0.95;
}
