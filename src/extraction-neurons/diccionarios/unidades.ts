// ============================================================
// src/extraction-neurons/diccionarios/unidades.ts
// Unidades reconocidas, agrupadas por magnitud física. Sirve
// para validar que "el número encontrado" tiene una unidad que
// realmente corresponde a la propiedad detectada (ej. que a
// "densidad" no se le asigne un valor en "MPa" por error).
// ============================================================

import { EntradaUnidad } from '../base/tipos';

export const UNIDADES: EntradaUnidad[] = [
  // ── densidad ──
  { unidad: 'kg/m3',  variantes_texto: ['kg/m3', 'kg/m³', 'Kg/m3', 'kg m-3'], magnitud: 'densidad' },
  { unidad: 'g/cm3',  variantes_texto: ['g/cm3', 'g/cm³', 'gr/cm3'],          magnitud: 'densidad' },

  // ── porcentaje / adimensional ──
  { unidad: '%',      variantes_texto: ['%', 'por ciento', 'percent'],       magnitud: 'porcentaje' },
  { unidad: '-',      variantes_texto: [],                                   magnitud: 'adimensional' },

  // ── longitud a escala micro/nano (partícula, poro) ──
  { unidad: 'nm',     variantes_texto: ['nm', 'nanómetros', 'nanometers'],   magnitud: 'longitud_micro' },
  { unidad: 'µm',     variantes_texto: ['µm', 'um', 'micras', 'microns'],    magnitud: 'longitud_micro' },
  { unidad: 'mm',     variantes_texto: ['mm', 'milímetros'],                 magnitud: 'longitud_micro' },

  // ── área específica ──
  { unidad: 'm2/g',   variantes_texto: ['m2/g', 'm²/g'],                     magnitud: 'area_especifica' },

  // ── volumen específico ──
  { unidad: 'cm3/g',  variantes_texto: ['cm3/g', 'cm³/g', 'mL/g', 'ml/g'],   magnitud: 'volumen_especifico' },

  // ── resistencia mecánica / módulos ──
  { unidad: 'MPa',    variantes_texto: ['MPa', 'N/mm2', 'N/mm²'],            magnitud: 'resistencia_mecanica' },
  { unidad: 'kPa',    variantes_texto: ['kPa'],                              magnitud: 'resistencia_mecanica' },
  { unidad: 'GPa',    variantes_texto: ['GPa'],                              magnitud: 'modulo_elastico' },

  // ── dureza (Mohs, adimensional 1-10) ──
  { unidad: 'Mohs',   variantes_texto: ['Mohs', 'escala de Mohs'],            magnitud: 'dureza' },

  // ── ángulo ──
  { unidad: '°',      variantes_texto: ['°', 'grados', 'deg'],                magnitud: 'angulo' },

  // ── térmica ──
  { unidad: 'W/mK',   variantes_texto: ['W/mK', 'W/m·K', 'W/m.K'],            magnitud: 'conductividad_termica' },
  { unidad: 'J/kgK',  variantes_texto: ['J/kgK', 'J/kg·K', 'J/kg.K'],         magnitud: 'calor_especifico' },
  { unidad: '1/K',    variantes_texto: ['1/K', 'K-1', 'K⁻¹', 'ppm/°C'],       magnitud: 'expansion_termica' },
  { unidad: '°C',     variantes_texto: ['°C', 'grados C', 'celsius'],         magnitud: 'temperatura' },
  { unidad: 'K',      variantes_texto: ['K', 'kelvin'],                       magnitud: 'temperatura' },
  { unidad: 'm2/s',   variantes_texto: ['m2/s', 'm²/s', 'mm2/s', 'mm²/s'],    magnitud: 'difusividad_termica' },

  // ── hidráulica ──
  { unidad: 'm2',     variantes_texto: ['m2', 'm²', 'darcy'],                 magnitud: 'permeabilidad' },
  { unidad: 'm/s',    variantes_texto: ['m/s', 'cm/s'],                       magnitud: 'conductividad_hidraulica' },
  { unidad: 'cm2/s',  variantes_texto: ['cm2/s', 'cm²/s'],                    magnitud: 'difusion' },

  // ── química ──
  { unidad: 'pH',     variantes_texto: [],                                    magnitud: 'ph' },
  { unidad: 'meq/100g', variantes_texto: ['meq/100g', 'cmol/kg'],             magnitud: 'cec' },

  // ── eléctrica ──
  { unidad: 'S/m',    variantes_texto: ['S/m', 'mS/cm'],                      magnitud: 'conductividad_electrica' },
  { unidad: 'mV',     variantes_texto: ['mV', 'V', 'volt', 'voltios'],        magnitud: 'potencial_electrico' },

  // ── superficial ──
  { unidad: 'J/m2',   variantes_texto: ['J/m2', 'J/m²', 'mN/m', 'mJ/m2'],     magnitud: 'energia_superficial' },

  // ── ambiental / económica ──
  { unidad: 'kgCO2/kg', variantes_texto: ['kgCO2/kg', 'kg CO2eq/kg', 'kg CO2/kg'], magnitud: 'huella_carbono' },
  { unidad: 'MJ/kg',  variantes_texto: ['MJ/kg', 'kWh/kg'],                   magnitud: 'energia_masica' },
  { unidad: 's-1',    variantes_texto: ['s-1', 's⁻¹'],                        magnitud: 'tasa' },


  // ── Magnitudes de las 155 propiedades nuevas (una magnitud
  //    dedicada por propiedad, generada automáticamente a partir
  //    de sus "unidades típicas" — más simple y seguro que tratar
  //    de agruparlas a mano en categorías compartidas) ──────────
  { unidad: 'GPa', variantes_texto: ['GPa', 'MPa', 'psi', 'ksi'], magnitud: 'm_modulo_de_young' },
  { unidad: 'adimensional', variantes_texto: ['adimensional'], magnitud: 'm_la_proporcion_de_poisson' },
  { unidad: 'MPa', variantes_texto: ['MPa', 'psi'], magnitud: 'm_rendir_fuerza' },
  { unidad: '%', variantes_texto: ['%'], magnitud: 'm_alargamiento_en_el_descanso' },
  { unidad: '%', variantes_texto: ['%'], magnitud: 'm_reduccion_de_la_superficie' },
  { unidad: 'kgf/mm²', variantes_texto: ['kgf/mm²', 'GPa'], magnitud: 'm_dureza_de_vickers' },
  { unidad: 'kgf/mm2', variantes_texto: ['kgf/mm2'], magnitud: 'm_la_dureza_brinell' },
  { unidad: 'Adimensional', variantes_texto: ['Adimensional'], magnitud: 'm_dureza_rockwell_c' },
  { unidad: 'J', variantes_texto: ['J', 'J/cm²'], magnitud: 'm_charpy_impact_energy' },
  { unidad: 'MPa·m^½', variantes_texto: ['MPa·m^½'], magnitud: 'm_plane_strain_fracture_toughness' },
  { unidad: 'kJ/m²', variantes_texto: ['kJ/m²'], magnitud: 'm_tenacidad_a_la_fractura_j_integral' },
  { unidad: 'mm', variantes_texto: ['mm'], magnitud: 'm_ctod_critica' },
  { unidad: 'MPa', variantes_texto: ['MPa'], magnitud: 'm_fatigue_limit' },
  { unidad: 'MPa·m^½', variantes_texto: ['MPa·m^½'], magnitud: 'm_fatigue_crack_growth_threshold' },
  { unidad: 'Adimensional', variantes_texto: ['Adimensional'], magnitud: 'm_strain_hardening_exponent' },
  { unidad: 'MPa', variantes_texto: ['MPa'], magnitud: 'm_strength_coefficient_hollomon' },
  { unidad: 'Adimensional', variantes_texto: ['Adimensional'], magnitud: 'm_coeficiente_de_friccion' },
  { unidad: 'GPa', variantes_texto: ['GPa'], magnitud: 'm_storage_modulus' },
  { unidad: 'GPa', variantes_texto: ['GPa'], magnitud: 'm_modulo_de_perdida' },
  { unidad: 'Pa·s', variantes_texto: ['Pa·s', 'cP'], magnitud: 'm_dynamic_viscosity' },
  { unidad: '°C', variantes_texto: ['°C', 'K'], magnitud: 'm_temperatura_de_transicion_de_vidrio' },
  { unidad: '°C', variantes_texto: ['°C'], magnitud: 'm_temperatura_de_descomposicion' },
  { unidad: '°C', variantes_texto: ['°C'], magnitud: 'm_temperatura_de_deflexion_de_calor' },
  { unidad: '°C', variantes_texto: ['°C'], magnitud: 'm_temperatura_de_ablandamiento_vicat' },
  { unidad: '% O2', variantes_texto: ['% O2'], magnitud: 'm_limitar_el_indice_de_oxigeno' },
  { unidad: 'adimensional (0–1)', variantes_texto: ['adimensional (0–1)'], magnitud: 'm_thermal_emissivity' },
  { unidad: 'K/W', variantes_texto: ['K/W'], magnitud: 'm_thermal_shock_parameter_r' },
  { unidad: 'kJ/kg', variantes_texto: ['kJ/kg'], magnitud: 'm_enthalpy_of_fusion' },
  { unidad: 'J/(m3·K)', variantes_texto: ['J/(m3·K)'], magnitud: 'm_capacidad_de_calor_volumetrico' },
  { unidad: '1/K', variantes_texto: ['1/K'], magnitud: 'm_coeficiente_de_expansion_termica_volumetrica' },
  { unidad: '°C', variantes_texto: ['°C'], magnitud: 'm_temperatura_de_curie' },
  { unidad: '°C', variantes_texto: ['°C'], magnitud: 'm_punto_de_reblandecimiento_equivalente_de_cono_pirometrico' },
  { unidad: 'W/(m·K)', variantes_texto: ['W/(m·K)'], magnitud: 'm_effective_thermal_conductivity' },
  { unidad: 'm2·K/W (ft2·°F·h/BTU)', variantes_texto: ['m2·K/W (ft2·°F·h/BTU)'], magnitud: 'm_resistencia_termica_valor_r' },
  { unidad: 'W/(m2·K)', variantes_texto: ['W/(m2·K)'], magnitud: 'm_transmitancia_termica_valor_u' },
  { unidad: 'J/(kg·K)', variantes_texto: ['J/(kg·K)'], magnitud: 'm_calor_especifico_a_volumen_constante' },
  { unidad: '°C', variantes_texto: ['°C'], magnitud: 'm_temperatura_de_cristalizacion' },
  { unidad: 'mm/año', variantes_texto: ['mm/año'], magnitud: 'm_corrosion_rate' },
  { unidad: 'V vs. SCE', variantes_texto: ['V vs. SCE'], magnitud: 'm_potencial_de_picada' },
  { unidad: 'μA/cm2', variantes_texto: ['μA/cm2'], magnitud: 'm_densidad_de_corriente_de_corrosion' },
  { unidad: 'V vs referencia', variantes_texto: ['V vs referencia'], magnitud: 'm_potencial_de_media_celula' },
  { unidad: 'Ω·cm2', variantes_texto: ['Ω·cm2'], magnitud: 'm_resistencia_a_la_polarizacion' },
  { unidad: 'm2/s', variantes_texto: ['m2/s'], magnitud: 'm_coeficiente_de_difusion' },
  { unidad: 'Barrer (10-10 cm3·cm/(cm2·s·cmHg))', variantes_texto: ['Barrer (10-10 cm3·cm/(cm2·s·cmHg))'], magnitud: 'm_coeficiente_de_permeabilidad_a_los_gases' },
  { unidad: 'mol/cm³', variantes_texto: ['mol/cm³'], magnitud: 'm_crosslink_density' },
  { unidad: 'g/mol', variantes_texto: ['g/mol'], magnitud: 'm_peso_molecular_promedio_en_numero' },
  { unidad: 'mg KOH/g', variantes_texto: ['mg KOH/g'], magnitud: 'm_acid_number' },
  { unidad: 'mg KOH/g', variantes_texto: ['mg KOH/g'], magnitud: 'm_hydroxyl_number' },
  { unidad: 'g/eq', variantes_texto: ['g/eq'], magnitud: 'm_epoxy_equivalent_weight' },
  { unidad: '% (a edad)', variantes_texto: ['% (a edad)'], magnitud: 'm_alkali_silica_reactivity_expansion' },
  { unidad: 'm2/s', variantes_texto: ['m2/s'], magnitud: 'm_chloride_diffusion_coefficient' },
  { unidad: 'mm', variantes_texto: ['mm'], magnitud: 'm_carbonation_depth' },
  { unidad: 'min', variantes_texto: ['min'], magnitud: 'm_tiempo_de_induccion_de_oxidacion' },
  { unidad: 'cm³(STP)/(cm³·Pa)', variantes_texto: ['cm³(STP)/(cm³·Pa)'], magnitud: 'm_solubility_coefficient' },
  { unidad: 'mV', variantes_texto: ['mV'], magnitud: 'm_redox_potential' },
  { unidad: '% peso', variantes_texto: ['% peso'], magnitud: 'm_equilibrium_moisture_content' },
  { unidad: 'g/10 min', variantes_texto: ['g/10 min'], magnitud: 'm_indice_de_flujo_de_fusion' },
  { unidad: 'Ω·m', variantes_texto: ['Ω·m'], magnitud: 'm_electrical_resistivity' },
  { unidad: 'Adimensional', variantes_texto: ['Adimensional'], magnitud: 'm_relative_permittivity_dielectric_constant' },
  { unidad: 'Adimensional', variantes_texto: ['Adimensional'], magnitud: 'm_dissipation_factor_loss_tangent' },
  { unidad: 'kV/mm', variantes_texto: ['kV/mm'], magnitud: 'm_dielectric_strength' },
  { unidad: 'Ω (Ω/sq)', variantes_texto: ['Ω (Ω/sq)'], magnitud: 'm_surface_resistivity' },
  { unidad: 'pC/N', variantes_texto: ['pC/N'], magnitud: 'm_coeficiente_de_carga_piezoelectrico' },
  { unidad: 'Adimensional', variantes_texto: ['Adimensional'], magnitud: 'm_electromechanical_coupling_factor' },
  { unidad: 'µV/K', variantes_texto: ['µV/K'], magnitud: 'm_seebeck_coefficient_thermopower' },
  { unidad: 'Adimensional', variantes_texto: ['Adimensional'], magnitud: 'm_relative_magnetic_permeability' },
  { unidad: 'A/m (emu/cm³)', variantes_texto: ['A/m (emu/cm³)'], magnitud: 'm_saturation_magnetization' },
  { unidad: 'A/m', variantes_texto: ['A/m'], magnitud: 'm_coercitividad' },
  { unidad: 'T', variantes_texto: ['T'], magnitud: 'm_remanence' },
  { unidad: 'eV', variantes_texto: ['eV'], magnitud: 'm_work_function' },
  { unidad: 'eV', variantes_texto: ['eV'], magnitud: 'm_band_gap_energy' },
  { unidad: 'cm²/(V·s)', variantes_texto: ['cm²/(V·s)'], magnitud: 'm_carrier_mobility' },
  { unidad: 'A/mm²', variantes_texto: ['A/mm²'], magnitud: 'm_critical_current_density' },
  { unidad: 'T', variantes_texto: ['T'], magnitud: 'm_upper_critical_field' },
  { unidad: 's', variantes_texto: ['s'], magnitud: 'm_arc_resistance' },
  { unidad: 'mJ/m² (mN/m)', variantes_texto: ['mJ/m² (mN/m)'], magnitud: 'm_surface_free_energy' },
  { unidad: 'µm', variantes_texto: ['µm'], magnitud: 'm_average_roughness_ra' },
  { unidad: 'm²/g', variantes_texto: ['m²/g'], magnitud: 'm_bet_specific_surface_area' },
  { unidad: 'MPa', variantes_texto: ['MPa'], magnitud: 'm_pull_off_adhesion_strength' },
  { unidad: 'GPa', variantes_texto: ['GPa'], magnitud: 'm_nanohardness' },
  { unidad: 'mN/m', variantes_texto: ['mN/m'], magnitud: 'm_critical_surface_tension' },
  { unidad: 'Unidades de brillo (GU)', variantes_texto: ['Unidades de brillo (GU)'], magnitud: 'm_gloso_especular' },
  { unidad: 'mg/1000 ciclos', variantes_texto: ['mg/1000 ciclos'], magnitud: 'm_indice_de_desgaste_de_taber' },
  { unidad: 'Mohs (1–10) o carga crítica', variantes_texto: ['Mohs (1–10) o carga crítica'], magnitud: 'm_dureza_de_aranazo' },
  { unidad: 'mN/m', variantes_texto: ['mN/m'], magnitud: 'm_energia_superficial_dispersa' },
  { unidad: 'mN/m', variantes_texto: ['mN/m'], magnitud: 'm_energia_de_la_superficie_polar' },
  { unidad: 'grados (°)', variantes_texto: ['grados (°)'], magnitud: 'm_histeresis_del_angulo_de_contacto' },
  { unidad: 'mm3/kg o μm/hora', variantes_texto: ['mm3/kg o μm/hora'], magnitud: 'm_tasa_de_erosion' },
  { unidad: 'µm³/(N·m)', variantes_texto: ['µm³/(N·m)'], magnitud: 'm_coeficiente_de_desgaste_de_la_temi' },
  { unidad: 'Adimensional', variantes_texto: ['Adimensional'], magnitud: 'm_numero_equivalente_de_resistencia_a_las_picaduras' },
  { unidad: 'kg CO₂-eq', variantes_texto: ['kg CO₂-eq'], magnitud: 'm_potencial_de_calentamiento_global_100a' },
  { unidad: 'kg CFC-11 eq', variantes_texto: ['kg CFC-11 eq'], magnitud: 'm_potencial_de_agotamiento_del_ozono' },
  { unidad: 'kg SO2-eq', variantes_texto: ['kg SO2-eq'], magnitud: 'm_potencial_de_acidificacion' },
  { unidad: 'kg PO₄-eq', variantes_texto: ['kg PO₄-eq'], magnitud: 'm_potencial_de_eutrofizacion' },
  { unidad: 'kg 1', variantes_texto: ['kg 1', '4-DCB eq'], magnitud: 'm_potencial_de_toxicidad_humana' },
  { unidad: 'USD', variantes_texto: ['USD'], magnitud: 'm_costo_del_ciclo_de_vida' },
  { unidad: '%', variantes_texto: ['%'], magnitud: 'm_contenido_reciclado' },
  { unidad: '% de degradación', variantes_texto: ['% de degradación'], magnitud: 'm_biodegradabilidad' },
  { unidad: 'años', variantes_texto: ['años'], magnitud: 'm_tiempo_de_amortizacion_de_energia' },
  { unidad: 'm³/kg', variantes_texto: ['m³/kg'], magnitud: 'm_water_footprint' },
  { unidad: 'g/L', variantes_texto: ['g/L'], magnitud: 'm_voc_content' },
  { unidad: 'mg/L (desecador)', variantes_texto: ['mg/L (desecador)'], magnitud: 'm_formaldehyde_emission_class' },
  { unidad: 'kg Sb eq', variantes_texto: ['kg Sb eq'], magnitud: 'm_potencial_de_agotamiento_abiotico_elementos' },
  { unidad: 'puntuación', variantes_texto: ['puntuación'], magnitud: 'm_indice_de_sostenibilidad' },
  { unidad: 'Índice', variantes_texto: ['Índice'], magnitud: 'm_volutial' },
  { unidad: 'kg CO₂/kg material', variantes_texto: ['kg CO₂/kg material'], magnitud: 'm_carbon_sequestration_potential' },
  { unidad: 'm2/s', variantes_texto: ['m2/s'], magnitud: 'm_coeficiente_de_difusion_fick' },
  { unidad: 'Barrer (10-10 cm3·cm/(cm2·s·cmHg))', variantes_texto: ['Barrer (10-10 cm3·cm/(cm2·s·cmHg))'], magnitud: 'm_coeficiente_de_permeabilidad' },
  { unidad: 'cm³(STP)/(cm³·Pa)', variantes_texto: ['cm³(STP)/(cm³·Pa)'], magnitud: 'm_solubility_coefficient_2' },
  { unidad: 'g/(m²·día)', variantes_texto: ['g/(m²·día)'], magnitud: 'm_water_vapor_transmission_rate' },
  { unidad: 'cm³/(m²·día·atm)', variantes_texto: ['cm³/(m²·día·atm)'], magnitud: 'm_oxygen_transmission_rate' },
  { unidad: '×10⁻¹² m²/s', variantes_texto: ['×10⁻¹² m²/s'], magnitud: 'm_chloride_migration_coefficient_rcm' },
  { unidad: 'm2/s', variantes_texto: ['m2/s'], magnitud: 'm_apparent_chloride_diffusion_coefficient' },
  { unidad: 'm²/(V·s)', variantes_texto: ['m²/(V·s)'], magnitud: 'm_ionic_mobility' },
  { unidad: 'Adimensional', variantes_texto: ['Adimensional'], magnitud: 'm_numero_de_transporte_numero_de_transferencia' },
  { unidad: 'm2/s', variantes_texto: ['m2/s'], magnitud: 'm_coeficiente_de_difusion_superficial' },
  { unidad: 'm2/s', variantes_texto: ['m2/s'], magnitud: 'm_knudsen_diffusion_coefficient' },
  { unidad: 'Adimensional', variantes_texto: ['Adimensional'], magnitud: 'm_factor_de_formacion' },
  { unidad: 'm²', variantes_texto: ['m²'], magnitud: 'm_gas_permeability_porous_media' },
  { unidad: 'm²', variantes_texto: ['m²'], magnitud: 'm_permeabilidad_al_aire' },
  { unidad: 'S/m', variantes_texto: ['S/m'], magnitud: 'm_conductividad_ionica' },
  { unidad: 'kg/kg por %HR', variantes_texto: ['kg/kg por %HR'], magnitud: 'm_ladera_isotermica_de_la_sorcion' },
  { unidad: 'Adimensional', variantes_texto: ['Adimensional'], magnitud: 'm_indice_de_refraccion' },
  { unidad: 'Adimensional', variantes_texto: ['Adimensional'], magnitud: 'm_coeficiente_de_extincion' },
  { unidad: 'cm−1', variantes_texto: ['cm−1'], magnitud: 'm_coeficiente_de_absorcion' },
  { unidad: '% o fracción (0–1)', variantes_texto: ['% o fracción (0–1)'], magnitud: 'm_transmitancia' },
  { unidad: '%', variantes_texto: ['%'], magnitud: 'm_reflectancia' },
  { unidad: '%', variantes_texto: ['%'], magnitud: 'm_absorcion' },
  { unidad: 'Adimensional', variantes_texto: ['Adimensional'], magnitud: 'm_densidad_optica' },
  { unidad: 'L* (0–100)', variantes_texto: ['L* (0–100)', 'a', 'b'], magnitud: 'm_coordenadas_de_color_cielab' },
  { unidad: '%', variantes_texto: ['%'], magnitud: 'm_haze' },
  { unidad: 'Adimensional', variantes_texto: ['Adimensional'], magnitud: 'm_birrefringencia' },
  { unidad: 'Adimensional', variantes_texto: ['Adimensional'], magnitud: 'm_numero_de_abbe' },
  { unidad: '10⁻¹² Pa⁻¹ (Brewster)', variantes_texto: ['10⁻¹² Pa⁻¹ (Brewster)'], magnitud: 'm_coeficiente_de_estres_optica' },
  { unidad: 'K⁻¹', variantes_texto: ['K⁻¹'], magnitud: 'm_coeficiente_termo_optico' },
  { unidad: 'J/cm²', variantes_texto: ['J/cm²'], magnitud: 'm_umbral_de_dano_inducido_por_laser' },
  { unidad: 'm²/W', variantes_texto: ['m²/W'], magnitud: 'm_indice_de_refraccion_no_lineal' },
  { unidad: 'cm/GW', variantes_texto: ['cm/GW'], magnitud: 'm_coeficiente_de_absorcion_de_dos_fotones' },
  { unidad: 'adimensional (0–1)', variantes_texto: ['adimensional (0–1)'], magnitud: 'm_rendimiento_cuantico_de_fluorescencia' },
  { unidad: 'Å3', variantes_texto: ['Å3'], magnitud: 'm_polarizacion' },
  { unidad: 'rad/(T·m)', variantes_texto: ['rad/(T·m)'], magnitud: 'm_constante_de_verdet' },
  { unidad: 'm/s', variantes_texto: ['m/s'], magnitud: 'm_velocidad_de_sonido_longitudinal' },
  { unidad: 'm/s', variantes_texto: ['m/s'], magnitud: 'm_velocidad_de_sonido_de_corte' },
  { unidad: 'Rayl (kg·m⁻²·s⁻¹)', variantes_texto: ['Rayl (kg·m⁻²·s⁻¹)'], magnitud: 'm_impedancia_acustica' },
  { unidad: 'dB/m', variantes_texto: ['dB/m', 'Np/m'], magnitud: 'm_coeficiente_de_atenuacion_acustica' },
  { unidad: 'dB', variantes_texto: ['dB'], magnitud: 'm_perdida_de_transmision_de_sonido' },
  { unidad: 'Adimensional (0–1)', variantes_texto: ['Adimensional (0–1)'], magnitud: 'm_coeficiente_de_absorcion_acustica' },
  { unidad: 'Adimensional', variantes_texto: ['Adimensional'], magnitud: 'm_coeficiente_de_reduccion_de_ruido' },
  { unidad: 'Rayl/m (Pa·s/m²)', variantes_texto: ['Rayl/m (Pa·s/m²)'], magnitud: 'm_resistividad_del_flujo_de_aire' },
  { unidad: 'fracción o %', variantes_texto: ['fracción o %'], magnitud: 'm_porosidad_abierta' },
  { unidad: 'μm', variantes_texto: ['μm'], magnitud: 'm_longitud_caracteristica_viscosa' },
  { unidad: 'μm', variantes_texto: ['μm'], magnitud: 'm_longitud_de_la_caracteristica_termica' },
  { unidad: 'GPa', variantes_texto: ['GPa'], magnitud: 'm_modulo_de_dynamic_young' },
  { unidad: 'Adimensional', variantes_texto: ['Adimensional'], magnitud: 'm_la_relacion_de_dynamic_poisson' },
  { unidad: 'Adimensional', variantes_texto: ['Adimensional'], magnitud: 'm_factor_de_perdida' },
];

// Devuelve el texto-regex-friendly de todas las variantes de una magnitud
export function variantesDeMagnitud(magnitud: string): string[] {
  return UNIDADES.filter(u => u.magnitud === magnitud).flatMap(u => u.variantes_texto);
}
