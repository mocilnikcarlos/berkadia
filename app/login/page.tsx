"use client";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { Button } from "@heroui/react";

export default function LoginPage() {
  const handleLogin = async () => {
    const { error } = await supabaseBrowser.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) console.error("Error iniciando sesión:", error.message);
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <Button color="primary" onClick={handleLogin} size="lg">
        Iniciar sesión con Google
      </Button>
      <Button color="primary">Button</Button>
    </main>
  );
}
