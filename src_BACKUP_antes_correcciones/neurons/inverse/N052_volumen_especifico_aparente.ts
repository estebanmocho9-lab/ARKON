import { NeuronBase } from '../base/NeuronBase';

export class N052_VolumenEspecificoAparente extends NeuronBase {
  readonly neuronId = 'N-52-INV';
  readonly propertyName = 'volumen_especifico_aparente';
  readonly orientation = 'inverse' as const;
  readonly group = 'density';
  readonly descripcion = 'Volumen específico aparente — espacio total por unidad de masa';
  readonly unidadReferencia = 'cm³/g';
  readonly relatedProperties = ['volumen_especifico_real', 'indice_solidos'];
  readonly rangoFisicoMin = 0.62;
  readonly rangoFisicoMax = 16.6;
  readonly confianzaPorDefecto = 0.95;
}
