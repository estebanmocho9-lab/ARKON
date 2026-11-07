import { AgenticNeuron } from "../agenticNeuron";
import type { AINeuronProfile } from "../types";
import * as Physical001 from "../../physical/N001_densidad_real";
import * as Physical002 from "../../physical/N002_densidad_aparente";
import * as Physical003 from "../../physical/N003_porosidad_total";
import * as Physical004 from "../../physical/N004_absorcion_agua";
import * as Physical005 from "../../physical/N005_indice_vacios";
import * as Physical006 from "../../physical/N006_tamano_particula";
import * as Physical007 from "../../physical/N007_area_BET";
import * as Physical008 from "../../physical/N008_volumen_poro";
import * as Physical009 from "../../physical/N009_diametro_poro";
import * as Physical010 from "../../physical/N010_tortuosidad";
import * as Physical011 from "../../physical/N011_resistencia_compresion";
import * as Physical012 from "../../physical/N012_resistencia_traccion";
import * as Physical013 from "../../physical/N013_resistencia_flexion";
import * as Physical014 from "../../physical/N014_modulo_young";
import * as Physical015 from "../../physical/N015_modulo_corte";
import * as Physical016 from "../../physical/N016_modulo_volumetrico";
import * as Physical017 from "../../physical/N017_cohesion";
import * as Physical018 from "../../physical/N018_dureza_mohs";
import * as Physical019 from "../../physical/N019_angulo_friccion";
import * as Physical020 from "../../physical/N020_poisson";
import * as Physical021 from "../../physical/N021_conductividad_termica";
import * as Physical022 from "../../physical/N022_calor_especifico";
import * as Physical023 from "../../physical/N023_expansion_termica";
import * as Physical024 from "../../physical/N024_temperatura_servicio";
import * as Physical025 from "../../physical/N025_temperatura_fusion";
import * as Physical026 from "../../physical/N026_difusividad_termica";
import * as Physical027 from "../../physical/N027_permeabilidad_intrinseca";
import * as Physical028 from "../../physical/N028_conductividad_hidraulica";
import * as Physical029 from "../../physical/N029_difusion_agua";
import * as Physical030 from "../../physical/N030_difusion_gases";
import * as Physical031 from "../../physical/N031_difusion_ionica";
import * as Physical032 from "../../physical/N032_ph";
import * as Physical033 from "../../physical/N033_cec";
import * as Physical034 from "../../physical/N034_adsorcion";
import * as Physical035 from "../../physical/N035_conductividad_electrica";
import * as Physical036 from "../../physical/N036_potencial_zeta";
import * as Physical037 from "../../physical/N037_sio2";
import * as Physical038 from "../../physical/N038_al2o3";
import * as Physical039 from "../../physical/N039_fe2o3";
import * as Physical040 from "../../physical/N040_cao";
import * as Physical041 from "../../physical/N041_mgo";
import * as Physical042 from "../../physical/N042_na2o";
import * as Physical043 from "../../physical/N043_k2o";
import * as Physical044 from "../../physical/N044_energia_superficial";
import * as Physical045 from "../../physical/N045_angulo_contacto";
import * as Physical046 from "../../physical/N046_trabajo_adhesion";
import * as Physical047 from "../../physical/N047_espesor_doble_capa";
import * as Physical048 from "../../physical/N048_huella_carbono";
import * as Physical049 from "../../physical/N049_energia_incorporada";
import * as Physical050 from "../../physical/N050_reciclabilidad";

type PhysicalNeuronConstructor = new () => AgenticNeuron;
function physicalConstructor(module: Record<string, unknown>): PhysicalNeuronConstructor {
  const exported = Object.values(module).find(value => typeof value === "function");
  if (!exported) throw new Error("El módulo de neurona física no exporta una clase.");
  return exported as PhysicalNeuronConstructor;
}

/**
 * Las 50 neuronas directas activas se instancian desde src/neurons/physical.
 * Cada clase física contiene su perfil IA completo y es la fuente canónica N001–N050.
 */
export const DIRECT_AI_NEURONS: AgenticNeuron[] = [
  new (physicalConstructor(Physical001 as unknown as Record<string, unknown>))(), // N001_densidad_real.ts
  new (physicalConstructor(Physical002 as unknown as Record<string, unknown>))(), // N002_densidad_aparente.ts
  new (physicalConstructor(Physical003 as unknown as Record<string, unknown>))(), // N003_porosidad_total.ts
  new (physicalConstructor(Physical004 as unknown as Record<string, unknown>))(), // N004_absorcion_agua.ts
  new (physicalConstructor(Physical005 as unknown as Record<string, unknown>))(), // N005_indice_vacios.ts
  new (physicalConstructor(Physical006 as unknown as Record<string, unknown>))(), // N006_tamano_particula.ts
  new (physicalConstructor(Physical007 as unknown as Record<string, unknown>))(), // N007_area_BET.ts
  new (physicalConstructor(Physical008 as unknown as Record<string, unknown>))(), // N008_volumen_poro.ts
  new (physicalConstructor(Physical009 as unknown as Record<string, unknown>))(), // N009_diametro_poro.ts
  new (physicalConstructor(Physical010 as unknown as Record<string, unknown>))(), // N010_tortuosidad.ts
  new (physicalConstructor(Physical011 as unknown as Record<string, unknown>))(), // N011_resistencia_compresion.ts
  new (physicalConstructor(Physical012 as unknown as Record<string, unknown>))(), // N012_resistencia_traccion.ts
  new (physicalConstructor(Physical013 as unknown as Record<string, unknown>))(), // N013_resistencia_flexion.ts
  new (physicalConstructor(Physical014 as unknown as Record<string, unknown>))(), // N014_modulo_young.ts
  new (physicalConstructor(Physical015 as unknown as Record<string, unknown>))(), // N015_modulo_corte.ts
  new (physicalConstructor(Physical016 as unknown as Record<string, unknown>))(), // N016_modulo_volumetrico.ts
  new (physicalConstructor(Physical017 as unknown as Record<string, unknown>))(), // N017_cohesion.ts
  new (physicalConstructor(Physical018 as unknown as Record<string, unknown>))(), // N018_dureza_mohs.ts
  new (physicalConstructor(Physical019 as unknown as Record<string, unknown>))(), // N019_angulo_friccion.ts
  new (physicalConstructor(Physical020 as unknown as Record<string, unknown>))(), // N020_poisson.ts
  new (physicalConstructor(Physical021 as unknown as Record<string, unknown>))(), // N021_conductividad_termica.ts
  new (physicalConstructor(Physical022 as unknown as Record<string, unknown>))(), // N022_calor_especifico.ts
  new (physicalConstructor(Physical023 as unknown as Record<string, unknown>))(), // N023_expansion_termica.ts
  new (physicalConstructor(Physical024 as unknown as Record<string, unknown>))(), // N024_temperatura_servicio.ts
  new (physicalConstructor(Physical025 as unknown as Record<string, unknown>))(), // N025_temperatura_fusion.ts
  new (physicalConstructor(Physical026 as unknown as Record<string, unknown>))(), // N026_difusividad_termica.ts
  new (physicalConstructor(Physical027 as unknown as Record<string, unknown>))(), // N027_permeabilidad_intrinseca.ts
  new (physicalConstructor(Physical028 as unknown as Record<string, unknown>))(), // N028_conductividad_hidraulica.ts
  new (physicalConstructor(Physical029 as unknown as Record<string, unknown>))(), // N029_difusion_agua.ts
  new (physicalConstructor(Physical030 as unknown as Record<string, unknown>))(), // N030_difusion_gases.ts
  new (physicalConstructor(Physical031 as unknown as Record<string, unknown>))(), // N031_difusion_ionica.ts
  new (physicalConstructor(Physical032 as unknown as Record<string, unknown>))(), // N032_ph.ts
  new (physicalConstructor(Physical033 as unknown as Record<string, unknown>))(), // N033_cec.ts
  new (physicalConstructor(Physical034 as unknown as Record<string, unknown>))(), // N034_adsorcion.ts
  new (physicalConstructor(Physical035 as unknown as Record<string, unknown>))(), // N035_conductividad_electrica.ts
  new (physicalConstructor(Physical036 as unknown as Record<string, unknown>))(), // N036_potencial_zeta.ts
  new (physicalConstructor(Physical037 as unknown as Record<string, unknown>))(), // N037_sio2.ts
  new (physicalConstructor(Physical038 as unknown as Record<string, unknown>))(), // N038_al2o3.ts
  new (physicalConstructor(Physical039 as unknown as Record<string, unknown>))(), // N039_fe2o3.ts
  new (physicalConstructor(Physical040 as unknown as Record<string, unknown>))(), // N040_cao.ts
  new (physicalConstructor(Physical041 as unknown as Record<string, unknown>))(), // N041_mgo.ts
  new (physicalConstructor(Physical042 as unknown as Record<string, unknown>))(), // N042_na2o.ts
  new (physicalConstructor(Physical043 as unknown as Record<string, unknown>))(), // N043_k2o.ts
  new (physicalConstructor(Physical044 as unknown as Record<string, unknown>))(), // N044_energia_superficial.ts
  new (physicalConstructor(Physical045 as unknown as Record<string, unknown>))(), // N045_angulo_contacto.ts
  new (physicalConstructor(Physical046 as unknown as Record<string, unknown>))(), // N046_trabajo_adhesion.ts
  new (physicalConstructor(Physical047 as unknown as Record<string, unknown>))(), // N047_espesor_doble_capa.ts
  new (physicalConstructor(Physical048 as unknown as Record<string, unknown>))(), // N048_huella_carbono.ts
  new (physicalConstructor(Physical049 as unknown as Record<string, unknown>))(), // N049_energia_incorporada.ts
  new (physicalConstructor(Physical050 as unknown as Record<string, unknown>))(), // N050_reciclabilidad.ts
];

export const AI_NEURON_PROFILES: AINeuronProfile[] = DIRECT_AI_NEURONS.map(neuron => neuron.profile);
