import { NeuronBase } from '../base/NeuronBase';

export class N051_VolumenEspecificoReal extends NeuronBase {
  readonly neuronId = 'N-51-INV';
  readonly propertyName = 'volumen_especifico_real';
  readonly orientation = 'inverse' as const;
  readonly group = 'density';
  readonly descripcion = 'Volumen específico real — cm³ por gramo de sólido';
  readonly unidadReferencia = 'cm³/g';
  readonly relatedProperties = ['volumen_especifico_aparente', 'compacidad'];
  readonly rangoFisicoMin = 0.18;
  readonly rangoFisicoMax = 2.0;
  readonly confianzaPorDefecto = 0.95;
}
