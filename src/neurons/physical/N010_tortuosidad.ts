import { NeuronBase } from '../base/NeuronBase';

export class N010_Tortuosidad extends NeuronBase {
  readonly neuronId = 'N-010';
  readonly propertyName = 'tortuosidad';
  readonly orientation = 'direct';
  readonly group = 'pore';
  readonly descripcion = 'Relación entre la longitud efectiva del camino y la longitud recta';
  readonly unidadReferencia = 'adimensional';
  readonly relatedProperties = ['permeabilidad_intrinseca', 'difusion_agua', 'diametro_poro'];
  readonly rangoFisicoMin = 1;
  readonly rangoFisicoMax = 100;
  readonly confianzaPorDefecto = 0.95;
}