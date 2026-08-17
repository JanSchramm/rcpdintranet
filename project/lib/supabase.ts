import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Standard-Client für normale Anfragen (Client-Side)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Admin-Client für Server-Anfragen / API-Routen (Service Role umgeht RLS)
export const getSupabaseAdmin = () => {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY ist nicht konfiguriert.');
    }
    return createClient<Database>(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false },
    });
};