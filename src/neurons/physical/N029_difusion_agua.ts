import { NeuronBase } from '../base/NeuronBase';

export class N029_DifusionAgua extends NeuronBase {
  readonly neuronId = 'N-029';
  readonly propertyName = 'difusion_agua';
  readonly orientation = 'direct';
  readonly group = 'diffusion';
  readonly descripcion = 'Coeficiente de difusión de agua en el material';
  readonly unidadReferencia = 'm²/s';
  readonly relatedProperties = ['porosidad_total', 'tortuosidad', 'absorcion_agua'];
  readonly rangoFisicoMin = 1e-14;
  readonly rangoFisicoMax = 1e-8;
  readonly confianzaPorDefecto = 0.95;
}