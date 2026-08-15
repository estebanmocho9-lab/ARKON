import { NeuronBase } from '../base/NeuronBase';

export class N097_RadioDebye extends NeuronBase {
  readonly neuronId = 'N-97-INV';
  readonly propertyName = 'radio_debye';
  readonly orientation = 'inverse' as const;
  readonly group = 'surface';
  readonly descripcion = 'Radio de Debye — fuerza iónica comprimida';
  readonly unidadReferencia = 'nm';
  readonly relatedProperties = ['punto_carga_cero', 'resistividad_electrica'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 1;
  readonly confianzaPorDefecto = 0.95;
}
