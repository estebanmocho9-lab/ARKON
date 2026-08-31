// ============================================================
// RAM exclusivas de ND.
// Son contenedores de extraccion: no razonan, no consolidan
// ciencia y no sustituyen a las 100 neuronas especialistas.
// Cada ND tiene su propio conjunto de RAM para que una corrida
// no mezcle memoria entre ND01...ND10.
// ============================================================

import { HallazgoND, RAMND, TipoCandidatoND } from './tipos';

export class RAMNDImpl implements RAMND<HallazgoND> {
  private hallazgos: HallazgoND[] = [];

  constructor(readonly nombre: string, private readonly tipos?: TipoCandidatoND[]) {}

  agregar(hallazgo: HallazgoND): void {
    if (!this.tipos || this.tipos.includes(hallazgo.tipo)) this.hallazgos.push(hallazgo);
  }

  consultar(): HallazgoND[] {
    return [...this.hallazgos];
  }

  cantidad(): number {
    return this.hallazgos.length;
  }

  entregar(): HallazgoND[] {
    const salida = [...this.hallazgos];
    this.hallazgos = [];
    return salida;
  }

  limpiar(): void {
    this.hallazgos = [];
  }
}

export interface RAMSetND {
  materiales: RAMND<HallazgoND>;
  componentes: RAMND<HallazgoND>;
  propiedades: RAMND<HallazgoND>;
  atributos: RAMND<HallazgoND>;
  magnitudes: RAMND<HallazgoND>;
  formulas: RAMND<HallazgoND>;
  relaciones: RAMND<HallazgoND>;
  metodos: RAMND<HallazgoND>;
  instrumentos: RAMND<HallazgoND>;
  normas: RAMND<HallazgoND>;
  condiciones: RAMND<HallazgoND>;
  aplicaciones: RAMND<HallazgoND>;
  comportamiento: RAMND<HallazgoND>;
  definiciones: RAMND<HallazgoND>;
  evidencias: RAMND<HallazgoND>;
  desconocidos: RAMND<HallazgoND>;
}

export function crearRAMsND(neuronId: string): RAMSetND {
  const r = (nombre: string, ...tipos: TipoCandidatoND[]) =>
    new RAMNDImpl(`${neuronId}:RAM-${nombre}`, tipos.length ? tipos : undefined);

  return {
    materiales: r('Materiales', 'MATERIAL'),
    componentes: r('Componentes', 'COMPONENTE'),
    propiedades: r('Propiedades', 'PROPIEDAD'),
    atributos: r('Atributos', 'ATRIBUTO'),
    magnitudes: r('Magnitudes', 'MAGNITUD'),
    formulas: r('Formulas', 'FORMULA', 'SUB_CABLE'),
    relaciones: r('Relaciones', 'RELACION'),
    metodos: r('Metodos', 'METODO'),
    instrumentos: r('Instrumentos', 'INSTRUMENTO'),
    normas: r('Normas', 'NORMA'),
    condiciones: r('Condiciones', 'CONDICION'),
    aplicaciones: r('Aplicaciones', 'APLICACION'),
    comportamiento: r('Comportamiento', 'COMPORTAMIENTO'),
    definiciones: r('Definiciones', 'DEFINICION'),
    evidencias: r('Evidencias', 'EVIDENCIA'),
    desconocidos: r('Desconocidos', 'DESCONOCIDO'),
  };
}
