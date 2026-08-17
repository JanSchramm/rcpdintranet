import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client für normale/öffentliche Anfragen (Client & Server)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Admin-Client (ausschließlich für serverseitige API-Routes)
export const getSupabaseAdmin = () => {
    if (typeof window !== 'undefined') {
        throw new Error('getSupabaseAdmin darf nur serverseitig aufgerufen werden!');
    }

    // Terminal-Log zur Fehlersuche:
    console.log('--- ENV CHECK ---');
    console.log('URL vorhanden?:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('SERVICE_ROLE_KEY vorhanden?:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log('-----------------');

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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