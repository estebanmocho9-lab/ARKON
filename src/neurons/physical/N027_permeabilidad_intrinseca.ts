import { NeuronBase } from '../base/NeuronBase';

export class N027_PermeabilidadIntrinseca extends NeuronBase {
  readonly neuronId = 'N-027';
  readonly propertyName = 'permeabilidad_intrinseca';
  readonly orientation = 'direct';
  readonly group = 'permeability';
  readonly descripcion = 'Permeabilidad intrínseca (ley de Darcy)';
  readonly unidadReferencia = 'mD';
  readonly relatedProperties = ['porosidad_total', 'diametro_poro', 'conductividad_hidraulica'];
  readonly rangoFisicoMin = 1e-6;
  readonly rangoFisicoMax = 1e6;
  readonly confianzaPorDefecto = 0.95;
}