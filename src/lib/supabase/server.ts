import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-side Supabase client for Server Components, Route Handlers und Server Actions.
// Liest/schreibt Auth-Cookies, damit die Session zwischen Server und Client konsistent bleibt.
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // In Server Components darf nicht geschrieben werden (Next.js-Limitierung) –
            // das übernimmt dann die Middleware. Sicher ignorierbar.
          }
        },
      },
    }
  );
}
