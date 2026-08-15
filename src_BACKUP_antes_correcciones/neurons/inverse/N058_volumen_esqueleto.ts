import { NeuronBase } from '../base/NeuronBase';

export class N058_VolumenEsqueleto extends NeuronBase {
  readonly neuronId = 'N-58-INV';
  readonly propertyName = 'volumen_esqueleto';
  readonly orientation = 'inverse' as const;
  readonly group = 'particle';
  readonly descripcion = 'Volumen de esqueleto sólido — espacio ocupado por el sólido';
  readonly unidadReferencia = 'cm³/g';
  readonly relatedProperties = ['compacidad', 'volumen_especifico_real'];
  readonly rangoFisicoMin = 0.1;
  readonly rangoFisicoMax = 2.0;
  readonly confianzaPorDefecto = 0.95;
}
