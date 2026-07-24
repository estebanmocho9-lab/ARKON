import { NeuronBase } from '../base/NeuronBase';

export class N017_Cohesion extends NeuronBase {
  readonly neuronId = 'N-017';
  readonly propertyName = 'cohesion';
  readonly orientation = 'direct';
  readonly group = 'mechanical';
  readonly descripcion = 'Cohesión interna del material (parámetro de Mohr-Coulomb)';
  readonly unidadReferencia = 'MPa';
  readonly relatedProperties = ['angulo_friccion', 'resistencia_compresion', 'resistencia_traccion'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 50;
  readonly confianzaPorDefecto = 0.95;
}