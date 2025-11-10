"use client";
import { useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";

export default function AuthCallback() {
  useEffect(() => {
    const finishLogin = async () => {
      const { data, error } = await supabaseBrowser.auth.getSession();
      if (error) console.error(error);
      if (data.session) window.location.href = "/";
      else window.location.href = "/login";
    };
    finishLogin();
  }, []);

  return <p>Autenticando...</p>;
}
