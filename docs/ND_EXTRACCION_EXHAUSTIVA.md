# ND — contrato de extracción documental exhaustiva

## Regla principal

ND no debe comportarse como un detector de palabras. Para cada entidad concreta debe construir:

`entidad concreta -> aspecto documental -> dato documental completo -> relación -> evidencia`

ND puede sobreextraer. La etapa posterior de curación será responsable de decidir qué información es útil para memoria científica. ND no debe resumir ni recortar información solo para ahorrar espacio.

## Definiciones

Una definición es un objeto documental completo. Si el documento define una entidad en una oración y la explicación continúa en el mismo párrafo o en párrafos consecutivos claramente pertenecientes al concepto, ND debe conservar el bloque completo.

Nunca guardar únicamente la oración o fragmento que contiene el término disparador.

Para una definición ND debe intentar conservar, cuando aparezcan:

- término definido;
- definición formal;
- definición operacional;
- qué es;
- qué representa;
- significado;
- características esenciales;
- categoría o clasificación;
- diferencia con conceptos próximos;
- sinónimos/equivalencias;
- condiciones necesarias o de validez;
- fundamento o principio;
- ejemplos y contraejemplos;
- fórmula asociada;
- unidades asociadas;
- propiedades asociadas;
- aplicación;
- contexto disciplinar;
- evidencia y fuente documental.

## Propiedades

Para una propiedad concreta, por ejemplo `pH`, ND debe intentar extraer toda la información documental disponible sobre:

- identidad, nombres, sinónimos, abreviaturas y símbolos;
- definición completa;
- qué es;
- qué representa;
- qué significa;
- qué mide;
- qué cuantifica;
- qué no mide;
- qué no representa;
- fundamento/principio;
- cómo se determina;
- cómo se mide;
- cómo se calcula;
- procedimiento y pasos;
- preparación de muestra;
- método y métodos alternativos;
- instrumento, sensor, detector y configuración;
- calibración y referencia;
- condiciones de medición;
- temperatura, presión, humedad, concentración, tiempo, atmósfera y estado físico cuando correspondan;
- valores, rangos, límites, umbrales e incertidumbre;
- unidades y conversiones;
- fórmulas, variables y dimensiones;
- dependencias;
- cómo cambia con otras variables;
- relaciones con otras propiedades;
- propiedades que la afectan;
- propiedades que afecta;
- comparaciones, similitudes y diferencias;
- subpropiedades, parámetros y tipos;
- aplicaciones;
- comportamiento;
- efectos y consecuencias;
- ventajas y limitaciones;
- excepciones y condiciones de validez;
- ejemplos;
- evidencia experimental y teórica;
- página, sección, tabla, figura y fragmento completo.

## Materiales y sustancias

Para un material concreto ND debe intentar extraer:

- identidad y sinónimos;
- definición completa;
- composición y proporciones;
- elementos, fases y componentes;
- estructura y microestructura;
- origen/procedencia;
- obtención, fabricación, preparación y procesamiento;
- tratamientos y aditivos;
- propiedades y valores de propiedades;
- características físicas, químicas, mecánicas, térmicas, eléctricas, ópticas y ambientales cuando estén documentadas;
- dependencias y condiciones;
- reacciones, interacciones, compatibilidades e incompatibilidades;
- estabilidad, durabilidad y degradación;
- comportamiento;
- aplicaciones y usos;
- ventajas, desventajas y limitaciones;
- riesgos;
- métodos e instrumentos de caracterización;
- normas;
- comparaciones y equivalencias;
- ejemplos;
- evidencia completa.

## Componentes

ND debe extraer identidad, tipo, función, composición, cantidad/proporción, estructura, propiedades, función dentro del material/sistema, qué aporta, qué modifica, qué propiedades afecta, interacciones, compatibilidad, preparación/incorporación, condiciones, aplicaciones, efectos, comportamiento, sustitutos, comparaciones, valores, normas y evidencia.

## Magnitudes

ND debe conservar nombre, símbolo, definición, significado, qué representa/mide/no mide, unidad, dimensión, sistema de unidades, escala, valores, rangos, límites, método de medición/cálculo, instrumento, condiciones, fórmula, variables relacionadas, dependencias, transformaciones, conversiones, relaciones, aplicaciones, incertidumbre, error, precisión, exactitud y evidencia.

## Atributos

ND debe extraer nombre, definición, qué caracteriza, categorías, valores posibles, clasificación, estado, condiciones, relación con la entidad, implicaciones, diferencias, entidades que pueden poseerlo, determinación, ejemplos, excepciones y evidencia.

## Relaciones

Toda relación debe conservar, cuando sea posible:

- entidad origen;
- entidad destino;
- tipo y dirección de relación;
- descripción;
- causa/efecto;
- dependencia;
- influencia;
- correlación;
- equivalencia;
- comparación;
- transformación;
- condición de la relación;
- intensidad/dirección del cambio si está documentada;
- evidencia.

## Condiciones

Conservar condición, variable, valor, unidad, rango, límite, umbral, estado, temperatura, presión, tiempo, humedad, concentración, composición, atmósfera, estado físico, condiciones iniciales/finales, condiciones experimentales/operativas, qué entidad afecta, qué propiedad modifica, qué método requiere y qué ocurre si cambia o no se cumple.

## Métodos

Extraer nombre, definición, propósito, qué determina/mide, principio, fundamento, procedimiento completo, pasos, preparación, equipos, instrumentos, reactivos/materiales, parámetros, condiciones, tiempos, cantidades, fórmulas/cálculos, resultados, unidades, precisión/exactitud, limitaciones, errores, ventajas, desventajas, métodos alternativos, comparaciones, aplicaciones, normas y evidencia.

## Instrumentos

Extraer nombre, tipo, función, qué mide/detecta, principio de funcionamiento, funcionamiento, componentes, configuración, sensores/detectores, rango, resolución, sensibilidad, precisión, exactitud, calibración, referencia, condiciones, limitaciones, método asociado, propiedades/magnitudes determinadas, preparación, aplicaciones, comparaciones y evidencia.

## Aplicaciones

Extraer aplicación, propósito, problema que resuelve, dónde se aplica, material/proceso, entidades involucradas, propiedades y magnitudes relevantes, condiciones, procedimiento, resultado esperado, beneficios, limitaciones, riesgos, comparaciones, casos de uso, ejemplos y evidencia.

## Comportamiento

Extraer entidad, comportamiento, condiciones, causa, evolución, variable que cambia, dirección, tasa si existe, umbrales, transiciones, respuesta a estímulos, respuesta a temperatura/presión/humedad/composición/tiempo, reversibilidad, estabilidad, consecuencias, excepciones y evidencia.

## Normas

Extraer nombre, código, organismo, región, versión, fecha, alcance, objeto, requisitos, límites, valores, métodos, instrumentos, condiciones, criterios de aceptación, clasificaciones, aplicaciones, relaciones con otras normas, equivalencias, excepciones y evidencia.

## Fórmulas

Conservar fórmula completa, nombre, qué calcula/representa, variables, símbolos, definición de variables, unidades, dimensiones, condiciones de validez, supuestos, derivación cuando aparezca, dependencias, ejemplos, aplicaciones, fórmulas relacionadas, aproximaciones, limitaciones y evidencia.

## Evidencia y trazabilidad

Todo hallazgo debe conservar, siempre que el PDF lo permita:

- documento;
- Drive ID;
- página;
- sección/capítulo;
- tabla;
- figura;
- posición inicial/final;
- idioma;
- fragmento documental completo;
- contexto suficiente;
- relación con la entidad;
- aspecto que demuestra.

## Persistencia

ND escribe únicamente en Turso. La persistencia debe continuar página por página durante la extracción. No acumular el documento completo en memoria para guardar al final.

## Separación de ND y NE

Este contrato pertenece exclusivamente a ND. No modifica ni revisa la lógica de las neuronas NE.
