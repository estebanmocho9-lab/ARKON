import { NeuronBase } from '../base/NeuronBase';

export class N095_CosenoAngulo extends NeuronBase {
  readonly neuronId = 'N-95-INV';
  readonly propertyName = 'coseno_angulo';
  readonly orientation = 'inverse' as const;
  readonly group = 'surface';
  readonly descripcion = 'Coseno del ángulo de contacto — grado de hidrofilicidad';
  readonly unidadReferencia = 'adim';
  readonly relatedProperties = ['estabilidad_cohesiva', 'impermeabilidad'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 1;
  readonly confianzaPorDefecto = 0.95;
}
