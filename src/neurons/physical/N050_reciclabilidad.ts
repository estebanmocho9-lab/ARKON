import { NeuronBase } from '../base/NeuronBase';

export class N050_Reciclabilidad extends NeuronBase {
  readonly neuronId = 'N-050';
  readonly propertyName = 'reciclabilidad';
  readonly orientation = 'direct';
  readonly group = 'environmental';
  readonly descripcion = 'Porcentaje del material que puede ser reciclado al final de su vida útil';
  readonly unidadReferencia = '%';
  readonly relatedProperties = ['huella_carbono', 'energia_incorporada', 'composicion'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 100;
  readonly confianzaPorDefecto = 0.95;
}