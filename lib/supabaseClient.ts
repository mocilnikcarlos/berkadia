import { createBrowserClient, createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * 🔹 Cliente para el navegador (componentes client)
 *    - Mantiene sesión del usuario
 *    - Usa localStorage + fetch con headers automáticos
 */
export const supabaseBrowser = createBrowserClient(supabaseUrl, supabaseAnonKey);

/**
 * 🔹 Cliente para el servidor (middleware, route handlers, server components)
 *    - Permite acceder a Supabase usando las cookies de sesión activas
 *    - Totalmente tipado sin `any`
 */
export const createSupabaseServerClient = (cookies: {
  get: (key: string) => string | undefined;
  set: (key: string, value: string, options?: CookieOptions) => void;
  remove: (key: string) => void;
}) => {
  return createServerClient(supabaseUrl, supabaseAnonKey, { cookies });
};
