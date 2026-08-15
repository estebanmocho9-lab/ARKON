
import { NeuronBase } from '../base/NeuronBase';

export class N049_EnergiaIncorporada extends NeuronBase {
  readonly neuronId = 'N-049';
  readonly propertyName = 'energia_incorporada';
  readonly orientation = 'direct';
  readonly group = 'environmental';
  readonly descripcion = 'Energía total consumida para producir el material';
  readonly unidadReferencia = 'MJ/kg';
  readonly relatedProperties = ['huella_carbono', 'reciclabilidad', 'resistencia_compresion'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 500;
  readonly confianzaPorDefecto = 0.95;
}