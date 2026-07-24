// ============================================
// IMPULSO IA — CONEXIÓN CON SUPABASE
// ============================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Faltan variables de entorno: SUPABASE_URL o SUPABASE_KEY');
}

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('✅ Supabase conectado correctamente');