"use client";

import { useEffect, useState } from "react";
import { getUserName } from "@/lib/getUserName";
import { createBrowserClient } from "@supabase/ssr";

export function useUserName() {
  const [name, setName] = useState({ firstName: "", fullName: "" });

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setName(getUserName(session));
      }
    };

    load();
  }, []);

  return name;
}
