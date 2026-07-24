import { NeuronBase } from '../base/NeuronBase';

export class N053_Compacidad extends NeuronBase {
  readonly neuronId = 'N-53-INV';
  readonly propertyName = 'compacidad';
  readonly orientation = 'inverse' as const;
  readonly group = 'porosity';
  readonly descripcion = 'Compacidad — fracción sólida del volumen total';
  readonly unidadReferencia = '%';
  readonly relatedProperties = ['volumen_especifico_aparente', 'impermeabilidad'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 100;
  readonly confianzaPorDefecto = 0.95;
}
