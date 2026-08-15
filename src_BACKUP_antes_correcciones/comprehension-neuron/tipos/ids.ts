// ============================================================
// src/comprehension-neuron/tipos/ids.ts
// El sistema de identidad de ARKON. Formato: TIPO-XXXXXX (6
// dígitos, 000001 a 999999 POR CATEGORÍA — cada prefijo tiene su
// propio contador, no hay un contador global compartido).
//
// PIEZA CLAVE: un Registro de IDs persistente. La regla de oro es
// que un ID, una vez asignado, NUNCA cambia — ni si reordenás tu
// catálogo, ni si lo volvés a cargar desde Supabase en otro orden.
// Por eso el registro no calcula el ID por posición en un array
// (eso se rompe apenas insertás algo en el medio); lo calcula por
// una CLAVE NATURAL estable (ej. el nombre normalizado del
// material) y lo guarda en disco la primera vez que lo ve. La
// segunda vez que aparece la misma clave, devuelve el mismo ID de
// siempre — nunca inventa uno nuevo para lo que ya existía.
// ============================================================

import * as fs from 'fs';
import * as path from 'path';

// ── Un prefijo por tipo de entidad. Exactamente los que definiste
//    en la especificación. ───────────────────────────────────────
export type PrefijoId =
  | 'PAL' // palabra/token literal encontrado en el documento
  | 'CON' // concepto (combinación de palabras con significado propio)
  | 'MAT' // material
  | 'FAM' // familia de material
  | 'VAR' // variante de un material/concepto base
  | 'PRO' // propiedad
  | 'MAG' // magnitud física (densidad, temperatura, ph...)
  | 'DIM' // dimensión física (M L⁻³, Θ, adimensional...)
  | 'UNI' // unidad
  | 'COM' // componente (óxidos, elementos...)
  | 'NOR' // norma / organismo normativo
  | 'MET' // método de ensayo
  | 'INS' // instrumento
  | 'CND' // condición de ensayo
  | 'VAL' // valor concreto encontrado
  | 'REL' // relación (MAT tiene PRO con VAL en UNI)
  | 'EVI' // evidencia (de dónde salió)
  | 'HYP' // hipótesis (relación todavía no validada)
  | 'DOC' // documento
  | 'PAG' // página
  | 'BLQ' // bloque
  | 'TAB' // tabla
  | 'FIL' // fila
  | 'COL'; // columna

export type Id<P extends PrefijoId = PrefijoId> = `${P}-${string}`;

const DIGITOS = 6;

function formatearId(prefijo: PrefijoId, numero: number): Id {
  if (numero < 1 || numero > 999999) {
    throw new Error(`ID fuera de rango para ${prefijo}: ${numero} (el sistema soporta 000001-999999 por prefijo)`);
  }
  return `${prefijo}-${String(numero).padStart(DIGITOS, '0')}` as Id;
}

// ── Estructura del archivo de registro en disco. Un contador y un
//    mapa clave→id por cada prefijo, para que cada categoría tenga
//    su propia numeración independiente (MAT-000001 y PRO-000001
//    pueden coexistir sin pisarse, tal como lo pediste). ──────────
interface EstadoRegistro {
  contadores: Partial<Record<PrefijoId, number>>;
  asignaciones: Partial<Record<PrefijoId, Record<string, string>>>; // clave natural -> ID
}

export class RegistroIds {
  private estado: EstadoRegistro;
  private rutaArchivo: string;

  constructor(rutaArchivo: string) {
    this.rutaArchivo = rutaArchivo;
    this.estado = this.cargar();
  }

  private cargar(): EstadoRegistro {
    if (fs.existsSync(this.rutaArchivo)) {
      const contenido = fs.readFileSync(this.rutaArchivo, 'utf-8');
      return JSON.parse(contenido) as EstadoRegistro;
    }
    return { contadores: {}, asignaciones: {} };
  }

  private guardar(): void {
    const dir = path.dirname(this.rutaArchivo);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this.rutaArchivo, JSON.stringify(this.estado, null, 2), 'utf-8');
  }

  // ── Clave natural: normalizada (minúsculas, sin acentos, sin
  //    espacios extra) para que "Cemento Portland" y "cemento
  //    portland " sean la misma clave y no se dupliquen IDs. ──────
  private normalizarClave(clave: string): string {
    return clave
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  }

  // ── Devuelve el ID para esa clave: si ya existe, el mismo de
  //    siempre; si es nueva, le asigna el próximo número libre de
  //    ese prefijo y lo persiste. Esta es la función que hace TODO
  //    el trabajo del sistema de identidad. ────────────────────────
  obtenerOAsignar(prefijo: PrefijoId, claveNatural: string): Id {
    const clave = this.normalizarClave(claveNatural);
    if (!this.estado.asignaciones[prefijo]) this.estado.asignaciones[prefijo] = {};
    const asignaciones = this.estado.asignaciones[prefijo]!;

    if (asignaciones[clave]) return asignaciones[clave] as Id;

    const siguiente = (this.estado.contadores[prefijo] ?? 0) + 1;
    this.estado.contadores[prefijo] = siguiente;
    const id = formatearId(prefijo, siguiente);
    asignaciones[clave] = id;
    this.guardar();
    return id;
  }

  // ── Solo consulta, no asigna. Útil para saber si algo YA fue
  //    visto antes sin crear un ID nuevo por accidente. ────────────
  consultar(prefijo: PrefijoId, claveNatural: string): Id | null {
    const clave = this.normalizarClave(claveNatural);
    const id = this.estado.asignaciones[prefijo]?.[clave];
    return (id as Id) ?? null;
  }

  contarAsignados(prefijo: PrefijoId): number {
    return Object.keys(this.estado.asignaciones[prefijo] ?? {}).length;
  }

  todasLasAsignaciones(prefijo: PrefijoId): Record<string, Id> {
    return { ...(this.estado.asignaciones[prefijo] ?? {}) } as Record<string, Id>;
  }
}

// ── Instancia única compartida por todo el sistema — así todos los
//    archivos de diccionario/ usan el MISMO registro y nunca se
//    pisan los contadores entre sí. La ruta por defecto queda
//    fuera de src/ para que el registro (datos, no código) no se
//    mezcle con el código fuente en git — se puede versionar aparte
//    si querés que los IDs sean iguales en todas las máquinas. ────
export const registroIds = new RegistroIds(
  process.env.ARKON_REGISTRO_IDS_PATH || path.join(process.cwd(), 'datos', 'registro-ids.json')
);
