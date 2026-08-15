// ============================================================
// src/turso/guardarFichaPropiedad.ts
// VERSION FINAL: cada campo guarda una LISTA de respuestas
// (una por cada libro que la mencione), no una sola respuesta
// que se pisa o se descarta. Cada respuesta lleva su propia
// fuente (documento + pagina) e idioma.
//
// No hace falta cambiar la tabla — las columnas ya son TEXT,
// ahora guardan un JSON con la lista adentro en vez de un texto
// suelto.
// ============================================================

import { turso } from './tursoClient';
import { HallazgoDefinicion } from '../extraction-neurons/base/extractorDefiniciones';
import { PROPIEDADES } from '../extraction-neurons/diccionarios/propiedades';

// Campos que se buscan en los libros y ACUMULAN varias respuestas
const COLUMNAS_ACUMULABLES = new Set([
  'definicion', 'formula', 'sinonimos_tecnicos', 'sinonimos_informales_industria',
  'tipo_propiedad', 'es_primaria_o_derivada', 'es_intensiva_o_extensiva',
  'es_sensorial_o_instrumental', 'variantes_o_subtipos', 'diferenciacion_con_conceptos_similares',
  'metodos_de_medicion', 'instrumentos_tipicos', 'normas_relacionadas', 'unidades_comunes',
  'errores_comunes_de_medicion', 'dificultad_de_medicion', 'costo_relativo_del_ensayo_de_laboratorio',
  'precision_tipica', 'riesgos_de_seguridad_al_medir', 'factores_ambientales_que_afectan_la_medicion',
  'de_que_depende', 'como_cambia_con_condiciones',
  'compatibilidad_con_otras_propiedades', 'incompatibilidad_con_otras_propiedades',
  'efecto_al_combinarse_con_otras', 'dominancia_en_mezcla', 'umbrales_de_cambio_en_mezcla',
  'ejemplos_de_combinaciones_conocidas', 'sinergias_conocidas', 'efectos_adversos_conocidos',
  'rango_tipico_por_familia_material', 'ejemplos_extremos_conocidos',
  'que_mide', 'para_que_sirve_saberlo', 'donde_se_usa_en_la_practica', 'aplicacion_por_industria',
  // Segunda tanda (20 campos nuevos)
  'historia_origen_descubrimiento', 'que_no_mide', 'materiales_donde_aparece', 'materiales_donde_no_aplica',
  'variables_de_la_formula', 'tipo_de_relacion_con_otras_propiedades',
  'consecuencias_si_aumenta', 'consecuencias_si_disminuye',
  'ventajas_de_esta_propiedad', 'limitaciones_o_problemas_conocidos', 'controversias_cientificas',
  'recomendaciones_de_uso', 'metodos_alternativos_de_medicion', 'tecnologias_emergentes_relacionadas',
  'por_que_es_importante', 'significado_fisico', 'relacion_con_microestructura',
  'estado_del_material_que_afecta', 'casos_reales_documentados', 'valores_teoricos_vs_experimentales',
  // Tercera tanda (2 campos nuevos)
  'componentes_donde_aparece', 'propiedad_inversa_o_negativa',
]);

interface Respuesta {
  respuesta: string;
  documento: string;
  pagina: number;
  idioma: 'es' | 'en';
}

function buscarEnDiccionario(nombrePropiedad: string) {
  return PROPIEDADES.find((p) => p.id === nombrePropiedad);
}

// Evita guardar la misma respuesta dos veces, incluso si una es
// una version recortada/desplazada de la otra (mismo texto, distinto
// punto de corte) — no solo si son identicas letra por letra.
function normalizarParaComparar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function sonMuySimilares(a: string, b: string): boolean {
  const na = normalizarParaComparar(a);
  const nb = normalizarParaComparar(b);

  if (na === nb) return true;
  // Una contenida dentro de la otra (version recortada del mismo fragmento)
  if (na.length > 20 && nb.length > 20) {
    if (na.includes(nb) || nb.includes(na)) return true;
  }

  // Superposicion de palabras: si comparten la gran mayoria de
  // palabras, es la misma oracion vista desde otro punto de corte
  const palabrasA = new Set(na.split(' ').filter((w) => w.length > 3));
  const palabrasB = new Set(nb.split(' ').filter((w) => w.length > 3));
  if (palabrasA.size === 0 || palabrasB.size === 0) return false;

  const interseccion = [...palabrasA].filter((w) => palabrasB.has(w)).length;
  const menor = Math.min(palabrasA.size, palabrasB.size);
  return interseccion / menor > 0.75;
}

function yaExisteRespuestaIgual(lista: Respuesta[], nuevaRespuesta: string): boolean {
  return lista.some((r) => sonMuySimilares(r.respuesta, nuevaRespuesta));
}

export async function guardarHallazgosDefinicion(
  documento: string,
  pagina: number,
  hallazgos: HallazgoDefinicion[]
): Promise<void> {
  for (const h of hallazgos) {
    if (!COLUMNAS_ACUMULABLES.has(h.campo)) continue;

    try {
      const existente = await turso.execute({
        sql: `SELECT id, ${h.campo} as valor_actual, fuentes FROM fichas_propiedades WHERE nombre_propiedad = ?`,
        args: [h.nombre_propiedad],
      });

      const nuevaRespuesta: Respuesta = {
        respuesta: h.contenido,
        documento,
        pagina,
        idioma: h.idioma,
      };

      if (existente.rows.length === 0) {
        // Ficha nueva: se crea, autocompletando lo que ya se conoce
        // del diccionario (esto sigue siendo un dato unico, no una lista)
        const infoDiccionario = buscarEnDiccionario(h.nombre_propiedad);
        const simbolo = infoDiccionario?.simbolos?.length ? infoDiccionario.simbolos.join(', ') : null;

        await turso.execute({
          sql: `INSERT INTO fichas_propiedades
                (nombre_propiedad, nombre_ingles, simbolo, ${h.campo}, fuentes, idioma_fuente, estado)
                VALUES (?, ?, ?, ?, ?, ?, 'pendiente')`,
          args: [
            h.nombre_propiedad,
            infoDiccionario?.nombre_en || null,
            simbolo,
            JSON.stringify([nuevaRespuesta]),
            JSON.stringify([{ documento, pagina }]),
            h.idioma,
          ],
        });
      } else {
        const fila = existente.rows[0] as any;

        let listaActual: Respuesta[] = [];
        if (fila.valor_actual) {
          try {
            listaActual = JSON.parse(fila.valor_actual);
            if (!Array.isArray(listaActual)) listaActual = []; // por si quedo un texto viejo de la version anterior
          } catch {
            listaActual = [];
          }
        }

        if (yaExisteRespuestaIgual(listaActual, nuevaRespuesta.respuesta)) continue;

        listaActual.push(nuevaRespuesta);

        const fuentesActuales = fila.fuentes ? JSON.parse(fila.fuentes) : [];
        fuentesActuales.push({ documento, pagina, campo: h.campo });

        await turso.execute({
          sql: `UPDATE fichas_propiedades SET ${h.campo} = ?, fuentes = ? WHERE id = ?`,
          args: [JSON.stringify(listaActual), JSON.stringify(fuentesActuales), fila.id],
        });
      }
    } catch (error) {
      console.error(`Error guardando ficha de "${h.nombre_propiedad}" campo "${h.campo}":`, error);
    }
  }
}
