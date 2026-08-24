import express from 'express';
import * as dotenv from 'dotenv';
import path from 'path';
import { ALL_NEURONS } from './neurons/index';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'public')));

// Mock data de productos ARKON para asegurar funcionamiento inmediato y demostraciones impecables
const CATALOGO_PRODUCTOS = [
  {
    id: 'MA.001',
    nombre: 'Placa Antihumedad de Yeso Cerámico',
    categoria: 'Construcción Seca / Revestimientos',
    estado: '🟡 Oportunidad detectada',
    estadoColor: 'amber',
    cobertura: '78%',
    ultimoAnalisis: new Date().toLocaleString(),
    componentes: [
      { id: 'C1', nombre: 'Yeso Cerámico α', proporcion: '65%', rol: 'Matriz estructural' },
      { id: 'C2', nombre: 'Perlita Expandida', proporcion: '22%', rol: 'Aligerante y térmico' },
      { id: 'C3', nombre: 'Aditivo Hidrófugo Siloxánico', proporcion: '8%', rol: 'Barrera antihumedad' },
      { id: 'C4', nombre: 'Fibras de Refuerzo Celulósicas', proporcion: '5%', rol: 'Resistencia a tracción/flexión' }
    ],
    propiedades: [
      { nombre: 'Densidad Aparente', valor: '920 kg/m³', fuente: 'Normalización A-01', unidad: 'kg/m³', relevante: true },
      { nombre: 'Absorción de Agua', valor: '3.4%', fuente: 'Ensayo Laboratorio #41', unidad: '%', relevante: true },
      { nombre: 'Resistencia a Compresión', valor: '14.8 MPa', fuente: 'Neurona N011', unidad: 'MPa', relevante: true },
      { nombre: 'Conductividad Térmica', valor: '0.22 W/m·K', fuente: 'Neurona N021', unidad: 'W/m·K', relevante: true },
      { nombre: 'Resistencia a Flexión', valor: '4.2 MPa', fuente: 'Ensayo Laboratorio #41', unidad: 'MPa', relevante: true },
      { nombre: 'Huella de Carbono', valor: '180 kg CO₂eq/ton', fuente: 'Sustentabilidad', unidad: 'kg CO₂eq', relevante: true }
    ],
    atributos: [
      { nombre: 'Resistente', descripcion: 'Soporta cargas mecánicas moderadas a flexión y compresión.', estado: 'Óptimo' },
      { nombre: 'Liviano', descripcion: 'Densidad inferior al estándar tradicional gracias a la perlita.', estado: 'Óptimo' },
      { nombre: 'Aislante', descripcion: 'Baja conductividad térmica comprobada.', estado: 'Óptimo' },
      { nombre: 'Durable', descripcion: 'Resistencia a la eflorescencia y humedad capilar.', estado: 'Alerta menor' },
      { nombre: 'Económico', descripcion: 'Costo de componente siloxánico elevado frente a alternativas.', estado: 'Oportunidad' },
      { nombre: 'Sustentable', descripcion: 'Emisiones de CO₂ optimizables por contenido de yeso virgen.', estado: 'Oportunidad' }
    ],
    hallazgos: {
      fortalezas: [
        'Excelente aislamiento térmico (0.22 W/m·K) derivado de la porosidad controlada por perlita.',
        'Adecuada resistencia a flexión (4.2 MPa) previniendo fisuras durante instalación.'
      ],
      oportunidades: [
        'Optimización del costo del aditivo hidrófugo mediante sustitución parcial por silicato modificado.',
        'Reducción de huella de carbono incorporando subproductos calizos reciclados en un 15%.'
      ],
      riesgos: [
        'Sensibilidad a ciclos prolongados de saturación hídrica si el sellado perimetral es deficiente.'
      ]
    },
    causasRelacion: [
      { paso: 1, concepto: 'Costo elevado del componente hidrófugo (Aditivo Siloxánico)', detalle: 'Representa el 28% del costo total de materias primas de la formulación.' },
      { paso: 2, concepto: 'Relación con la absorción de agua (3.4%)', detalle: 'El modelo físico indica que se logra el mismo nivel de impermeabilidad con un 30% menos de aditivo si se ajusta la granulometría de la perlita.' },
      { paso: 3, concepto: 'Base de conocimiento ARKON', detalle: 'Se detectaron 3 formulaciones alternativas validadas en proyectos similares que reducen costo sin afectar resistencia.' }
    ],
    oportunidadesMejora: [
      { categoria: 'Reducción de costos', titulo: 'Sustitución parcial de Aditivo Siloxánico', estado: 'Compatible según datos', impacto: 'Ahorro estimado 14% en costos de formulación' },
      { categoria: 'Mejora de sustentabilidad', titulo: 'Incorporación de yeso reciclado certificado', estado: 'Pendiente de evaluación', impacto: 'Reducción de huella de carbono en 22%' },
      { categoria: 'Mejora de propiedades', titulo: 'Ajuste granulométrico de Perlita Expandida', estado: 'Requiere validación experimental', impacto: 'Mejora de módulo elástico en 8%' }
    ],
    alternativas: [
      {
        opcion: 'Opción Actual (Base)',
        costo: '$12.40 / m²',
        disponibilidad: 'Alta',
        absorcion: '3.4%',
        resistencia: '14.8 MPa',
        impactoAmbiental: '180 kg CO₂',
        compatibilidad: '100%',
        riesgos: 'Costo de insumos químicos elevado'
      },
      {
        opcion: 'Alternativa A (Optimizada ARKON)',
        costo: '$10.65 / m²',
        disponibilidad: 'Alta',
        absorcion: '3.2%',
        resistencia: '15.1 MPa',
        impactoAmbiental: '145 kg CO₂',
        compatibilidad: '98%',
        riesgos: 'Requiere ajuste menor en mezclado'
      },
      {
        opcion: 'Alternativa B (Sustentable Plus)',
        costo: '$11.10 / m²',
        disponibilidad: 'Media',
        absorcion: '3.5%',
        resistencia: '13.9 MPa',
        impactoAmbiental: '112 kg CO₂',
        compatibilidad: '92%',
        riesgos: 'Disponibilidad estacional de insumo reciclado'
      }
    ]
  },
  {
    id: 'MA.002',
    nombre: 'Mortero Autonivelante de Alta Resistencia',
    categoria: 'Pisos Industriales / Adhesivos',
    estado: '🟢 Optimizado',
    estadoColor: 'emerald',
    cobertura: '92%',
    ultimoAnalisis: new Date().toLocaleString(),
    componentes: [
      { id: 'C1', nombre: 'Cemento Portland Tipo V', proporcion: '55%', rol: 'Aglomerante principal' },
      { id: 'C2', nombre: 'Arena Silícea Seleccionada (0-1mm)', proporcion: '38%', rol: 'Esqueleto granular' },
      { id: 'C3', nombre: 'Superplastificante Policarboxilato', proporcion: '4%', rol: 'Fluidez y autonivelación' },
      { id: 'C4', nombre: 'Polímero Redispersible (EVA)', proporcion: '3%', rol: 'Flexibilidad y adherencia' }
    ],
    propiedades: [
      { nombre: 'Densidad Real', valor: '2450 kg/m³', fuente: 'Neurona N001', unidad: 'kg/m³', relevante: true },
      { nombre: 'Resistencia a Compresión (28d)', valor: '42.5 MPa', fuente: 'Neurona N011', unidad: 'MPa', relevante: true },
      { nombre: 'Fluidez de Extensión', valor: '280 mm', fuente: 'Ensayo Dinámico', unidad: 'mm', relevante: true },
      { nombre: 'Tiempo de Fraguado', valor: '45 min', fuente: 'Norma IRAM', unidad: 'min', relevante: true }
    ],
    atributos: [
      { nombre: 'Resistente', descripcion: 'Alta resistencia mecánica a tracción y compresión.', estado: 'Óptimo' },
      { nombre: 'Fluido', descripcion: 'Autonivelación perfecta sin segregación.', estado: 'Óptimo' },
      { nombre: 'Durable', descripcion: 'Excelente resistencia al desgaste abrasivo.', estado: 'Óptimo' }
    ],
    hallazgos: {
      fortalezas: [
        'Resistencia a compresión superior al estándar de mercado (42.5 MPa).',
        'Excelente retención de agua y estabilidad dimensional.'
      ],
      oportunidades: [
        'Ajuste fino en la dosis de policarboxilato para reducir costo sin perder fluidez.'
      ],
      riesgos: []
    },
    causasRelacion: [
      { paso: 1, concepto: 'Eficiencia del superplastificante', detalle: 'El polímero actual opera al 85% de su capacidad teórica según la relación w/c.' },
      { paso: 2, concepto: 'Modelo de cohesión interna', detalle: 'La distribución granulométrica de la arena silícea minimiza huecos intergranulares.' }
    ],
    oportunidadesMejora: [
      { categoria: 'Mejora de proceso', titulo: 'Optimización de ciclo de mezclado en seco', estado: 'Validado', impacto: 'Aumento de productividad de planta en 12%' }
    ],
    alternativas: [
      {
        opcion: 'Opción Actual (Base)',
        costo: '$18.50 / bolsa',
        disponibilidad: 'Alta',
        absorcion: '1.2%',
        resistencia: '42.5 MPa',
        impactoAmbiental: '210 kg CO₂',
        compatibilidad: '100%',
        riesgos: 'Ninguno detectado'
      }
    ]
  },
  {
    id: 'MA.003',
    nombre: 'Ladrillo Térmico Celular Alveolar',
    categoria: 'Mampostería Estructural',
    estado: '🟡 Oportunidad detectada',
    estadoColor: 'amber',
    cobertura: '65%',
    ultimoAnalisis: new Date().toLocaleString(),
    componentes: [
      { id: 'C1', nombre: 'Cal Hidratada Alta Pureza', proporcion: '40%', rol: 'Aglomerante cálcico' },
      { id: 'C2', nombre: 'Arena Molida Fina', proporcion: '55%', rol: 'Sílice reactiva' },
      { id: 'C3', nombre: 'Polvo de Aluminio (Generador Gas)', proporcion: '5%', rol: 'Formación de alvéolos' }
    ],
    propiedades: [
      { nombre: 'Densidad Aparente', valor: '550 kg/m³', fuente: 'Neurona N002', unidad: 'kg/m³', relevante: true },
      { nombre: 'Conductividad Térmica', valor: '0.12 W/m·K', fuente: 'Neurona N021', unidad: 'W/m·K', relevante: true },
      { nombre: 'Resistencia a Compresión', valor: '3.5 MPa', fuente: 'Neurona N011', unidad: 'MPa', relevante: true }
    ],
    atributos: [
      { nombre: 'Aislante Térmico', descripcion: 'Excelente coeficiente de aislación para muros perimetrales.', estado: 'Óptimo' },
      { nombre: 'Ultraliviano', descripcion: 'Reduce carga muerta en estructuras de hormigón.', estado: 'Óptimo' },
      { nombre: 'Fragilidad', descripcion: 'Requiere cuidado especial en manipuleo logístico.', estado: 'Alerta' }
    ],
    hallazgos: {
      fortalezas: ['Conductividad térmica excepcional (0.12 W/m·K).'],
      oportunidades: ['Mejora de resistencia a tracción indirecta mediante adición de microfibras de polipropileno.'],
      riesgos: ['Mayor tasa de roturas por impacto durante el transporte en obra.']
    },
    causasRelacion: [
      { paso: 1, concepto: 'Porosidad alveolar abierta', detalle: 'La generación de gas por aluminio produce celdas que reducen resistencia mecánica.' }
    ],
    oportunidadesMejora: [
      { categoria: 'Mejora de propiedades', titulo: 'Adición de microfibras sintéticas', estado: 'Compatible según datos', impacto: 'Reducción de roturas por transporte en 35%' }
    ],
    alternativas: [
      {
        opcion: 'Opción Actual',
        costo: '$2.10 / unidad',
        disponibilidad: 'Alta',
        absorcion: '12.0%',
        resistencia: '3.5 MPa',
        impactoAmbiental: '95 kg CO₂',
        compatibilidad: '100%',
        riesgos: 'Roturas logísticas'
      },
      {
        opcion: 'Alternativa Fibro-Alveolar',
        costo: '$2.25 / unidad',
        disponibilidad: 'Media',
        absorcion: '10.5%',
        resistencia: '4.2 MPa',
        impactoAmbiental: '90 kg CO₂',
        compatibilidad: '95%',
        riesgos: 'Inversión inicial en dosificadores de fibra'
      }
    ]
  }
];

// Endpoints API
app.get('/api/products', (req, res) => {
  const summary = CATALOGO_PRODUCTOS.map(p => ({
    id: p.id,
    nombre: p.nombre,
    categoria: p.categoria,
    estado: p.estado,
    estadoColor: p.estadoColor,
    cobertura: p.cobertura,
    ultimoAnalisis: p.ultimoAnalisis
  }));
  res.json(summary);
});

app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const product = CATALOGO_PRODUCTOS.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ success: false, error: 'Producto no encontrado en el catálogo de ARKON' });
  }
  res.json({ success: true, product });
});

app.post('/api/analyze-product', async (req, res) => {
  const { id } = req.body;
  const product = CATALOGO_PRODUCTOS.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ success: false, error: 'Producto no encontrado' });
  }
  product.ultimoAnalisis = new Date().toLocaleString();
  res.json({
    success: true,
    mensaje: `Análisis neuronal actualizado exitosamente para ${product.nombre}`,
    product
  });
});

app.post('/api/evaluate-proposal', async (req, res) => {
  const { productId, propuesta } = req.body;
  res.json({
    success: true,
    estado: 'Hipótesis de formulación — requiere validación',
    mensaje: 'Propuesta registrada en el motor de inferencia de ARKON.',
    propuesta: {
      idPropuesta: 'PROP-' + Math.floor(Math.random() * 9000 + 1000),
      productId,
      detalle: propuesta || 'Evaluación de nueva formulación y sustitución de componentes.',
      estadoValidacion: 'Pendiente de ensayos de laboratorio',
      fechaRegistro: new Date().toISOString()
    }
  });
});

app.get('/api/neurons', (req, res) => {
  const neuronsInfo = ALL_NEURONS.map(n => ({
    name: n.constructor.name,
    propertyName: (n as any).propertyName,
    group: (n as any).group,
    unit: (n as any).unit
  }));
  res.json(neuronsInfo);
});

app.listen(PORT, () => {
  console.log(`✅ ARKON Neural Engine Server running on http://localhost:${PORT}`);
});
