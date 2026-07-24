import { NeuronBase } from '../base/NeuronBase';

export class N055_IndiceSolidos extends NeuronBase {
  readonly neuronId = 'N-55-INV';
  readonly propertyName = 'indice_solidos';
  readonly orientation = 'inverse' as const;
  readonly group = 'porosity';
  readonly descripcion = 'Índice de sólidos (1/e) — fracción de esqueleto sólido';
  readonly unidadReferencia = '-';
  readonly relatedProperties = ['volumen_especifico_real', 'compacidad'];
  readonly rangoFisicoMin = 0.33;
  readonly rangoFisicoMax = 3.0;
  readonly confianzaPorDefecto = 0.95;
}
