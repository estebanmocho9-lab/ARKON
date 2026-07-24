import { NeuronBase } from '../base/NeuronBase';

export class N072_SensibilidadTermica extends NeuronBase {
  readonly neuronId = 'N-72-INV';
  readonly propertyName = 'sensibilidad_termica';
  readonly orientation = 'inverse' as const;
  readonly group = 'thermal';
  readonly descripcion = 'Sensibilidad térmica — responde rápido a cambios de temperatura';
  readonly unidadReferencia = 'kJ/kg·K';
  readonly relatedProperties = ['resistividad_termica', 'retardo_termico'];
  readonly rangoFisicoMin = 0.1;
  readonly rangoFisicoMax = 5;
  readonly confianzaPorDefecto = 0.95;
}
