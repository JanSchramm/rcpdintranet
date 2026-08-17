import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client für Client-Side Anfragen (Browser)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Admin-Client für Server-Side API-Routen
// export const getSupabaseAdmin = () => {
//     const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

//     if (!serviceRoleKey) {
//         throw new Error(
//             'SUPABASE_SERVICE_ROLE_KEY ist in der .env nicht konfiguriert oder der Server wurde nach dem Hinzufügen nicht neu gestartet.'
//         );
//     }

//     return createClient<Database>(supabaseUrl, serviceRoleKey, {
//         auth: {
//             persistSession: false,
//             autoRefreshToken: false,
//         },
//     });
// };
export const getSupabaseAdmin = () => {
    // Füge deinen echten service_role Secret Key hier direkt in Anführungszeichen ein:
    const serviceRoleKey = "HIER_DEINEN_SERVICE_ROLE_KEY_EINFUEGEN";

    return createClient<Database>(supabaseUrl, serviceRoleKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
};