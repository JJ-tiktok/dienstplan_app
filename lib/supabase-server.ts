import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client
 * Uses the same URL but uses service role key if available, otherwise anon key
 * For server actions and API routes
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  // Der Fallback funktioniert, aber mit anon-Rechten: Server Actions scheitern dann
  // an RLS statt an einer offensichtlichen Fehlkonfiguration. Deshalb laut warnen.
  console.warn(
    '[Supabase] SUPABASE_SERVICE_ROLE_KEY fehlt – Server-Client nutzt den anon key. Schreibende Server Actions können an RLS scheitern.'
  );
}

const supabaseKey = serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseServer = createClient(supabaseUrl, supabaseKey);
