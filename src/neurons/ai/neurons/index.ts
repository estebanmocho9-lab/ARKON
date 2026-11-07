import { AI_NEURON_N001 } from "./N001_densidad_real";
import { AI_NEURON_N002 } from "./N002_densidad_aparente";
import { AI_NEURON_N003 } from "./N003_porosidad_total";
import { AI_NEURON_N004 } from "./N004_absorcion_agua";
import { AI_NEURON_N005 } from "./N005_indice_vacios";
import { AI_NEURON_N006 } from "./N006_tamaño_particula";
import { AI_NEURON_N007 } from "./N007_area_BET";
import { AI_NEURON_N008 } from "./N008_volumen_poro";
import { AI_NEURON_N009 } from "./N009_diametro_poro";
import { AI_NEURON_N010 } from "./N010_tortuosidad";
import { AI_NEURON_N011 } from "./N011_resistencia_compresion";
import { AI_NEURON_N012 } from "./N012_resistencia_traccion";
import { AI_NEURON_N013 } from "./N013_resistencia_flexion";
import { AI_NEURON_N014 } from "./N014_modulo_young";
import { AI_NEURON_N015 } from "./N015_modulo_corte";
import { AI_NEURON_N016 } from "./N016_modulo_volumetrico";
import { AI_NEURON_N017 } from "./N017_cohesion";
import { AI_NEURON_N018 } from "./N018_dureza_mohs";
import { AI_NEURON_N019 } from "./N019_angulo_friccion";
import { AI_NEURON_N020 } from "./N020_poisson";
import { AI_NEURON_N021 } from "./N021_conductividad_termica";
import { AI_NEURON_N022 } from "./N022_calor_especifico";
import { AI_NEURON_N023 } from "./N023_expansion_termica";
import { AI_NEURON_N024 } from "./N024_temperatura_servicio";
import { AI_NEURON_N025 } from "./N025_temperatura_fusion";
import { AI_NEURON_N026 } from "./N026_difusividad_termica";
import { AI_NEURON_N027 } from "./N027_permeabilidad_intrinseca";
import { AI_NEURON_N028 } from "./N028_conductividad_hidraulica";
import { AI_NEURON_N029 } from "./N029_difusion_agua";
import { AI_NEURON_N030 } from "./N030_difusion_gases";
import { AI_NEURON_N031 } from "./N031_difusion_ionica";
import { AI_NEURON_N032 } from "./N032_ph";
import { AI_NEURON_N033 } from "./N033_cec";
import { AI_NEURON_N034 } from "./N034_adsorcion";
import { AI_NEURON_N035 } from "./N035_conductividad_electrica";
import { AI_NEURON_N036 } from "./N036_potencial_zeta";
import { AI_NEURON_N037 } from "./N037_sio2";
import { AI_NEURON_N038 } from "./N038_al2o3";
import { AI_NEURON_N039 } from "./N039_fe2o3";
import { AI_NEURON_N040 } from "./N040_cao";
import { AI_NEURON_N041 } from "./N041_mgo";
import { AI_NEURON_N042 } from "./N042_na2o";
import { AI_NEURON_N043 } from "./N043_k2o";
import { AI_NEURON_N044 } from "./N044_energia_superficial";
import { AI_NEURON_N045 } from "./N045_angulo_contacto";
import { AI_NEURON_N046 } from "./N046_trabajo_adhesion";
import { AI_NEURON_N047 } from "./N047_espesor_doble_capa";
import { AI_NEURON_N048 } from "./N048_huella_carbono";
import { AI_NEURON_N049 } from "./N049_energia_incorporada";
import { AI_NEURON_N050 } from "./N050_reciclabilidad";
import { AgenticNeuron } from "../agenticNeuron";
import { AINeuronProfile } from "../types";

/** The 50 individual agent neurons cloned from N-001 through N-050. */
export const DIRECT_AI_NEURONS: AgenticNeuron[] = [
  AI_NEURON_N001,
  AI_NEURON_N002,
  AI_NEURON_N003,
  AI_NEURON_N004,
  AI_NEURON_N005,
  AI_NEURON_N006,
  AI_NEURON_N007,
  AI_NEURON_N008,
  AI_NEURON_N009,
  AI_NEURON_N010,
  AI_NEURON_N011,
  AI_NEURON_N012,
  AI_NEURON_N013,
  AI_NEURON_N014,
  AI_NEURON_N015,
  AI_NEURON_N016,
  AI_NEURON_N017,
  AI_NEURON_N018,
  AI_NEURON_N019,
  AI_NEURON_N020,
  AI_NEURON_N021,
  AI_NEURON_N022,
  AI_NEURON_N023,
  AI_NEURON_N024,
  AI_NEURON_N025,
  AI_NEURON_N026,
  AI_NEURON_N027,
  AI_NEURON_N028,
  AI_NEURON_N029,
  AI_NEURON_N030,
  AI_NEURON_N031,
  AI_NEURON_N032,
  AI_NEURON_N033,
  AI_NEURON_N034,
  AI_NEURON_N035,
  AI_NEURON_N036,
  AI_NEURON_N037,
  AI_NEURON_N038,
  AI_NEURON_N039,
  AI_NEURON_N040,
  AI_NEURON_N041,
  AI_NEURON_N042,
  AI_NEURON_N043,
  AI_NEURON_N044,
  AI_NEURON_N045,
  AI_NEURON_N046,
  AI_NEURON_N047,
  AI_NEURON_N048,
  AI_NEURON_N049,
  AI_NEURON_N050,
];

export const AI_NEURON_PROFILES: AINeuronProfile[] = DIRECT_AI_NEURONS.map(neuron => neuron.profile);
