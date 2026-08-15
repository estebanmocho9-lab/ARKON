import { NeuronBase } from '../base/NeuronBase';

export class N062_ResistenciaCompresionInv extends NeuronBase {
  readonly neuronId = 'N-62-INV';
  readonly propertyName = 'resistencia_compresion_inv';
  readonly orientation = 'inverse' as const;
  readonly group = 'mechanical';
  readonly descripcion = 'Resistencia a compresión inversa — fragilidad ante impacto';
  readonly unidadReferencia = 'MPa';
  readonly relatedProperties = ['resistencia_traccion_inv', 'complacencia_elastica'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 200;
  readonly confianzaPorDefecto = 0.95;
}
