import { NeuronBase } from '../base/NeuronBase';

export class N047_EspesorDobleCapa extends NeuronBase {
  readonly neuronId = 'N-047';
  readonly propertyName = 'espesor_doble_capa';
  readonly orientation = 'direct';
  readonly group = 'surface';
  readonly descripcion = 'Espesor de la doble capa eléctrica';
  readonly unidadReferencia = 'nm';
  readonly relatedProperties = ['potencial_zeta', 'cec', 'conductividad_electrica'];
  readonly rangoFisicoMin = 0.1;
  readonly rangoFisicoMax = 1000;
  readonly confianzaPorDefecto = 0.95;
}