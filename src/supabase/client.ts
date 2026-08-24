// ============================================
// IMPULSO IA — CONEXIÓN CON SUPABASE
// ============================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

let supabase: SupabaseClient;

try {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Faltan variables de entorno: SUPABASE_URL o SUPABASE_KEY');
  }
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('✅ Supabase conectado correctamente');
} catch (err) {
  console.warn('[AI Studio] Supabase not configured — using mock client');
  supabase = new Proxy({} as SupabaseClient, {
    get: (_, prop) => {
      const mockQuery: any = {
        select: () => mockQuery,
        eq: () => mockQuery,
        order: () => Promise.resolve({ data: [], error: null }),
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
        single: () => Promise.resolve({ data: null, error: null }),
        insert: () => Promise.resolve({ error: null }),
        upsert: () => Promise.resolve({ error: null })
      };
      return () => mockQuery;
    }
  });
}

export { supabase };