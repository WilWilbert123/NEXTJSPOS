/**
 * Supabase Client Configuration
 * Server-side and client-side Supabase clients
 * - Service role key kept secret (server-side only)
 * - Anon key for client-side operations
 */

import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

/**
 * Server-side Supabase client
 * Use this on the server to access service role features
 * NEVER expose the service role key on the client
 */
export const createServerSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};

/**
 * Browser-side Supabase client
 * Use this on the client for user authentication and public operations
 */
export const createBrowserSupabaseClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

/**
 * Server Action Supabase client
 * Use in Server Actions with user context
 */
export const createServerActionClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
      },
    }
  );
};

/**
 * Helper to get the current authenticated user on the server
 */
export async function getServerUser() {
  const supabase = createServerSupabaseClient();
  
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.admin.getUserById(
      process.env.SUPABASE_USER_ID || ''
    );
    
    if (error) return null;
    return user;
  } catch (error) {
    console.error('Error fetching server user:', error);
    return null;
  }
}
