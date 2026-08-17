// app/api/debug-env/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json({
        vercelEnv: process.env.VERCEL_ENV, // "production" | "preview" | "development"
        hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
        hasSecretKey: Boolean(process.env.SUPABASE_SECRET_KEY),
        hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
        // Nur die ersten 4 Zeichen zur Kontrolle, nie den vollen Wert:
        urlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 20),
    });
}