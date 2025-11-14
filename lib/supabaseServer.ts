import { createSupabaseServerClient } from "./supabaseClient";

export const supabaseServer = (cookieStore: any) => {
  return createSupabaseServerClient({
    get(key: string) {
      const c = cookieStore.get?.(key);
      return c?.value;
    },

    set(key: string, value: string, options?: Record<string, unknown>) {
      try {
        cookieStore.set?.({ name: key, value, ...options });
      } catch {}
    },

    remove(key: string) {
      try {
        cookieStore.set?.({
          name: key,
          value: "",
          expires: new Date(0),
        });
      } catch {}
    },
  });
};
