// ============================================================
// src/extraction-neurons/diccionarios/controversias.ts
// Controversias/debates científicos conocidos sobre cómo se mide
// o interpreta una propiedad. Se usan para enriquecer el campo
// 'observaciones' cuando una de las propiedades involucradas en
// una controversia conocida aparece en un hallazgo — una alerta
// de 'ojo, esto se mide/interpreta de más de una forma'.
//
// Fuente: extraído de DATOS_COMPLETOS.xlsx (respuesta de otra IA).
// El texto de 'descripcion' puede tener alguna frase repetida o
// mal traducida (artefacto de traducción automática) — se dejó
// tal cual porque es texto de referencia, no un término de búsqueda.
// ============================================================

export interface EntradaControversia {
  id: string;
  titulo_es: string;
  titulo_en: string;
  propiedades_involucradas: string;
  descripcion: string;
  impacto: string;
}

export const CONTROVERSIAS: EntradaControversia[] = [
  { id: 'definicion_de_la_temperatura_de_temperatura_vitrea_t_g', titulo_es: 'Definición de la temperatura de temperatura vítrea (T_g)', titulo_en: 'Debate sobre la definición de temperatura de transición ví',
    propiedades_involucradas: 'T_g',
    descripcion: 'La T_g no es un valor termodinámico único; velocidad de la de de/enfriamiento y de la técnica (DSC, DMA, dilatometría). Se si es una transición una transición de segundo de orden o un proceso cinético. Diferentes normas (ASTM E1356, ISO 11357) dar panidades para el polímero mismo.',
    impacto: 'Afecta las temperaturas máximas de uso en polímeros y la interpretación de datos de envejecimiento físico.' },
  { id: 'validez_del_limite_de_fatiga_verdadero_en_aleaciones_no_ferr', titulo_es: 'Validez del límite de fatiga "verdadero" en aleaciones no férreas', titulo_en: 'Verdadero límite de fatiga en aleaciones no ferrosas',
    propiedades_involucradas: 'Límite de fatiga (σ_f)',
    descripcion: 'Los aceros muestra un límite de definida (~10^7 ciclos), pero aleaciones de aluminio, magnesio, etc., no presente una presente unantota horizontal real en la curva S-N. Se debate si defefer debese una "resistencia a la debaña a N ciclos" en lugar de un límite absoluto.',
    impacto: 'El diseño a vida infinita en aleaciones ligeras requiere reconsideración; las normas (ASTM E466) reconocen esto estipulando "resistencia a la fatiga a 5×10^8 ciclos".' },
  { id: 'medicion_de_la_energia_superficial_de_solidos_fowkes_owens_w', titulo_es: 'Medición de la energía superficial de sólidos: ¿Fowkes, Owens-Wendt o van Oss?', titulo_en: 'Energía libre de superficie de sólidos: controversia de elección de modelo',
    propiedades_involucradas: 'Energía superficial (γ), componentes dispersiva y polar',
    descripcion: 'Existen múltiples modelos (Fowkes, Owens-Wendt, van Oss-Chaudhury-Good) para la superficial a superficial a parts de ángulos de contacto de distintos líquidos. Los valores y componentes y componentes según el modelo y la elección de líquidos de prueba.',
    impacto: 'Influye en el diseño de adhesivos, pinturabilidad, interacciones biológicas; no hay un método único normalizado que imponga el modelo.' },
  { id: 'dureza_vs_resistencia_a_la_traccion_correlacion_universal_cu', titulo_es: 'Dureza vs. resistencia a la tracción: correlación universal cuestionada', titulo_en: 'Hardness-yield strength correlation universality',
    propiedades_involucradas: 'Dureza (HV, HB), límite elástico',
    descripcion: 'La regla empírica HV ≈ 3·σ_y funciona para metales dúctiles, pero falla para materiales frágiles, nanoestructurados o con alta relación σ_y/E. La relación cambia con el endurecimiento por deformación y el efecto del tamaño de indentación.',
    impacto: 'Utilizar dureza para estimar resistencia sin validación puede llevar a errores en el diseño.' },
  { id: 'tenacidad_a_la_fractura_en_polimeros_ductiles_j_ic_vs_trabaj', titulo_es: 'Tenacidad a la fractura en polímeros dúctiles: J_IC vs. trabajo esencial de la fractura (EWF)', titulo_en: 'Tenacidad a la fractura en polímeros dúctiles: J_IC vs. EWF',
    propiedades_involucradas: 'Tenacidad a la fractura (J_IC)',
    descripcion: 'Para polímeros muy dúctiles (películas finas, elastómeros modificados), el ensayo J_IC (ASTM E1820) a menudo no cumple las condiciones de validez (pérdida de constricción, deformación plana). El método de trabajo esencial de fractura (EWF) emerge como alternativa más representativa, pero menos normalizado.',
    impacto: 'Caracterización de envases flexibles, polímeros de ingeniería; incertidumbre en la selección de la propiedad adecuada para simulación de impacto.' },
  { id: 'controversia_sobre_la_resistividad_superficial_como_propieda', titulo_es: 'Controversia sobre la "resistividad superficial" como propiedad', titulo_en: 'Surface resistivity: intrinsic vs. environmental property',
    propiedades_involucradas: 'Resistividad superficial (ρ_s)',
    descripcion: 'La ρ_s medida (ASTM D257) depende fuertemente de la humedad relativa y de la contaminación superficial, lo que genera debate sobre si es una propiedad del material o del sistema material-ambiente. Los valores entre laboratorios pueden variar órdenes de magnitud.',
    impacto: 'Provoca errores en la especificación de materiales aislantes para alta tensión; se requieren acondicionamientos rigurosos (23 °C, 50 % HR).' },
  { id: 'velocidad_de_corrosion_por_lpr_polarizacion_lineal_vs_perdid', titulo_es: 'Velocidad de corrosión por LPR (polarización lineal) vs. pérdida de masa gravimétrica', titulo_en: 'Tasa de corrosión: polarización lineal vs. discrepancia de pérdida de peso',
    propiedades_involucradas: 'Velocidad de corrosión, i_corr',
    descripcion: 'La resistencia de polarización (R_p) asume condiciones ideales de activación y uniformidad, pero en corrosión localizada o con películas porosas la tasa de corrosión electroquímica no concuerda con la pérdida de masa real.',
    impacto: 'Inadecuada estimación de vida útil en tuberías enterradas o estructuras marinas si se confía únicamente en LPR.' },
  { id: 'determinacion_de_la_tenacidad_al_impacto_charpy_vs_izod_e_in', titulo_es: 'Determinación de la tenacidad al impacto: Charpy vs. Izod e interpretación de KV', titulo_en: 'Charpy vs. Izod: correlation and size effects',
    propiedades_involucradas: 'Energía absorbida (KV, Izod)',
    descripcion: 'Los valores Charpy e Izod no son directamente convertibles debido a diferencias en la geometría de entalla y el estado de tensiones. Además, para espesores sub-size, el KV no sigue una relación lineal con el ancho, y la transición dúctil-frágil depende del tamaño.',
    impacto: 'Elección del ensayo correcto para especificar materiales en normativas (API, ASME) y peligro de extrapolaciones incorrectas.' },
  { id: 'coeficiente_de_poisson_negativo_auxeticos_propiedad_constitu', titulo_es: 'Coeficiente de Poisson negativo (auxéticos): ¿propiedad constitutiva o efecto estructural?', titulo_en: 'Negative Poisson’s ratio (auxetics): material property vs. structural effect',
    propiedades_involucradas: 'Coeficiente de Poisson (ν)',
    descripcion: 'La existencia de existencias con ν ν existencias negativosemoscada (espumas,), pero se debate hasta qué punto la auxeticidad independiente es una mano del material o el resultado de una estructura deformable (mecanismo). Algo argumentan que para un soso iso stable, ν debe ser entre -1 y 0.5, por lo que los auxéticos estánéticos permitidos, pero su fiable medición es un reto.',
    impacto: 'Desarrollo de materiales con absorción de energía y resistencia a la indentación singulares; la falta de normas específicas dificulta su comercialización.' },
  { id: 'extrapolacion_de_la_fluencia_creep_mediante_parametros_de_la', titulo_es: 'Extrapolación de la fluencia (creep) mediante parámetros de Larson-Miller: riesgo de error', titulo_en: 'Creep rupture extrapolation: Larson-Miller parameter controversy',
    propiedades_involucradas: 'Rotura por fluencia',
    descripcion: 'El parámetro de Larson-Miller (P = T(C + log t_r)) sumesifies de fluencias constantes, pero cambios microestructurales (precipitación, crecimiento de grano) a tiempos invalidan la extrapolación. Elección de la constante C (20–22 para aceros) es empírica y discutible.',
    impacto: 'Mal diseño de componentes de turbinas y calderería que operan a más de 100 000 horas; accidentes por sobreestimación de la vida remanente.' },
  { id: 'existe_un_verdadero_limite_elastico_microplasticidad_y_el_of', titulo_es: '¿Existe un verdadero límite elástico? Microplasticidad y el offset del 0,2 %', titulo_en: 'True elastic limit vs. proof stress (0.2%)',
    propiedades_involucradas: 'Límite elástico (σ_y)',
    descripcion: 'En metales policristalinos, la deformación plástica comienza en granos orientados favorablemente a tensiones muy bajas (límite elástico micro). El límite convencional al 0.2 % (ASTM E8) es práctico pero no mide el inicio de la plasticidad. Para micromecanismos, esto es crítico.',
    impacto: 'Afecta el diseño de sensores, MEMS y componentes sometidos a altísima precisión dimensional donde incluso microfluencia es inaceptable.' },
  { id: 'medicion_de_la_conductividad_metodos_estacionarios_vs_transi', titulo_es: 'Medición de la conductividad: métodos-estacionarios vs. transitorios', titulo_en: 'Conductividad térmica: estado estacionario frente a métodos transitorios',
    propiedades_involucradas: 'Conducta térmica (k)',
    descripcion: 'La placa caliente guardada (ASTM C177, estacionario) es referencia considerativa absoluta paras, pero es lenta y para materiales no homogéneos puede decir diferir de transitorios métodos (hilo, whist) a efectos de contacto y difusividad. La ISO 8301 vs. ASTM E1461 a veces dan discrepancias significativas para polímeros espumados.',
    impacto: 'Conflictos en especificaciones de aislamiento térmico para construcción; diferencias pueden superar el 10 %.' },
  { id: 'fragilizacion_por_hidrogeno_ensayo_de_traccion_lenta_vs_ensa', titulo_es: 'Fragilización por hidrógeno: ensayo de tracción lenta vs. ensayo de fractura incremental', titulo_en: 'Hydrogen embrittlement: slow strain rate vs. rising step load tests',
    propiedades_involucradas: 'Susceptibilidad a fragilización (HE)',
    descripcion: 'No hay un único ensayo que capture todos los mecanismos. El ensayo de tracción a baja velocidad (SSRT, ASTM G129) es severo y puede dar falsos positivos. El ensayo de escalones de carga (ASTM F1624) es más representativo de servicio pero complejo. Existe debate sobre cuál es el umbral de concentración crítica.',
    impacto: 'Selección de aceros para servicio en ambientes H₂S (oil & gas); consecuencias de fallos catastróficos.' },
  { id: 'efecto_del_en_duracion_indentacion_efecto_tamano', titulo_es: 'Efecto del en duración (Indentación Efecto Tamaño)', titulo_en: 'Indentation Size Effect (ISE) controversy',
    propiedades_involucradas: 'Dureza (HV, H_IT)',
    descripcion: 'La dureza medida disminuye al aumentar la carga de indentación a bajas cargas (<200 gf). Modelos como Nix-Gao basados en gradientes de deformación explican parcialmente el fenómeno, pero aún no hay consenso absoluto sobre si debe corregirse o reportarse siempre la carga.',
    impacto: 'Influye en la caracterización de recubrimientos finos y capas tratadas, donde el valor de dureza depende de la profundidad de penetración.' },
  { id: 'determinacion_de_la_porosidad_por_intrusion_de_mercurio_ink_', titulo_es: 'Determinación de la porosidad por intrusión de mercurio: "ink-bottle effect" y daño a la muestra', titulo_en: 'Mercury intrusion porosimetry: ink-bottle effect and sample damage',
    propiedades_involucradas: 'Porosidad, distribución de tamaño de poro',
    descripcion: 'La técnica (ISO 15901-1) es estándar, pero en materiales poco resistentes la alta presión (>200 MPa) puede colapsar poros, compactar la muestra y dar resultados erróneos. Además, el efecto "botella de tinta" (poros grandes con cuellos pequeños) sobreestima el volumen de poros pequeños.',
    impacto: 'Error en la caracterización de hormigones, zeolitas, aerogeles y materiales mesoporosos; puede dar distribuciones irreales.' },
  { id: 'angulo_de_contacto_el_problema_de_la_histeresis_y_la_linea_d', titulo_es: 'Ángulo de contacto: el problema de la histéresis y la línea de base', titulo_en: 'Contact angle: hysteresis and baseline interpretation',
    propiedades_involucradas: 'Ángulo de contacto (θ)',
    descripcion: 'La diferencia entre ángulo de avance y retroceso puede ser de decenas de grados. Se debate cuál valor (avance, retroceso, estático, o el de Young teórico) representa la energía superficial real. La rugosidad y heterogeneidad química son difíciles de desacoplar.',
    impacto: 'Impacta la clasificación de superficies autolimpiantes, adhesión y predicción de mojado.' },
  { id: 'conversion_de_escalas_de_dureza_rockwell_hrc_a_vickers_en_ac', titulo_es: 'Conversión de escalas de dureza: Rockwell-HRC a Vickers en aceros endurecidos', titulo_en: 'Hardness scale conversion: HRC to HV',
    propiedades_involucradas: 'Dureza',
    descripcion: 'Las tablas de conversión (ASTM E140) son empíricas y no universales; para aceros con la microestructura (martensita revenida, acerosss) la medida la mala Rockwell se corresponde con diferentes Vickers. Conversiones de usuarios genéricas paja en error error en .',
    impacto: 'Control de calidad en tratamientos térmicos; subestimación de la resistencia al desgaste.' },
  { id: 'significado_de_la_deflexion_de_deflexion_bajo_carga_htertemp', titulo_es: 'Significado de la "deflexión de deflexión bajo carga" (HTertemperatura) como propiedad de diseño térmico', titulo_en: 'HDT como parámetro de diseño: riesgo de dependencia excesiva',
    propiedades_involucradas: 'Temperatura de deflexión (HDT)',
    descripcion: 'La HDT (ASTM D648) es un ensayo de flexión de tres puntos con una carga fija que genera una tensión nominal de 0.455 o 1.82 MPa. No representa una temperatura máxima de uso continuo, pero a menudo se usa erróneamente como tal. La temperatura de servicio real depende del espesor, cargas reales y tiempo.',
    impacto: 'Riesgo de fallo prematuro en piezas plásticas estructurales si el diseño se basa solo en HDT sin considerar fluencia y relajación.' },
  { id: 'estandarizacion_de_ensayos_de_nanoindentacion_de_area_y_corr', titulo_es: 'Estandarización de ensayos de nanoindentación: de área y corrección efecto "pile-up/sink-in"', titulo_en: 'Nanoindentación: función de área y apilamiento/sumidero',
    propiedades_involucradas: 'Dureza y módulo de indentación',
    descripcion: 'El método Oliver-Pharr (ISO 14577) asume hundimiento (sink-in) calcular para el área de contacto. En materiales que forman amontonamiento (pile-up), el área real es mayor, sobrestimando dirección y módulo. La corrección requerida SEM/AFM perdora adicional, ventaja la de alta productividad.',
    impacto: 'Fiabilidad de datos en recubrimientos duros, materiales con alta relación E/σ_y y superficies modificadas.' },
  { id: 'contenido_de_cov_medio_a_reales_en_intereses_en', titulo_es: 'Contenido de COV medio a reales en intereses en', titulo_en: 'Contenido de COV vs. tasas de emisión',
    propiedades_involucradas: 'Contenido de COV (g/L)',
    descripcion: 'La norma ASTM D3960 mida COV en producto líquido, pero las reales emisiones en servicio dependen de la velocidad de tiempo, temperatura, y ventilación riego. Existe des entre entre el "contenido" y la calidad del aire interior (medida por ISO 16000).',
    impacto: 'Clasificación "bajas emisiones" puede ser engañosa; regulaciones como LEED/AgBB exigen ensayos de emisión en cámara, no solo contenido.' },
];

// Dado el nombre de una propiedad, busca si hay controversias
// conocidas que la mencionen (coincidencia de texto simple).
export function buscarControversiasDeInteres(nombrePropiedad: string): EntradaControversia[] {
  const termino = nombrePropiedad.toLowerCase();
  return CONTROVERSIAS.filter(c => c.propiedades_involucradas.toLowerCase().includes(termino));
}
