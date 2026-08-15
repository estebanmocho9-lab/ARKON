// ============================================================
// src/extraction-neurons/diccionarios/instrumentos.ts
// Instrumentos y métodos de ensayo conocidos, ES/EN. Se usa para
// poblar instrumento_usado y metodo_ensayo cuando aparecen cerca
// de una propiedad detectada.
//
// AMPLIAR: agregá acá cualquier instrumento/método propio de tus
// libros que no esté todavía.
// ============================================================

import { EntradaInstrumento } from '../base/tipos';

export const INSTRUMENTOS: EntradaInstrumento[] = [
  { nombre_es: 'Picnómetro', nombre_en: 'Pycnometer', sinonimos: [], tipo: 'instrumento' },
  { nombre_es: 'Porosímetro de mercurio', nombre_en: 'Mercury intrusion porosimeter', sinonimos: ['MIP'], tipo: 'instrumento' },
  { nombre_es: 'Microscopio electrónico de barrido', nombre_en: 'Scanning electron microscope', sinonimos: ['SEM', 'microscopio electrónico'], tipo: 'instrumento' },
  { nombre_es: 'Difractómetro de rayos X', nombre_en: 'X-ray diffractometer', sinonimos: ['XRD', 'difracción de rayos X'], tipo: 'instrumento' },
  { nombre_es: 'Permeámetro', nombre_en: 'Permeameter', sinonimos: [], tipo: 'instrumento' },
  { nombre_es: 'Viscosímetro', nombre_en: 'Viscometer', sinonimos: [], tipo: 'instrumento' },
  { nombre_es: 'Durómetro', nombre_en: 'Durometer', sinonimos: [], tipo: 'instrumento' },
  { nombre_es: 'Extensómetro', nombre_en: 'Extensometer', sinonimos: [], tipo: 'instrumento' },
  { nombre_es: 'Calorímetro diferencial de barrido', nombre_en: 'Differential scanning calorimeter', sinonimos: ['DSC'], tipo: 'instrumento' },
  { nombre_es: 'Analizador termogravimétrico', nombre_en: 'Thermogravimetric analyzer', sinonimos: ['TGA'], tipo: 'instrumento' },
  { nombre_es: 'Dilatómetro', nombre_en: 'Dilatometer', sinonimos: [], tipo: 'instrumento' },
  { nombre_es: 'Fluorescencia de rayos X', nombre_en: 'X-ray fluorescence', sinonimos: ['FRX', 'XRF'], tipo: 'instrumento' },

  { nombre_es: 'Ensayo de compresión', nombre_en: 'Compression test', sinonimos: [], tipo: 'metodo' },
  { nombre_es: 'Ensayo de tracción', nombre_en: 'Tensile test', sinonimos: [], tipo: 'metodo' },
  { nombre_es: 'Ensayo de flexión', nombre_en: 'Flexural test', sinonimos: ['bending test'], tipo: 'metodo' },
  { nombre_es: 'Análisis termogravimétrico', nombre_en: 'Thermogravimetric analysis', sinonimos: ['TGA'], tipo: 'metodo' },
  { nombre_es: 'Calorimetría diferencial de barrido', nombre_en: 'Differential scanning calorimetry', sinonimos: ['DSC'], tipo: 'metodo' },
  { nombre_es: 'Adsorción de nitrógeno', nombre_en: 'Nitrogen adsorption', sinonimos: ['BET'], tipo: 'metodo' },
];
