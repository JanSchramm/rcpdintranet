import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

export function getSupabaseAdmin() {
    if (!supabaseUrl) {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL ist nicht in den Umgebungsvariablen definiert.');
    }

    const serviceRoleKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SECRET_KEY;

    if (!serviceRoleKey) {
        throw new Error('Weder SUPABASE_SERVICE_ROLE_KEY noch SUPABASE_SECRET_KEY sind gesetzt.');
    }

    return createClient<Database>(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}