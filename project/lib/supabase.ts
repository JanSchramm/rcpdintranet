import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser-Client: Session wird über Cookies verwaltet, dadurch sehen
// Server (Route Handler) und Browser exakt dieselbe Session.
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);