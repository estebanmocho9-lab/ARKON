import { NeuronBase } from '../base/NeuronBase';

export class N059_EstrechezCapilar extends NeuronBase {
  readonly neuronId = 'N-59-INV';
  readonly propertyName = 'estrechez_capilar';
  readonly orientation = 'inverse' as const;
  readonly group = 'particle';
  readonly descripcion = 'Estrechez capilar — poros finos frenan el flujo capilar';
  readonly unidadReferencia = 'µm';
  readonly relatedProperties = ['rectitud_flujo', 'resistencia_matriz'];
  readonly rangoFisicoMin = 0.001;
  readonly rangoFisicoMax = 1000;
  readonly confianzaPorDefecto = 0.95;
}
