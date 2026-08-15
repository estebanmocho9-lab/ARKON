// ============================================================
// src/comprehension-neuron/validacion/validadorSemantico.ts
// Confirma que concepto → material → propiedad es una
// interpretación coherente. La Regla Crítica (Sección 6): nunca
// inventar especificidad — "Vermiculita" nunca se valida como si
// fuera "Vermiculita Expandida" salvo que el documento lo diga
// literalmente.
// ============================================================

import { Concepto, Material, Propiedad } from '../tipos/entidades';
import { Hipotesis } from '../tipos/hipotesis';
import { ResultadoValidacion, EstadoValidacion, crearResultado } from './resultadoValidacion';

function normalizar(t: string): string {
  return t
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export function validarSemantico(concepto: Concepto, material: Material | null, propiedad: Propiedad, hipotesis: Hipotesis): EstadoValidacion {
  return validarSemanticoDetallado(concepto, material, propiedad, hipotesis).estado;
}

export function validarSemanticoDetallado(concepto: Concepto, material: Material | null, propiedad: Propiedad, hipotesis: Hipotesis): ResultadoValidacion {
  const datosEvaluados = { propiedad: propiedad.id };

  // Sección 19/CASO D: si resolverMaterial() no pudo resolver nada
  // (material === null), esto NO es un FAIL — es exactamente el
  // caso "Vermiculita genérica, catálogo solo tiene Vermiculita
  // Expandida": queda PENDIENTE, nunca se fuerza la asociación.
  if (!material) {
    return crearResultado(
      'UNKNOWN',
      'SEMANTICO',
      'No se pudo resolver el concepto a un material del catálogo sin ambigüedad — la relación queda pendiente, no se fuerza ninguna asociación.',
      datosEvaluados
    );
  }

  // Regla Crítica: el texto del concepto tiene que corresponder
  // EXACTAMENTE al material resuelto (por nombre o sinónimo real)
  // — nunca a una versión "ampliada" de lo que el documento dijo.
  // Esto es la red de seguridad semántica, más allá de que
  // resolverMaterial.ts ya debería haber respetado esta regla — si
  // por algún motivo llegara acá una Hipotesis mal construida, este
  // validador la frena igual.
  const textoConcepto = normalizar(concepto.texto);
  const nombreMaterial = normalizar(material.nombre_principal);
  const coincideExacto = textoConcepto === nombreMaterial || material.sinonimos.some(s => normalizar(s) === textoConcepto);

  if (!coincideExacto) {
    // Caso concreto que esto atrapa: concepto "Vermiculita" pero
    // material resuelto "Vermiculita Expandida" — el material es
    // más específico que lo que el documento realmente dijo.
    return crearResultado(
      'FAIL',
      'SEMANTICO',
      `El concepto encontrado ("${concepto.texto}") no coincide exactamente con el material resuelto ("${material.nombre_principal}") — se estaría asumiendo una especificidad que el documento no declaró.`,
      datosEvaluados
    );
  }

  // Sección 7: no existe una lista de "propiedades típicas" por
  // material en este sistema, y a propósito no se inventa una acá
  // — una propiedad no típica NUNCA se rechaza solo por serlo. Si
  // resolverPropiedad.ts ya la resolvió sin ambigüedad, eso alcanza
  // para la validación semántica de la propiedad.
  return crearResultado('PASS', 'SEMANTICO', `El concepto "${concepto.texto}" coincide exactamente con "${material.nombre_principal}", y la propiedad fue resuelta sin ambigüedad.`, datosEvaluados);
}
