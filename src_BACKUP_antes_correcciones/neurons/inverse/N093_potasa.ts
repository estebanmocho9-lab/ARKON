import { NeuronBase } from '../base/NeuronBase';

export class N093_ViscosidadFundidoPotasico extends NeuronBase {
  readonly neuronId = 'N-93-INV';
  readonly propertyName = 'viscosidad_fundido_potasico';
  readonly orientation = 'inverse' as const;
  readonly group = 'composition';
  readonly descripcion = 'Viscosidad de fase líquida potásica — influencia del K₂O en fusión';
  readonly unidadReferencia = '%';
  readonly relatedProperties = ['viscosidad_fundido_sodico', 'cal_libre'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 100;
  readonly confianzaPorDefecto = 0.95;
}