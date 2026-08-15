// ============================================================
// src/neurons/base/NeuronBase.ts
// Clase base abstracta para todas las neuronas científicas
// ============================================================

import { supabase } from '../../supabase/client';
import { evaluarExpresion, sumaPonderada } from '../../utils/mathHelpers';
import { ComponenteBase, NeuronInput, NeuronOutput, EstadoMaterial } from './tipos';
export type { NeuronInput, NeuronOutput, EstadoMaterial, ComponenteBase };
import { getValorNormalizado } from '../../sheets/readVectors'; // lee NORMALIZACION

// ── FLAG GLOBAL ANTI-LOOP ─────────────────────────────────────
// Rastrea qué neuronas están siendo procesadas en este momento.
// Si calcularIndicesIntermedios intenta llamar a una neurona que
// ya está en proceso, la omite en lugar de crear recursión infinita.
const _neuronasEnProceso = new Set<string>();

export abstract class NeuronBase {
  abstract readonly neuronId: string;
  abstract readonly propertyName: string;
  abstract readonly orientation: 'direct' | 'inverse';
  abstract readonly group: string;
  abstract readonly relatedProperties: string[];
  abstract readonly descripcion: string;
  abstract readonly unidadReferencia: string;

  readonly parametrosExtra: Record<string, any> = {};
  readonly rangoFisicoMin?: number;
  readonly rangoFisicoMax?: number;
  readonly confianzaPorDefecto: number = 0.95;
  readonly formulaMezclaPersonalizada?: string;
  readonly metodoInversoPersonalizado?: string;

  // ── MÉTODO PRINCIPAL ─────────────────────────────────────────
  async process(input: NeuronInput): Promise<NeuronOutput> {
    const startTime = Date.now();
    try {
      let valorCompuesto: number;
      let anomalias: string[] = [];
      let componentesUsados = 0;
      let indicesIntermedios: Record<string, number> = {};
      let materialTipo: string | undefined;

      if (input.valorDirecto !== undefined && input.valorDirecto !== null) {
        valorCompuesto = Math.min(100, Math.max(0, input.valorDirecto));
        componentesUsados = 1;

      } else if (input.componentes && input.componentes.length > 0) {
        const result = await this.calcularDesdeComponentes(input);
        valorCompuesto = result.valor;
        componentesUsados = result.componentesConDato;
        anomalias.push(...result.anomalias);

      } else {
        const valorSheet = await getValorNormalizado(input.materialId, this.propertyName);
        if (valorSheet !== null && !isNaN(valorSheet)) {
          valorCompuesto = Math.min(100, Math.max(0, valorSheet));
          componentesUsados = 1;
        } else {
          return this.outputVacio(input, `Sin dato en NORMALIZACION para ${input.materialId}/${this.propertyName}`);
        }
      }

      // ── ÍNDICES INTERMEDIOS ──────────────────────────────────
      // Solo si esta neurona NO está ya en proceso (anti-loop)
      if (!_neuronasEnProceso.has(this.propertyName)) {
        _neuronasEnProceso.add(this.propertyName);
        try {
          indicesIntermedios = await this.calcularIndicesIntermedios(input, valorCompuesto);
        } finally {
          _neuronasEnProceso.delete(this.propertyName);
        }
      }

      // ── TIPO DEL MATERIAL ────────────────────────────────────
      const matInfo = await this.obtenerTipoMaterial(input.materialId);
      if (matInfo.tipo) materialTipo = matInfo.tipo;

      const { inverso, metodoUsado } = await this.calcularInverso(valorCompuesto);
      const anomaliasConsistencia = this.verificarConsistencia(valorCompuesto, inverso, metodoUsado);
      anomalias.push(...anomaliasConsistencia);

      this.guardarMemoria(input, valorCompuesto, inverso, anomalias, componentesUsados, indicesIntermedios).catch(e => console.warn(e));

      return {
        neuronId: this.neuronId,
        propertyName: this.propertyName,
        materialId: input.materialId,
        estado: input.estado,
        valorCompuesto: Math.round(valorCompuesto * 100) / 100,
        valorInverso: Math.round(inverso * 100) / 100,
        confianza: anomalias.length === 0 ? this.confianzaPorDefecto : 0.70,
        anomalias,
        propiedadPendiente: false,
        metadatos: {
          tiempoMs: Date.now() - startTime,
          componentesUsados,
          metodoInverso: metodoUsado,
          formulasEvaluadas: Object.keys(indicesIntermedios).length
        },
        indicesIntermedios,
        materialTipo
      };
    } catch (error: any) {
      console.error(`[Neurona ${this.neuronId}] Error:`, error);
      return this.outputVacio(input, `Error interno: ${error.message}`);
    }
  }

  // ── MEZCLA DESDE COMPONENTES ─────────────────────────────────
  private async calcularDesdeComponentes(input: NeuronInput): Promise<{
    valor: number; componentesConDato: number; anomalias: string[]
  }> {
    const componentes = input.componentes!;
    const { tipo: tipoMat } = await this.obtenerTipoMaterial(input.materialId);
    const regla = await this.obtenerReglaMezcla(tipoMat ?? undefined);
    const items: { fraccion: number; valor: number }[] = [];
    const anomalias: string[] = [];

    for (const comp of componentes) {
      const valor = await getValorNormalizado(comp.materialId, this.propertyName);
      if (valor === null || isNaN(valor)) {
        anomalias.push(`sin_dato_en_sheet:${comp.materialId}/${this.propertyName}`);
        continue;
      }
      let valorFinal = valor;
      if (input.estado && input.estado !== 'E01') {
        valorFinal = await this.aplicarTransformacionEstado(valorFinal, comp.materialId);
      }
      items.push({ fraccion: comp.fraccion, valor: valorFinal });
    }

    if (items.length === 0) throw new Error(`Ningún componente tiene dato en Sheet para ${this.propertyName}`);

    const fraccionTotal = items.reduce((s, i) => s + i.fraccion, 0);
    const fraccionesNorm = items.map(i => i.fraccion / fraccionTotal);
    const valores = items.map(i => i.valor);

    let valorCompuesto: number;
    try {
      valorCompuesto = this.evaluarFormulaMezcla(regla.formula, fraccionesNorm, valores);
      valorCompuesto = Math.min(100, Math.max(0, valorCompuesto));
    } catch (err: any) {
      anomalias.push(`error_formula_mezcla:${err.message}`);
      valorCompuesto = sumaPonderada(fraccionesNorm, valores);
    }

    return { valor: valorCompuesto, componentesConDato: items.length, anomalias };
  }

  // ── REGLA DE MEZCLA ──────────────────────────────────────────
  private async obtenerReglaMezcla(materialTipo?: string): Promise<{ formula: string }> {
    if (materialTipo) {
      const { data: dataEsp } = await supabase
        .from('reglas_mezcla').select('formula')
        .eq('propiedad_nombre', this.propertyName).eq('activo', true)
        .eq('tipo_material_aplica', materialTipo).limit(1).maybeSingle();
      if (dataEsp) return { formula: dataEsp.formula };
    }
    const { data, error } = await supabase
      .from('reglas_mezcla').select('formula')
      .eq('propiedad_nombre', this.propertyName).eq('activo', true)
      .limit(1).single();
    if (error || !data) return { formula: 'ponderada_lineal' };
    return { formula: data.formula };
  }

  private evaluarFormulaMezcla(formula: string, fracciones: number[], valores: number[]): number {
    if (formula === 'ponderada_lineal' || !formula) return sumaPonderada(fracciones, valores);
    return evaluarExpresion(formula, { fracciones, valores });
  }

  // ── TRANSFORMACIÓN DE ESTADO ─────────────────────────────────
  private async aplicarTransformacionEstado(valorInicial: number, materialId: string): Promise<number> {
    const { familia } = await this.obtenerTipoMaterial(materialId);
    if (familia) {
      const { data: dataF } = await supabase
        .from('transformaciones_estado').select('factor_multiplicador, formula_avanzada')
        .eq('propiedad_nombre', this.propertyName).eq('activo', true)
        .eq('material_familia', familia).maybeSingle();
      if (dataF) return this.aplicarFactorTransformacion(dataF, valorInicial);
    }
    const { data, error } = await supabase
      .from('transformaciones_estado').select('factor_multiplicador, formula_avanzada')
      .eq('propiedad_nombre', this.propertyName).eq('activo', true).maybeSingle();
    if (error || !data) return valorInicial;
    return this.aplicarFactorTransformacion(data, valorInicial);
  }

  private aplicarFactorTransformacion(
    data: { factor_multiplicador: number | null; formula_avanzada: string | null },
    valorInicial: number
  ): number {
    if (data.formula_avanzada) {
      try { return evaluarExpresion(data.formula_avanzada, { valor: valorInicial }); }
      catch { return valorInicial; }
    } else if (data.factor_multiplicador) {
      return Math.min(100, Math.max(0, valorInicial * data.factor_multiplicador));
    }
    return valorInicial;
  }

  // ── INVERSO ───────────────────────────────────────────────────
  private async calcularInverso(valorDirecto: number): Promise<{ inverso: number; metodoUsado: string }> {
    const { data } = await supabase
      .from('propiedades').select('metodo_inverso, params_inverso')
      .eq('nombre', this.propertyName).maybeSingle();
    const metodo = data?.metodo_inverso || 'complemento_100';
    const params = data?.params_inverso || {};
    let inverso = 50;
    switch (metodo) {
      case 'complemento_100': inverso = 100 - valorDirecto; break;
      case 'reciproco': inverso = Math.min(100, 100 * (1 / (valorDirecto + 0.01))); break;
      case 'simetria_centro':
        const centro = params.centro ?? 50;
        inverso = Math.min(100, Math.max(0, 2 * centro - valorDirecto)); break;
      default: inverso = 100 - valorDirecto;
    }
    return { inverso, metodoUsado: metodo };
  }

  // ── CONSISTENCIA ─────────────────────────────────────────────
  private verificarConsistencia(directo: number, inverso: number, metodo: string): string[] {
    const anomalias: string[] = [];
    if (metodo === 'complemento_100') {
      const suma = directo + inverso;
      if (Math.abs(suma - 100) > 2) anomalias.push(`suma_inconsistente:${suma.toFixed(1)}`);
    }
    if (directo < 0 || directo > 100) anomalias.push(`directo_fuera_rango:${directo}`);
    if (inverso < 0 || inverso > 100) anomalias.push(`inverso_fuera_rango:${inverso}`);
    return anomalias;
  }

  // ── MEMORIA ───────────────────────────────────────────────────
  private async guardarMemoria(
    input: NeuronInput, compuesto: number, inverso: number,
    anomalias: string[], componentesUsados: number,
    indicesIntermedios: Record<string, number> = {}
  ) {
    await supabase.from('memoria_neuronas').insert({
      neurona_id: this.neuronId,
      propiedad_nombre: this.propertyName,
      material_id: input.materialId,
      valor_compuesto: compuesto,
      valor_inverso: inverso,
      confianza: anomalias.length === 0 ? this.confianzaPorDefecto : 0.70,
      anomalias,
      indices_intermedios: indicesIntermedios,
      contexto: { componentes: input.componentes, estado: input.estado, componentesUsados },
      creado_en: new Date().toISOString()
    });
  }

  // ── OUTPUT VACÍO ──────────────────────────────────────────────
  private outputVacio(input: NeuronInput, razon: string): NeuronOutput {
    console.warn(`  ⏳ [${this.neuronId}] PENDIENTE — ${razon}`);
    return {
      neuronId: this.neuronId,
      propertyName: this.propertyName,
      materialId: input.materialId,
      estado: input.estado,
      valorCompuesto: 50,
      valorInverso: 50,
      confianza: 0,
      anomalias: [razon],
      propiedadPendiente: true,
      metadatos: {},
      indicesIntermedios: {},
      materialTipo: undefined
    };
  }

  // ── TIPO DE MATERIAL ─────────────────────────────────────────
  private async obtenerTipoMaterial(materialId: string): Promise<{
    tipo: string | null; familia: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('catalogo_materiales').select('tipo, familia')
        .eq('id_material', materialId).maybeSingle();
      if (error || !data) return { tipo: null, familia: null };
      return { tipo: data.tipo ?? null, familia: data.familia ?? null };
    } catch {
      return { tipo: null, familia: null };
    }
  }

  // ── ÍNDICES INTERMEDIOS ───────────────────────────────────────
  protected async calcularIndicesIntermedios(
    input: NeuronInput,
    valorPropio: number
  ): Promise<Record<string, number>> {
    const indices: Record<string, number> = {};

    let NEURON_MAP: Record<string, NeuronBase>;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      NEURON_MAP = require('../index').NEURON_MAP;
    } catch {
      return indices;
    }

    const formulas = await this.consultarFormulas();
    if (formulas.length === 0) return indices;

    for (const formula of formulas) {
      try {
        const fc = formula.forma_computable?.trim();
        if (!fc) continue;
        if (formula.propiedad_a === 'ninguna') continue;
        if (fc.includes('for ') || fc.includes('sum(') || fc.startsWith('#')) continue;

        const scope: Record<string, number> = {};
        scope[this.propertyName] = valorPropio;

        const otraPropiedad =
          formula.propiedad_a === this.propertyName
            ? formula.propiedad_b
            : formula.propiedad_a;

        if (otraPropiedad && otraPropiedad !== 'ninguna') {
          if (_neuronasEnProceso.has(otraPropiedad)) {
            // La otra neurona está en proceso → usar contexto si existe
            const valorCtx = (input.contexto as any)?.[otraPropiedad];
            if (valorCtx !== undefined && valorCtx !== null) {
              scope[otraPropiedad] = valorCtx;
            } else {
              continue; // No tenemos el valor → omitir fórmula
            }
          } else if (NEURON_MAP[otraPropiedad]) {
            _neuronasEnProceso.add(otraPropiedad);
            try {
              const otraOutput = await NEURON_MAP[otraPropiedad].process(input);
              if (!otraOutput.propiedadPendiente) {
                scope[otraPropiedad] = otraOutput.valorCompuesto;
              }
            } finally {
              _neuronasEnProceso.delete(otraPropiedad);
            }
          }
        }

        // Extraer lado derecho del "="
        let expresion = fc;
        const eqIndex = fc.indexOf('=');
        if (eqIndex !== -1 &&
          !fc.substring(0, eqIndex).includes('!') &&
          !fc.substring(0, eqIndex).includes('<') &&
          !fc.substring(0, eqIndex).includes('>')) {
          expresion = fc.substring(eqIndex + 1).trim();
        }

        const resultado = evaluarExpresion(expresion, scope);

        if (!isNaN(resultado) && isFinite(resultado)) {
          const clave = (formula.output_nombre || formula.id)
            .toLowerCase().replace(/\s+/g, '_')
            .replace(/[éèê]/g, 'e').replace(/[áàâ]/g, 'a')
            .replace(/[íìî]/g, 'i').replace(/[óòô]/g, 'o')
            .replace(/[úùû]/g, 'u').replace(/[^a-z0-9_]/g, '');
          indices[clave] = Math.round(resultado * 1000) / 1000;
        }
      } catch {
        // Silencioso: fórmulas con constantes externas fallan esperablemente
      }
    }

    return indices;
  }

  // ── CONSULTAS PÚBLICAS A SUPABASE ─────────────────────────────

  async consultarFormulas(): Promise<{
    id: string; nombre: string; descripcion: string; ecuacion: string;
    forma_computable: string; propiedad_a: string; propiedad_b: string;
    tipo_relacion: string; output_nombre: string;
    peso_cientifico: number; confianza: number;
  }[]> {
    const { data, error } = await supabase
      .from('scientific_formulas')
      .select('id, nombre, descripcion, ecuacion, forma_computable, propiedad_a, propiedad_b, tipo_relacion, output_nombre, peso_cientifico, confianza')
      .or(`propiedad_a.eq.${this.propertyName},propiedad_b.eq.${this.propertyName}`)
      .order('peso_cientifico', { ascending: false });
    if (error || !data) return [];
    return data as any[];
  }

  async consultarTriz(): Promise<any[]> {
    const { data, error } = await supabase
      .from('triz_contradicciones').select('*').eq('activo', true);
    if (error || !data) return [];
    return data.filter((row: any) => {
      const m = Array.isArray(row.propiedades_mejora) ? row.propiedades_mejora : JSON.parse(row.propiedades_mejora || '[]');
      const e = Array.isArray(row.propiedades_empeora) ? row.propiedades_empeora : JSON.parse(row.propiedades_empeora || '[]');
      return m.includes(this.propertyName) || e.includes(this.propertyName);
    });
  }

  async consultarMejoras(valorActual: number): Promise<any[]> {
    const { data, error } = await supabase
      .from('reglas_mejora').select('id, neurona_id, condicion, solucion, prioridad')
      .eq('neurona_id', this.neuronId).order('prioridad', { ascending: true });
    if (error || !data) return [];
    return data.filter((regla: any) => {
      try {
        const exp = regla.condicion.replace(/valor/g, String(valorActual));
        // eslint-disable-next-line no-new-func
        return new Function(`return (${exp})`)() === true;
      } catch { return false; }
    });
  }
}