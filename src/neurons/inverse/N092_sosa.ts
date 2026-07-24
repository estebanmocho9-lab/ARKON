import { NeuronBase } from '../base/NeuronBase';

export class N092_ViscosidadFundidoSodico extends NeuronBase {
  readonly neuronId = 'N-92-INV';
  readonly propertyName = 'viscosidad_fundido_sodico';
  readonly orientation = 'inverse' as const;
  readonly group = 'composition';
  readonly descripcion = 'Viscosidad de fase líquida sódica — influencia del Na₂O en fusión';
  readonly unidadReferencia = '%';
  readonly relatedProperties = ['viscosidad_fundido_potasico', 'actividad_puzolana'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 100;
  readonly confianzaPorDefecto = 0.95;
}