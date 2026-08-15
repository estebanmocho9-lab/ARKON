// src/core/dap.ts
// Modulo DAP - Deteccion Autonoma de Problemas

import { supabase } from '../supabase/client';
import { getValorNormalizado } from '../sheets/readVectors';
import { MotorInferencia } from '../inference/MotorInferencia';

const motor = new MotorInferencia();

export interface PropiedadFueraDeRango {
  propiedad: string;
  valor: number;
  nivel: 'warning' | 'critico';
  problemaMapeado: string;
}

export interface ResultadoDAP {
  materialId: string;
  tipoProducto: string;
  nombreMaterial: string;
  propiedadesProblema: PropiedadFueraDeRango[];
  problemasDetectados: string[];
  analisis: Record<string, {
    indice: number;
    nivel: string;
    confianza: number;
    cruces: Record<string, number>;
  }>;
  mejoras: { problema: string; causa: string; solucion: string; material_sugerido?: string }[];
  triz: { parametro: string; principios: string[] }[];
  materiales_alternativos: { id: string; nombre: string; razon: string }[];
}

export async function ejecutarDAP(
  materialId: string,
  tipoProducto: string
): Promise<ResultadoDAP> {

  console.log('\n DAP iniciado -> ' + materialId + ' | ' + tipoProducto);

  const { data: catalogo } = await supabase
    .from('catalogo_materiales')
    .select('*')
    .eq('id_material', materialId)
    .single();

  const nombreMaterial: string = catalogo ? catalogo.nombre : materialId;
  console.log('   Material identificado: ' + nombreMaterial);

  const { data: mision } = await supabase
    .from('mision_producto')
    .select('problemas_relevantes')
    .eq('tipo_producto', tipoProducto)
    .single();

  const problemasRelevantes: string[] = mision ? mision.problemas_relevantes : [];
  console.log('   Problemas relevantes: ' + problemasRelevantes.join(', '));

  const { data: umbrales } = await supabase
    .from('umbrales_dap')
    .select('*')
    .or('tipo_producto.eq.' + tipoProducto + ',tipo_producto.eq.general');

  const propiedadesProblema: PropiedadFueraDeRango[] = [];
  const problemasMap = new Map<string, number>();

  for (const umbral of (umbrales || [])) {
    const valor = await getValorNormalizado(materialId, umbral.propiedad);
    if (valor === null || valor === undefined) continue;

    let nivelDetectado: 'warning' | 'critico' | null = null;

    if (umbral.direccion === 'mayor_es_peor') {
      if (valor >= umbral.umbral_critico) nivelDetectado = 'critico';
      else if (valor >= umbral.umbral_warning) nivelDetectado = 'warning';
    } else {
      if (valor <= umbral.umbral_critico) nivelDetectado = 'critico';
      else if (valor <= umbral.umbral_warning) nivelDetectado = 'warning';
    }

    if (nivelDetectado) {
      propiedadesProblema.push({
        propiedad: umbral.propiedad,
        valor: valor,
        nivel: nivelDetectado,
        problemaMapeado: umbral.problema_mapeado,
      });
      const peso = nivelDetectado === 'critico' ? 2 : 1;
      problemasMap.set(
        umbral.problema_mapeado,
        (problemasMap.get(umbral.problema_mapeado) || 0) + peso
      );
    }
  }

  let problemasAAnalizar: string[] = Array.from(problemasMap.keys())
    .filter(function(p) {
      return problemasRelevantes.length === 0 || problemasRelevantes.includes(p);
    })
    .sort(function(a, b) {
      return (problemasMap.get(b) || 0) - (problemasMap.get(a) || 0);
    });

  if (problemasAAnalizar.length === 0 && problemasRelevantes.length > 0) {
    console.log('   Sin propiedades fuera de rango. Analizando mision completa.');
    problemasAAnalizar = problemasRelevantes;
  }

  console.log('   Problemas a analizar: ' + problemasAAnalizar.join(', '));

  const input = { materialId: materialId, estado: 'E01' as any };
  const analisis: ResultadoDAP['analisis'] = {};

  const resultados = await Promise.all(
    problemasAAnalizar.map(function(p) {
      return motor.analizarProblema(p, input)
        .then(function(r) { return { problema: p, resultado: r }; })
        .catch(function() { return null; });
    })
  );

  for (const res of resultados) {
    if (!res || res.resultado.indiceGlobal === 0) continue;
    let nivel = 'OK';
    if (res.resultado.indiceGlobal >= 70) nivel = 'CRITICO';
    else if (res.resultado.indiceGlobal >= 40) nivel = 'MODERADO';
    else if (res.resultado.indiceGlobal >= 10) nivel = 'LEVE';

    analisis[res.problema] = {
      indice: res.resultado.indiceGlobal,
      nivel: nivel,
      confianza: res.resultado.confianzaGlobal,
      cruces: res.resultado.resultadosCruces,
    };
  }

  const problemasCriticos: string[] = Array.from(new Set([
    ...Object.entries(analisis)
      .filter(function(entry) { return entry[1].indice >= 10; })
      .map(function(entry) { return entry[0].toLowerCase(); }),
    ...problemasRelevantes.map(function(p) { return p.toLowerCase(); })
  ]));
  const { data: mejorasData } = await supabase
    .from('mejoras')
    .select('problema, causa, solucion, material_sugerido')
    .in('problema', problemasCriticos.length > 0 ? problemasCriticos : ['_ninguno_']);

  const { data: trizData } = await supabase
    .from('triz_contradicciones')
    .select('param_triz_mejora, nombres_principios, propiedades_mejora')
    .eq('activo', true)
    .limit(10);

  const propiedadesConProblema = propiedadesProblema.map(function(p) { return p.propiedad; });

  const trizFiltrado = (trizData || [])
    .filter(function(t: any) {
      const props: string[] = Array.isArray(t.propiedades_mejora)
        ? t.propiedades_mejora
        : JSON.parse(t.propiedades_mejora || '[]');
      return props.some(function(p: string) { return propiedadesConProblema.includes(p); });
    })
    .slice(0, 3)
    .map(function(t: any) {
      const principios: string[] = Array.isArray(t.nombres_principios)
        ? t.nombres_principios.slice(0, 3)
        : JSON.parse(t.nombres_principios || '[]').slice(0, 3);
      return { parametro: t.param_triz_mejora, principios: principios };
    });

  const materialesAlternativos: ResultadoDAP['materiales_alternativos'] = [];

  if (catalogo && mejorasData && mejorasData.length > 0) {
    const ids: string[] = [];
    for (const m of mejorasData) {
      if (m.material_sugerido && !ids.includes(m.material_sugerido)) {
        ids.push(m.material_sugerido);
      }
    }
    for (const idSugerido of ids) {
      const { data: matSugerido } = await supabase
        .from('catalogo_materiales')
        .select('id_material, nombre, tipo, incompatible_con')
        .eq('id_material', idSugerido)
        .single();
      if (!matSugerido) continue;
      const incompatibles: string[] = catalogo.incompatible_con || [];
      if (incompatibles.includes(idSugerido)) continue;
      materialesAlternativos.push({
        id: matSugerido.id_material,
        nombre: matSugerido.nombre,
        razon: 'Compatible con ' + nombreMaterial + ' (tipo: ' + matSugerido.tipo + ')',
      });
    }
  }

  return {
    materialId: materialId,
    tipoProducto: tipoProducto,
    nombreMaterial: nombreMaterial,
    propiedadesProblema: propiedadesProblema,
    problemasDetectados: problemasAAnalizar,
    analisis: analisis,
    mejoras: mejorasData || [],
    triz: trizFiltrado,
    materiales_alternativos: materialesAlternativos,
  };
}
