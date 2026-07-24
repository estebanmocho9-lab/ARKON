import { NeuronBase } from './base/NeuronBase';
export type { NeuronInput, NeuronOutput } from './base/NeuronBase';

// ── DIRECTAS ──────────────────────────────────────────────────
// Grupo densidad
import { N001_DensidadReal } from './physical/N001_densidad_real';
import { N002_DensidadAparente } from './physical/N002_densidad_aparente';
// Grupo porosidad/absorción
import { N003_PorosidadTotal } from './physical/N003_porosidad_total';
import { N004_AbsorcionAgua } from './physical/N004_absorcion_agua';
import { N005_IndiceVacios } from './physical/N005_indice_vacios';
// Grupo partícula/poro
import { N006_TamanoParticula } from './physical/N006_tamano_particula';
import { N007_AreaBET } from './physical/N007_area_BET';
import { N008_VolumenPoro } from './physical/N008_volumen_poro';
import { N009_DiametroPoro } from './physical/N009_diametro_poro';
import { N010_Tortuosidad } from './physical/N010_tortuosidad';
// Grupo mecánico
import { N011_ResistenciaCompresion } from './physical/N011_resistencia_compresion';
import { N012_ResistenciaTraccion } from './physical/N012_resistencia_traccion';
import { N013_ResistenciaFlexion } from './physical/N013_resistencia_flexion';
import { N014_ModuloYoung } from './physical/N014_modulo_young';
import { N015_ModuloCorte } from './physical/N015_modulo_corte';
import { N016_ModuloVolumetrico } from './physical/N016_modulo_volumetrico';
import { N017_Cohesion } from './physical/N017_cohesion';
import { N018_DurezaMohs } from './physical/N018_dureza_mohs';
import { N019_AnguloFriccion } from './physical/N019_angulo_friccion';
import { N020_Poisson } from './physical/N020_poisson';
// Grupo térmico
import { N021_ConductividadTermica } from './physical/N021_conductividad_termica';
import { N022_CalorEspecifico } from './physical/N022_calor_especifico';
import { N023_ExpansionTermica } from './physical/N023_expansion_termica';
import { N024_TemperaturaServicio } from './physical/N024_temperatura_servicio';
import { N025_TemperaturaFusion } from './physical/N025_temperatura_fusion';
import { N026_DifusividadTermica } from './physical/N026_difusividad_termica';
// Grupo permeabilidad/difusión
import { N027_PermeabilidadIntrinseca } from './physical/N027_permeabilidad_intrinseca';
import { N028_ConductividadHidraulica } from './physical/N028_conductividad_hidraulica';
import { N029_DifusionAgua } from './physical/N029_difusion_agua';
import { N030_DifusionGases } from './physical/N030_difusion_gases';
import { N031_DifusionIonica } from './physical/N031_difusion_ionica';
// Grupo químico/superficie
import { N032_Ph } from './physical/N032_ph';
import { N033_Cec } from './physical/N033_cec';
import { N034_Adsorcion } from './physical/N034_adsorcion';
import { N035_ConductividadElectrica } from './physical/N035_conductividad_electrica';
import { N036_PotencialZeta } from './physical/N036_potencial_zeta';
import { N037_SiO2 } from './physical/N037_sio2';
import { N038_Al2O3 } from './physical/N038_al2o3';
import { N039_Fe2O3 } from './physical/N039_fe2o3';
import { N040_CaO } from './physical/N040_cao';
import { N041_MgO } from './physical/N041_mgo';
import { N042_Na2O } from './physical/N042_na2o';
import { N043_K2O } from './physical/N043_k2o';
import { N044_EnergiaSuperficial } from './physical/N044_energia_superficial';
import { N045_AnguloContacto } from './physical/N045_angulo_contacto';
import { N046_TrabajoAdhesion } from './physical/N046_trabajo_adhesion';
import { N047_EspesorDobleCapa } from './physical/N047_espesor_doble_capa';
// Grupo ambiental
import { N048_HuellaCarbono } from './physical/N048_huella_carbono';
import { N049_EnergiaIncorporada } from './physical/N049_energia_incorporada';
import { N050_Reciclabilidad } from './physical/N050_reciclabilidad';

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
import { N092_Sosa } from './inverse/N092_sosa';
import { N093_Potasa } from './inverse/N093_potasa';
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
  // Directas (N001–N050)
  new N001_DensidadReal(),
  new N002_DensidadAparente(),
  new N003_PorosidadTotal(),
  new N004_AbsorcionAgua(),
  new N005_IndiceVacios(),
  new N006_TamanoParticula(),
  new N007_AreaBET(),
  new N008_VolumenPoro(),
  new N009_DiametroPoro(),
  new N010_Tortuosidad(),
  new N011_ResistenciaCompresion(),
  new N012_ResistenciaTraccion(),
  new N013_ResistenciaFlexion(),
  new N014_ModuloYoung(),
  new N015_ModuloCorte(),
  new N016_ModuloVolumetrico(),
  new N017_Cohesion(),
  new N018_DurezaMohs(),
  new N019_AnguloFriccion(),
  new N020_Poisson(),
  new N021_ConductividadTermica(),
  new N022_CalorEspecifico(),
  new N023_ExpansionTermica(),
  new N024_TemperaturaServicio(),
  new N025_TemperaturaFusion(),
  new N026_DifusividadTermica(),
  new N027_PermeabilidadIntrinseca(),
  new N028_ConductividadHidraulica(),
  new N029_DifusionAgua(),
  new N030_DifusionGases(),
  new N031_DifusionIonica(),
  new N032_Ph(),
  new N033_Cec(),
  new N034_Adsorcion(),
  new N035_ConductividadElectrica(),
  new N036_PotencialZeta(),
  new N037_SiO2(),
  new N038_Al2O3(),
  new N039_Fe2O3(),
  new N040_CaO(),
  new N041_MgO(),
  new N042_Na2O(),
  new N043_K2O(),
  new N044_EnergiaSuperficial(),
  new N045_AnguloContacto(),
  new N046_TrabajoAdhesion(),
  new N047_EspesorDobleCapa(),
  new N048_HuellaCarbono(),
  new N049_EnergiaIncorporada(),
  new N050_Reciclabilidad(),
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
  new N092_Sosa(),
  new N093_Potasa(),
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
