import { NeuronBase } from '../base/NeuronBase';

export class N085_ResistividadElectrica extends NeuronBase {
  readonly neuronId = 'N-85-INV';
  readonly propertyName = 'resistividad_electrica';
  readonly orientation = 'inverse' as const;
  readonly group = 'chemical';
  readonly descripcion = 'Resistividad eléctrica — comportamiento como aislante eléctrico';
  readonly unidadReferencia = 'Ω·m';
  readonly relatedProperties = ['poh', 'punto_carga_cero'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 100;
  readonly confianzaPorDefecto = 0.95;
}
