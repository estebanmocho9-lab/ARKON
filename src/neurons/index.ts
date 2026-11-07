import { NeuronBase } from './base/NeuronBase';
export type { NeuronInput, NeuronOutput } from './base/NeuronBase';

// Las 50 directas activas son ahora sus perfiles IA N001–N050.
import { DIRECT_AI_NEURONS } from './neurons/ai/neurons';

// ── INVERSAS ──────────────────────────────────────────────────
// Grupo densidad/volumen
import { N051_VolumenEspecificoReal } from './inverse/N051_volumen_especifico_real';
import { N052_VolumenEspecificoAparente } from './inverse/N052_volumen_especifico_aparente';
// Grupo porosidad/compacidad
import { N053_Compacidad } from './inverse/N053_compacidad';
import { N054_Impermeabilidad } from './inverse/N054_impermeabilidad';
import { N055_IndiceSolidos } from './inverse/N055_indice_solidos';
// Grupo partícula/poro
import { N056_SuperficieEspecificaBlaine } from './inverse/N056_superficie_especifica_blaine';
import { N057_LisuraGeometrica } from './inverse/N057_lisura_geometrica';
import { N058_VolumenEsqueleto } from './inverse/N058_volumen_esqueleto';
import { N059_EstrechezCapilar } from './inverse/N059_estrechez_capilar';
import { N060_RectitudFlujo } from './inverse/N060_rectitud_flujo';
// Grupo mecánico
import { N061_ResistenciaTraccionInv } from './inverse/N061_resistencia_traccion_inv';
import { N062_ResistenciaCompresionInv } from './inverse/N062_resistencia_compresion_inv';
import { N063_Deflectabilidad } from './inverse/N063_deflectabilidad';
import { N064_ComplacenciaElastica } from './inverse/N064_complacencia_elastica';
import { N065_ComplacenciaCizalladura } from './inverse/N065_complacencia_cizalladura';
import { N066_Compresibilidad } from './inverse/N066_compresibilidad';
import { N067_InvCohesion } from './inverse/N067_inv_cohesion';
import { N068_Blandura } from './inverse/N068_blandura';
import { N069_CoefDeslizamiento } from './inverse/N069_coef_deslizamiento';
import { N070_RelacionEsbeltez } from './inverse/N070_relacion_esbeltez';
// Grupo térmico
import { N071_ResistividadTermica } from './inverse/N071_resistividad_termica';
import { N072_SensibilidadTermica } from './inverse/N072_sensibilidad_termica';
import { N073_ContraccionTermica } from './inverse/N073_contraccion_termica';
import { N074_TemperaturaFalla } from './inverse/N074_temperatura_falla';
import { N075_Solidificacion } from './inverse/N075_solidificacion';
import { N076_RetardoTermico } from './inverse/N076_retardo_termico';
// Grupo transporte
import { N077_ResistenciaMatriz } from './inverse/N077_resistencia_matriz';
import { N078_ResistividadHidraulica } from './inverse/N078_resistividad_hidraulica';
import { N079_ResistenciaDifusion } from './inverse/N079_resistencia_difusion';
import { N080_ResistenciaGases } from './inverse/N080_resistencia_gases';
import { N081_ResistenciaIonica } from './inverse/N081_resistencia_ionica';
// Grupo químico
import { N082_Poh } from './inverse/N082_poh';
import { N083_CapacidadAnionica } from './inverse/N083_capacidad_anionica';
import { N084_Desorcion } from './inverse/N084_desorcion';
import { N085_ResistividadElectrica } from './inverse/N085_resistividad_electrica';
import { N086_PuntoCargaCero } from './inverse/N086_punto_carga_cero';
// Grupo composición
import { N087_ActividadPuzolana } from './inverse/N087_actividad_puzolana';
import { N088_ContenidoAlumina } from './inverse/N088_contenido_alumina';
import { N089_ContenidoFerrico } from './inverse/N089_contenido_ferrico';
import { N090_CalLibre } from './inverse/N090_cal_libre';
import { N091_Magnesia } from './inverse/N091_magnesia';
import { N092_ViscosidadFundidoSodico } from './inverse/N092_sosa';
import { N093_ViscosidadFundidoPotasico } from './inverse/N093_potasa';
// Grupo superficie
import { N094_EstabilidadCohesiva } from './inverse/N094_estabilidad_cohesiva';
import { N095_CosenoAngulo } from './inverse/N095_coseno_angulo';
import { N096_TrabajoCohesion } from './inverse/N096_trabajo_cohesion';
import { N097_RadioDebye } from './inverse/N097_radio_debye';
// Grupo ambiental
import { N098_CapturaCarbono } from './inverse/N098_captura_carbono';
import { N099_EnergiaRecuperable } from './inverse/N099_energia_recuperable';
import { N100_NoReciclable } from './inverse/N100_no_reciclable';

// Lista completa de las 100 neuronas
export const ALL_NEURONS: NeuronBase[] = [
  // Directas (N001–N050): perfiles IA canónicos que delegan el cálculo científico
  // en su clase física original y reciben el proveedor Llama/Turso.
  ...DIRECT_AI_NEURONS,
  // Inversas (N051–N100)
  new N051_VolumenEspecificoReal(),
  new N052_VolumenEspecificoAparente(),
  new N053_Compacidad(),
  new N054_Impermeabilidad(),
  new N055_IndiceSolidos(),
  new N056_SuperficieEspecificaBlaine(),
  new N057_LisuraGeometrica(),
  new N058_VolumenEsqueleto(),
  new N059_EstrechezCapilar(),
  new N060_RectitudFlujo(),
  new N061_ResistenciaTraccionInv(),
  new N062_ResistenciaCompresionInv(),
  new N063_Deflectabilidad(),
  new N064_ComplacenciaElastica(),
  new N065_ComplacenciaCizalladura(),
  new N066_Compresibilidad(),
  new N067_InvCohesion(),
  new N068_Blandura(),
  new N069_CoefDeslizamiento(),
  new N070_RelacionEsbeltez(),
  new N071_ResistividadTermica(),
  new N072_SensibilidadTermica(),
  new N073_ContraccionTermica(),
  new N074_TemperaturaFalla(),
  new N075_Solidificacion(),
  new N076_RetardoTermico(),
  new N077_ResistenciaMatriz(),
  new N078_ResistividadHidraulica(),
  new N079_ResistenciaDifusion(),
  new N080_ResistenciaGases(),
  new N081_ResistenciaIonica(),
  new N082_Poh(),
  new N083_CapacidadAnionica(),
  new N084_Desorcion(),
  new N085_ResistividadElectrica(),
  new N086_PuntoCargaCero(),
  new N087_ActividadPuzolana(),
  new N088_ContenidoAlumina(),
  new N089_ContenidoFerrico(),
  new N090_CalLibre(),
  new N091_Magnesia(),
  new N092_ViscosidadFundidoSodico(),
  new N093_ViscosidadFundidoPotasico(),
  new N094_EstabilidadCohesiva(),
  new N095_CosenoAngulo(),
  new N096_TrabajoCohesion(),
  new N097_RadioDebye(),
  new N098_CapturaCarbono(),
  new N099_EnergiaRecuperable(),
  new N100_NoReciclable(),
];

// Mapa para acceso rápido por propertyName
export const NEURON_MAP: Record<string, NeuronBase> = Object.fromEntries(
  ALL_NEURONS.map(neurona => [neurona.propertyName, neurona])
);

// Reexportar tipos y base
export * from './base/NeuronBase';
export * from './base/tipos';
