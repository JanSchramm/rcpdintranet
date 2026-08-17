import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Öffentlicher Supabase-Client: nur für anonyme/benutzerseitige Aufrufe.
// Der Service Role Key darf hier niemals verwendet werden.
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);