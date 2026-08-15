import { NeuronBase } from '../base/NeuronBase';

export class N081_ResistenciaIonica extends NeuronBase {
  readonly neuronId = 'N-81-INV';
  readonly propertyName = 'resistencia_ionica';
  readonly orientation = 'inverse' as const;
  readonly group = 'transport';
  readonly descripcion = 'Resistencia iónica — barrera dieléctrica y bloqueo iónico';
  readonly unidadReferencia = 'm²/s';
  readonly relatedProperties = ['resistividad_electrica', 'poh'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 100;
  readonly confianzaPorDefecto = 0.95;
}
