import { NeuronBase } from '../base/NeuronBase';

export class N056_SuperficieEspecificaBlaine extends NeuronBase {
  readonly neuronId = 'N-56-INV';
  readonly propertyName = 'superficie_especifica_blaine';
  readonly orientation = 'inverse' as const;
  readonly group = 'particle';
  readonly descripcion = 'Superficie específica Blaine — área por unidad de masa';
  readonly unidadReferencia = 'cm²/g';
  readonly relatedProperties = ['lisura_geometrica', 'estrechez_capilar'];
  readonly rangoFisicoMin = 0.01;
  readonly rangoFisicoMax = 500;
  readonly confianzaPorDefecto = 0.95;
}
