import { NeuronBase } from '../base/NeuronBase';

export class N031_DifusionIonica extends NeuronBase {
  readonly neuronId = 'N-031';
  readonly propertyName = 'difusion_ionica';
  readonly orientation = 'direct';
  readonly group = 'diffusion';
  readonly descripcion = 'Coeficiente de difusión de iones (por ejemplo, cloruros)';
  readonly unidadReferencia = 'm²/s';
  readonly relatedProperties = ['porosidad_total', 'conductividad_electrica', 'cec'];
  readonly rangoFisicoMin = 1e-14;
  readonly rangoFisicoMax = 1e-8;
  readonly confianzaPorDefecto = 0.95;
}