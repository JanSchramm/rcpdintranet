import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Öffentlicher Supabase-Client: nur für anonyme/benutzerseitige Aufrufe.
// Der Service Role Key darf hier niemals verwendet werden.
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const getSupabaseAdmin = () => {
    if (typeof window !== 'undefined') {
        throw new Error('getSupabaseAdmin darf nur serverseitig aufgerufen werden!');
    }

    // Akzeptiert sowohl das Standard-Format als auch das Vercel-Integrations-Format
    const serviceRoleKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SECRET_KEY;

    if (!serviceRoleKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY ist nicht in den Umgebungsvariablen definiert.');
    }

    return createClient<Database>(supabaseUrl, serviceRoleKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
};