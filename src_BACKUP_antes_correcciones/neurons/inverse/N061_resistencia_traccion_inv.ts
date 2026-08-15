import { NeuronBase } from '../base/NeuronBase';

export class N061_ResistenciaTraccionInv extends NeuronBase {
  readonly neuronId = 'N-61-INV';
  readonly propertyName = 'resistencia_traccion_inv';
  readonly orientation = 'inverse' as const;
  readonly group = 'mechanical';
  readonly descripcion = 'Resistencia a tracción — límite ante fuerzas de tensión';
  readonly unidadReferencia = 'MPa';
  readonly relatedProperties = ['resistencia_compresion_inv', 'inv_cohesion'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 500;
  readonly confianzaPorDefecto = 0.95;
}
