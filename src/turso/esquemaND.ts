export { prepararEsquemaNDTurso as prepararEsquemaND, resetNDTursoContext as resetEsquemaND } from '../extraction-neurons/turso/ndTursoPersistence';

export const TABLAS_PROYECCION: Record<string,string> = {
  MATERIAL:'nd_materiales', COMPONENTE:'nd_componentes', PROPIEDAD:'nd_propiedades',
  MAGNITUD:'nd_magnitudes', ATRIBUTO:'nd_atributos', RELACION:'nd_relaciones',
  CONDICION:'nd_condiciones', METODO:'nd_metodos', INSTRUMENTO:'nd_instrumentos',
  APLICACION:'nd_aplicaciones', COMPORTAMIENTO:'nd_comportamientos', NORMA:'nd_normas',
  DEFINICION:'nd_definiciones', EVIDENCIA:'nd_evidencias', FORMULA:'nd_formulas'
};
