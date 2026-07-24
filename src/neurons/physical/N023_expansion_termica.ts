import { NeuronBase } from '../base/NeuronBase';

export class N023_ExpansionTermica extends NeuronBase {
  readonly neuronId = 'N-023';
  readonly propertyName = 'expansion_termica';
  readonly orientation = 'direct';
  readonly group = 'thermal';
  readonly descripcion = 'Coeficiente de expansión térmica lineal';
  readonly unidadReferencia = '10^-6/K';
  readonly relatedProperties = ['modulo_young', 'resistencia_traccion', 'temperatura_servicio'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 50;
  readonly confianzaPorDefecto = 0.95;
}