"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";

export default function Home() {
  const router = useRouter();
  const supabase = supabaseBrowser;

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) router.push("/dashboard");
      else router.push("/login");
    };

    checkSession();
  }, [router, supabase]);

  return <p>Cargando...</p>;
}
