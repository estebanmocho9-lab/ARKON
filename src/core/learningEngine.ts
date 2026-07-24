// ============================================
// IMPULSO IA — MOTOR DE APRENDIZAJE
// ============================================

import { Neurona, Experiencia } from '../types';
import { supabase } from '../supabase/client';

// --------------------------------------------
// APRENDER DESDE UN RESULTADO
// --------------------------------------------

export async function aprenderDesdeResultado(
  neurona: Neurona,
  material: string,
  descripcion: string,
  resultado: string,
  exitoso: boolean
): Promise<void> {

  // Buscar si ya existe experiencia similar
  const existente = neurona.experiencias.find(
    (exp) => exp.descripcion === descripcion && exp.material === material
  );

  if (existente) {
    existente.confirmaciones += 1;

    console.log(
      `🔄 Experiencia reforzada en "${neurona.nombre}": ${descripcion} (${existente.confirmaciones}x)`
    );

    await supabase
      .from('experiencias')
      .update({ confirmaciones: existente.confirmaciones })
      .eq('id', existente.id);

    // Actualizar confianza de la neurona
    actualizarConfianza(neurona);
    return;
  }

  // Crear nueva experiencia
  const nuevaExperiencia: Experiencia = {
    id: crypto.randomUUID(),
    descripcion,
    propiedad: neurona.nombre,
    material,
    resultado,
    confirmaciones: 1,
    fecha: new Date().toISOString(),
  };

  neurona.experiencias.push(nuevaExperiencia);

  const { error } = await supabase.from('experiencias').insert({
    id: nuevaExperiencia.id,
    neurona_id: neurona.id,
    descripcion: nuevaExperiencia.descripcion,
    propiedad: nuevaExperiencia.propiedad,
    material: nuevaExperiencia.material,
    resultado: nuevaExperiencia.resultado,
    confirmaciones: nuevaExperiencia.confirmaciones,
    fecha: nuevaExperiencia.fecha,
  });

  if (error) {
    console.error('❌ Error guardando experiencia:', error.message);
  } else {
    console.log(`✅ Nueva experiencia aprendida en "${neurona.nombre}": ${descripcion}`);
  }

  actualizarConfianza(neurona);
}

// --------------------------------------------
// ACTUALIZAR CONFIANZA DE LA NEURONA
// --------------------------------------------

function actualizarConfianza(neurona: Neurona): void {
  if (neurona.experiencias.length === 0) {
    neurona.confianza = 0;
    return;
  }

  const totalConfirmaciones = neurona.experiencias.reduce(
    (acc, exp) => acc + exp.confirmaciones,
    0
  );

  // Confianza sube con experiencias confirmadas
  neurona.confianza = Math.min(1, totalConfirmaciones / 20);

  console.log(
    `📈 Confianza actualizada en "${neurona.nombre}": ${(neurona.confianza * 100).toFixed(1)}%`
  );
}

// --------------------------------------------
// DETECTAR PATRONES DE APRENDIZAJE
// --------------------------------------------

export function detectarPatronesAprendizaje(neuronas: Neurona[]): string[] {
  const patrones: string[] = [];

  neuronas.forEach((neurona) => {
    // Experiencias muy confirmadas
    const expFuertes = neurona.experiencias.filter(
      (exp) => exp.confirmaciones >= 5
    );

    expFuertes.forEach((exp) => {
      patrones.push(
        `🧠 Patrón sólido en "${neurona.nombre}" (${exp.confirmaciones}x): ${exp.descripcion} → ${exp.resultado}`
      );
    });

    // Materiales que aparecen frecuentemente
    const conteoMateriales: Record<string, number> = {};
    neurona.experiencias.forEach((exp) => {
      conteoMateriales[exp.material] = (conteoMateriales[exp.material] || 0) + 1;
    });

    Object.entries(conteoMateriales).forEach(([material, veces]) => {
      if (veces >= 3) {
        patrones.push(
          `📦 Material frecuente en "${neurona.nombre}": ${material} aparece en ${veces} experiencias`
        );
      }
    });
  });

  return patrones;
}

// --------------------------------------------
// TRANSFERIR APRENDIZAJE ENTRE NEURONAS
// --------------------------------------------

export function transferirAprendizaje(
  neuronaOrigen: Neurona,
  neuronaDestino: Neurona
): void {
  const expTransferibles = neuronaOrigen.experiencias.filter(
    (exp) => exp.confirmaciones >= 3
  );

  let transferidas = 0;

  expTransferibles.forEach((exp) => {
    const yaExiste = neuronaDestino.experiencias.find(
      (e) => e.descripcion === exp.descripcion
    );

    if (!yaExiste) {
      neuronaDestino.experiencias.push({
        ...exp,
        id: crypto.randomUUID(),
        confirmaciones: Math.floor(exp.confirmaciones / 2),
      });
      transferidas++;
    }
  });

  if (transferidas > 0) {
    console.log(
      `🔀 Transferidas ${transferidas} experiencias de "${neuronaOrigen.nombre}" a "${neuronaDestino.nombre}"`
    );
    actualizarConfianza(neuronaDestino);
  }
}

// --------------------------------------------
// RESUMEN DE APRENDIZAJE GLOBAL
// --------------------------------------------

export function resumenAprendizaje(neuronas: Neurona[]): void {
  console.log('\n📊 RESUMEN DE APRENDIZAJE GLOBAL\n');

  let totalExperiencias = 0;
  let totalConfirmaciones = 0;

  neuronas.forEach((neurona) => {
    totalExperiencias += neurona.experiencias.length;
    totalConfirmaciones += neurona.experiencias.reduce(
      (acc, exp) => acc + exp.confirmaciones,
      0
    );

    if (neurona.experiencias.length > 0) {
      console.log(
        `  🧠 ${neurona.nombre}: ${neurona.experiencias.length} experiencias — confianza ${(neurona.confianza * 100).toFixed(1)}%`
      );
    }
  });

  console.log(`\n  Total experiencias: ${totalExperiencias}`);
  console.log(`  Total confirmaciones: ${totalConfirmaciones}\n`);
}