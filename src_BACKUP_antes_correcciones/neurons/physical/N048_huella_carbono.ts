import { NeuronBase } from '../base/NeuronBase';

export class N048_HuellaCarbono extends NeuronBase {
  readonly neuronId = 'N-048';
  readonly propertyName = 'huella_carbono';
  readonly orientation = 'direct';
  readonly group = 'environmental';
  readonly descripcion = 'Emisiones de CO₂ equivalente por kilogramo de material';
  readonly unidadReferencia = 'kg CO₂/kg';
  readonly relatedProperties = ['energia_incorporada', 'reciclabilidad', 'conductividad_termica'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 1000;
  readonly confianzaPorDefecto = 0.95;
}