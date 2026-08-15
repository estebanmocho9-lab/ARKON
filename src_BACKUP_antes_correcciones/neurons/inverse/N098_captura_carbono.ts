import { NeuronBase } from '../base/NeuronBase';

export class N098_CapturaCarbono extends NeuronBase {
  readonly neuronId = 'N-98-INV';
  readonly propertyName = 'captura_carbono';
  readonly orientation = 'inverse' as const;
  readonly group = 'environmental';
  readonly descripcion = 'Captura de carbono — secuestro de CO₂ del material';
  readonly unidadReferencia = 'kg CO₂/kg';
  readonly relatedProperties = ['energia_recuperable', 'no_reciclable'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 50;
  readonly confianzaPorDefecto = 0.95;
}
