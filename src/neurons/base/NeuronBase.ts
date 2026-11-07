// ============================================================
// src/neurons/base/NeuronBase.ts
// Clase base abstracta para todas las neuronas científicas
// ============================================================

import { supabase } from '../../supabase/client';
import { evaluarExpresion, sumaPonderada } from '../../utils/mathHelpers';
import { ComponenteBase, NeuronInput, NeuronOutput, EstadoMaterial } from './tipos';
export type { NeuronInput, NeuronOutput, EstadoMaterial, ComponenteBase };
import { getValorNormalizado, readVectorsFromSheet } from '../../sheets/readVectors';

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
        const valorFuente = input.dataProvider
          ? await input.dataProvider.getNormalizedValue(input.materialId, this.propertyName, input.estado)
          : this.orientation === 'direct'
            ? null
            : await getValorNormalizado(input.materialId, this.propertyName, input.estado);
        if (valorFuente !== null && !isNaN(valorFuente)) {
          valorCompuesto = Math.min(100, Math.max(0, valorFuente));
          componentesUsados = 1;
        } else {
          const razon = input.dataProvider
            ? `Sin dato normalizado ARKON 0–100 verificable en Turso para ${input.materialId}/${this.propertyName}; la evidencia documental se conserva para revisión.`
            : this.orientation === 'direct'
              ? `Neurona directa sin proveedor cerebral para ${input.materialId}/${this.propertyName}; no se consulta Google Sheets.`
              : `Sin dato en NORMALIZACION para ${input.materialId}/${this.propertyName}`;
          return this.outputVacio(input, razon);
        }
      }

      if (!_neuronasEnProceso.has(this.propertyName)) {
        _neuronasEnProceso.add(this.propertyName);
        try {
          indicesIntermedios = await this.calcularIndicesIntermedios(input, valorCompuesto);
        } finally {
          _neuronasEnProceso.delete(this.propertyName);
        }
      }

      const matInfo = await this.obtenerTipoMaterial(input.materialId);
      if (matInfo.tipo) materialTipo = matInfo.tipo;

      const { inverso, metodoUsado } = await this.calcularInverso(valorCompuesto);
      const anomaliasConsistencia = this.verificarConsistencia(valorCompuesto, inverso, metodoUsado);
      anomalias.push(...anomaliasConsistencia);

      if (input.persistMemory !== false) {
        this.guardarMemoria(input, valorCompuesto, inverso, anomalias, componentesUsados, indicesIntermedios).catch(e => console.warn(e));
      }

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

  private async calcularDesdeComponentes(input: NeuronInput): Promise<{ valor: number; componentesConDato: number; anomalias: string[] }> {
    const componentes = input.componentes!;
    const { tipo: tipoMat } = await this.obtenerTipoMaterial(input.materialId);
    const regla = await this.obtenerReglaMezcla(tipoMat ?? undefined);
    const items: { fraccion: number; valor: number }[] = [];
    const anomalias: string[] = [];

    for (const comp of componentes) {
      const valor = input.dataProvider
        ? await input.dataProvider.getNormalizedValue(comp.materialId, this.propertyName, input.estado)
        : this.orientation === 'direct'
          ? null
          : await getValorNormalizado(comp.materialId, this.propertyName, input.estado);
      if (valor === null || isNaN(valor)) {
        anomalias.push(`sin_dato_en_sheet:${comp.materialId}/${this.propertyName}`);
        continue;
      }
      let valorFinal = valor;
      if (input.estado && input.estado !== 'E01') valorFinal = await this.aplicarTransformacionEstado(valorFinal, comp.materialId);
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

  private async obtenerReglaMezcla(materialTipo?: string): Promise<{ formula: string }> {
    if (materialTipo) {
      const { data: dataEsp } = await supabase.from('reglas_mezcla').select('formula')
        .eq('propiedad_nombre', this.propertyName).eq('activo', true).eq('tipo_material_aplica', materialTipo).limit(1).maybeSingle();
      if (dataEsp) return { formula: dataEsp.formula };
    }
    const { data, error } = await supabase.from('reglas_mezcla').select('formula')
      .eq('propiedad_nombre', this.propertyName).eq('activo', true).limit(1).single();
    if (error || !data) return { formula: 'ponderada_lineal' };
    return { formula: data.formula };
  }

  private evaluarFormulaMezcla(formula: string, fracciones: number[], valores: number[]): number {
    if (formula === 'ponderada_lineal' || !formula) return sumaPonderada(fracciones, valores);
    return evaluarExpresion(formula, { fracciones, valores });
  }

  private async aplicarTransformacionEstado(valorInicial: number, materialId: string): Promise<number> {
    const { familia } = await this.obtenerTipoMaterial(materialId);
    if (familia) {
      const { data: dataF } = await supabase.from('transformaciones_estado').select('factor_multiplicador, formula_avanzada')
        .eq('propiedad_nombre', this.propertyName).eq('activo', true).eq('material_familia', familia).maybeSingle();
      if (dataF) return this.aplicarFactorTransformacion(dataF, valorInicial);
    }
    const { data, error } = await supabase.from('transformaciones_estado').select('factor_multiplicador, formula_avanzada')
      .eq('propiedad_nombre', this.propertyName).eq('activo', true).maybeSingle();
    if (error || !data) return valorInicial;
    return this.aplicarFactorTransformacion(data, valorInicial);
  }

  private aplicarFactorTransformacion(data: { factor_multiplicador: number | null; formula_avanzada: string | null }, valorInicial: number): number {
    if (data.formula_avanzada) {
      try { return evaluarExpresion(data.formula_avanzada, { valor: valorInicial }); } catch { return valorInicial; }
    } else if (data.factor_multiplicador) {
      return Math.min(100, Math.max(0, valorInicial * data.factor_multiplicador));
    }
    return valorInicial;
  }

  private async calcularInverso(valorDirecto: number): Promise<{ inverso: number; metodoUsado: string }> {
    const { data } = await supabase.from('propiedades').select('metodo_inverso, params_inverso').eq('nombre', this.propertyName).maybeSingle();
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

  private async guardarMemoria(input: NeuronInput, compuesto: number, inverso: number, anomalias: string[], componentesUsados: number, indicesIntermedios: Record<string, number> = {}) {
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

  private outputVacio(input: NeuronInput, razon: string): NeuronOutput {
    console.warn(`  ⏳ [${this.neuronId}] PENDIENTE — ${razon}`);
    return {
      neuronId: this.neuronId, propertyName: this.propertyName, materialId: input.materialId,
      estado: input.estado, valorCompuesto: 50, valorInverso: 50, confianza: 0,
      anomalias: [razon], propiedadPendiente: true, metadatos: {}, indicesIntermedios: {}, materialTipo: undefined
    };
  }

  private async obtenerTipoMaterial(materialId: string): Promise<{ tipo: string | null; familia: string | null }> {
    try {
      const { data, error } = await supabase.from('catalogo_materiales').select('tipo, familia').eq('id_material', materialId).maybeSingle();
      if (error || !data) return { tipo: null, familia: null };
      return { tipo: data.tipo ?? null, familia: data.familia ?? null };
    } catch { return { tipo: null, familia: null }; }
  }

  /** Extrae símbolos que pueden representar variables de una fórmula. */
  private extraerSimbolos(expr: string): string[] {
    const funciones = new Set([
      'LEAST', 'GREATEST', 'least', 'greatest', 'erf_approx',
      'abs', 'acos', 'acosh', 'acot', 'acoth', 'acsc', 'acsch', 'asec', 'asech',
      'asin', 'asinh', 'atan', 'atan2', 'atanh', 'ceil', 'cos', 'cosh', 'cot',
      'coth', 'csc', 'csch', 'exp', 'floor', 'log', 'log10', 'max', 'min',
      'mod', 'nthRoot', 'round', 'sec', 'sech', 'sin', 'sinh', 'sqrt', 'tan',
      'tanh', 'sign', 'pi', 'e', 'true', 'false'
    ]);
    return Array.from(new Set(expr.match(/[A-Za-z_][A-Za-z0-9_]*/g) ?? []))
      .filter(nombre => !funciones.has(nombre));
  }

  protected async calcularIndicesIntermedios(input: NeuronInput, valorPropio: number): Promise<Record<string, number>> {
    const indices: Record<string, number> = {};
    let NEURON_MAP: Record<string, NeuronBase>;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      NEURON_MAP = require('../index').NEURON_MAP;
    } catch { return indices; }

    const formulas = await this.consultarFormulas();
    if (formulas.length === 0) return indices;

    // Cargar una sola vez el vector REAL del material. Las fórmulas científicas
    // pueden necesitar varias propiedades a la vez; no debemos asumir que
    // propiedad_a/propriedad_b son las únicas variables disponibles.
    const vectors = input.dataProvider
      ? await input.dataProvider.getMaterialVector(input.materialId, input.estado)
      : this.orientation === 'direct'
        ? null
        : await readVectorsFromSheet();
    const materialVector = Array.isArray(vectors)
      ? vectors.find(v => v.materialId === input.materialId && v.estado === input.estado)
        ?? vectors.find(v => v.materialId === input.materialId)
      : vectors;
    const scopeBase: Record<string, number> = {};

    // El contexto puede aportar variables experimentales (temperatura, carga,
    // geometría, etc.). Los datos reales de NORMALIZACION tienen prioridad para
    // propiedades del material y la propiedad que está procesando la neurona
    // siempre se fuerza a su valor real actual.
    for (const [key, value] of Object.entries((input.contexto as any) ?? {})) {
      const n = Number(value);
      if (Number.isFinite(n)) scopeBase[key] = n;
    }
    if (materialVector) {
      for (const [key, value] of Object.entries(materialVector.propiedades)) {
        if (value !== null && Number.isFinite(Number(value))) scopeBase[key] = Number(value);
      }
    }
    scopeBase[this.propertyName] = valorPropio;

    for (const formula of formulas) {
      try {
        const fc = formula.forma_computable?.trim();
        if (!fc || formula.propiedad_a === 'ninguna') continue;
        if (fc.includes('for ') || fc.includes('sum(') || fc.startsWith('#')) continue;

        let expresion = fc;
        const eqIndex = fc.indexOf('=');
        if (eqIndex !== -1 && !fc.substring(0, eqIndex).includes('!') && !fc.substring(0, eqIndex).includes('<') && !fc.substring(0, eqIndex).includes('>')) {
          expresion = fc.substring(eqIndex + 1).trim();
        }

        const scope: Record<string, number> = { ...scopeBase };
        const simbolos = this.extraerSimbolos(expresion);
        const faltantes = simbolos.filter(nombre => !Number.isFinite(Number(scope[nombre])));

        // Si una variable ausente corresponde a otra neurona, usar su valor
        // normalizado real como fallback. Esto evita recursiones y evita volver
        // a pasar el valorDirecto de la neurona actual a otra propiedad.
        for (const nombre of faltantes) {
          if (_neuronasEnProceso.has(nombre) || !NEURON_MAP[nombre]) continue;
          _neuronasEnProceso.add(nombre);
          try {
            const neuronaDependiente = NEURON_MAP[nombre];
            const otraInput: NeuronInput = {
              ...input,
              valorDirecto: undefined,
              dataProvider: neuronaDependiente.orientation === 'direct' ? input.dataProvider : undefined,
            };
            const otraOutput = await neuronaDependiente.process(otraInput);
            if (!otraOutput.propiedadPendiente && Number.isFinite(Number(otraOutput.valorCompuesto))) {
              scope[nombre] = Number(otraOutput.valorCompuesto);
            }
          } finally {
            _neuronasEnProceso.delete(nombre);
          }
        }

        // No convertir una fórmula científicamente incompleta en 0. La dejamos
        // sin evaluar hasta que estén disponibles todos sus datos de entrada.
        const faltantesDefinitivos = this.extraerSimbolos(expresion)
          .filter(nombre => !Number.isFinite(Number(scope[nombre])));
        if (faltantesDefinitivos.length > 0) continue;

        const resultado = evaluarExpresion(expresion, scope);
        if (!isNaN(resultado) && isFinite(resultado)) {
          const clave = (formula.output_nombre || formula.id).toLowerCase().replace(/\s+/g, '_')
            .replace(/[éèê]/g, 'e').replace(/[áàâ]/g, 'a').replace(/[íìî]/g, 'i')
            .replace(/[óòô]/g, 'o').replace(/[úùû]/g, 'u').replace(/[^a-z0-9_]/g, '');
          indices[clave] = Math.round(resultado * 1000) / 1000;
        }
      } catch {
        // Una fórmula inválida o incompleta no contamina el resultado de la neurona.
      }
    }
    return indices;
  }

  async consultarFormulas(): Promise<{
    id: string; nombre: string; descripcion: string; ecuacion: string;
    forma_computable: string; propiedad_a: string; propiedad_b: string;
    tipo_relacion: string; output_nombre: string; peso_cientifico: number; confianza: number;
  }[]> {
    const { data, error } = await supabase.from('scientific_formulas').select(
      'id, nombre, descripcion, ecuacion, forma_computable, propiedad_a, propiedad_b, tipo_relacion, output_nombre, peso_cientifico, confianza'
    ).or(`propiedad_a.eq.${this.propertyName},propiedad_b.eq.${this.propertyName}`).order('peso_cientifico', { ascending: false });
    if (error || !data) return [];
    return data as any[];
  }

  async consultarTriz(): Promise<any[]> {
    const { data, error } = await supabase.from('triz_contradicciones').select('*').eq('activo', true);
    if (error || !data) return [];
    return data.filter((row: any) => {
      const m = Array.isArray(row.propiedades_mejora) ? row.propiedades_mejora : JSON.parse(row.propiedades_mejora || '[]');
      const e = Array.isArray(row.propiedades_empeora) ? row.propiedades_empeora : JSON.parse(row.propiedades_empeora || '[]');
      return m.includes(this.propertyName) || e.includes(this.propertyName);
    });
  }

  async consultarMejoras(valorActual: number): Promise<any[]> {
    const { data, error } = await supabase.from('reglas_mejora').select('id, neurona_id, condicion, solucion, prioridad')
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
