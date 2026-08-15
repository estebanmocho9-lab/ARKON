import { NeuronBase } from '../base/NeuronBase';

export class N019_AnguloFriccion extends NeuronBase {
  readonly neuronId = 'N-019';
  readonly propertyName = 'angulo_friccion';
  readonly orientation = 'direct';
  readonly group = 'mechanical';
  readonly descripcion = 'Ángulo de fricción interna (parámetro de Mohr-Coulomb)';
  readonly unidadReferencia = '°';
  readonly relatedProperties = ['cohesion', 'resistencia_compresion', 'dureza_mohs'];
  readonly rangoFisicoMin = 0;
  readonly rangoFisicoMax = 90;
  readonly confianzaPorDefecto = 0.95;
}