import { NeuronBase } from '../base/NeuronBase';

export class N046_TrabajoAdhesion extends NeuronBase {
  readonly neuronId = 'N-046';
  readonly propertyName = 'trabajo_adhesion';
  readonly orientation = 'direct';
  readonly group = 'surface';
  readonly descripcion = 'Trabajo de adhesión sólido-líquido';
  readonly unidadReferencia = 'mJ/m²';
  readonly relatedProperties = ['energia_superficial', 'angulo_contacto', 'cohesion'];
  readonly rangoFisicoMin = 10;
  readonly rangoFisicoMax = 1000;
  readonly confianzaPorDefecto = 0.95;
}