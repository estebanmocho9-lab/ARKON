import { NeuronBase } from '../base/NeuronBase';

export class N094_EstabilidadCohesiva extends NeuronBase {
  readonly neuronId = 'N-94-INV';
  readonly propertyName = 'estabilidad_cohesiva';
  readonly orientation = 'inverse' as const;
  readonly group = 'surface';
  readonly descripcion = 'Estabilidad cohesiva interna — energía de unión superficial';
  readonly unidadReferencia = 'mN/m';
  readonly relatedProperties = ['coseno_angulo', 'trabajo_cohesion'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 500;
  readonly confianzaPorDefecto = 0.95;
}
