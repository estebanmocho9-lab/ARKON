import { NeuronBase } from '../base/NeuronBase';

export class N035_ConductividadElectrica extends NeuronBase {
  readonly neuronId = 'N-035';
  readonly propertyName = 'conductividad_electrica';
  readonly orientation = 'direct';
  readonly group = 'electrical';
  readonly descripcion = 'Conductividad eléctrica (medida en solución o en sólido)';
  readonly unidadReferencia = 'mS/cm';
  readonly relatedProperties = ['porosidad_total', 'difusion_ionica', 'ph'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 1000;
  readonly confianzaPorDefecto = 0.95;
}
