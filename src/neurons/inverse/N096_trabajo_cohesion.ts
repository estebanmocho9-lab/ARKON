import { NeuronBase } from '../base/NeuronBase';

export class N096_TrabajoCohesion extends NeuronBase {
  readonly neuronId = 'N-96-INV';
  readonly propertyName = 'trabajo_cohesion';
  readonly orientation = 'inverse' as const;
  readonly group = 'surface';
  readonly descripcion = 'Trabajo de cohesión — energía de unión interna del material';
  readonly unidadReferencia = 'mJ';
  readonly relatedProperties = ['estabilidad_cohesiva', 'coseno_angulo'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 500;
  readonly confianzaPorDefecto = 0.95;
}
