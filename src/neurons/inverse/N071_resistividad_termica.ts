import { NeuronBase } from '../base/NeuronBase';

export class N071_ResistividadTermica extends NeuronBase {
  readonly neuronId = 'N-71-INV';
  readonly propertyName = 'resistividad_termica';
  readonly orientation = 'inverse' as const;
  readonly group = 'thermal';
  readonly descripcion = 'Resistividad térmica (1/k) — capacidad aislante';
  readonly unidadReferencia = 'm·K/W';
  readonly relatedProperties = ['retardo_termico', 'sensibilidad_termica'];
  readonly rangoFisicoMin = 0.5;
  readonly rangoFisicoMax = 100;
  readonly confianzaPorDefecto = 0.95;
}
