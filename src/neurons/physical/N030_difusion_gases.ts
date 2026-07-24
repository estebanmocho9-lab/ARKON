import { NeuronBase } from '../base/NeuronBase';

export class N030_DifusionGases extends NeuronBase {
  readonly neuronId = 'N-030';
  readonly propertyName = 'difusion_gases';
  readonly orientation = 'direct';
  readonly group = 'diffusion';
  readonly descripcion = 'Coeficiente de difusión de gases (por ejemplo, vapor de agua)';
  readonly unidadReferencia = 'm²/s';
  readonly relatedProperties = ['porosidad_total', 'tortuosidad', 'difusion_agua'];
  readonly rangoFisicoMin = 1e-14;
  readonly rangoFisicoMax = 1e-8;
  readonly confianzaPorDefecto = 0.95;
}