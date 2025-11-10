import { cookies } from "next/headers";
import { createSupabaseServerClient } from "./supabaseClient";

/**
 * Cliente Supabase listo para entorno servidor (App Router / Middleware)
 * - Sin imports internos
 * - Sin `any`
 * - Compatible con Next.js 13–14 (Node runtime)
 */
export const supabaseServer = () => {
  // 👇 Forzamos el tipo correcto porque TS infiere Promise<> erróneamente en algunos setups
  const cookieStore = cookies() as unknown as {
    get: (key: string) => { value: string } | undefined;
    set?: (args: { name: string; value: string; [key: string]: unknown }) => void;
  };

  return createSupabaseServerClient({
    get: (key: string) => cookieStore.get(key)?.value,
    set: (key: string, value: string, options?: Record<string, unknown>) => {
      try {
        cookieStore.set?.({ name: key, value, ...options });
      } catch {
        /* ignorar si no se puede mutar */
      }
    },
    remove: (key: string) => {
      try {
        cookieStore.set?.({ name: key, value: "", expires: new Date(0) });
      } catch {
        /* ignorar si no se puede mutar */
      }
    },
  });
};
