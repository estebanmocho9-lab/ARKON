import { NeuronBase } from '../base/NeuronBase';

export class N086_PuntoCargaCero extends NeuronBase {
  readonly neuronId = 'N-86-INV';
  readonly propertyName = 'punto_carga_cero';
  readonly orientation = 'inverse' as const;
  readonly group = 'chemical';
  readonly descripcion = 'Punto de carga cero (PZC) — equilibrio electrostático de superficie';
  readonly unidadReferencia = 'pH';
  readonly relatedProperties = ['poh', 'estabilidad_cohesiva'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 14;
  readonly confianzaPorDefecto = 0.95;
}
