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
    <main className="flex min-h-screen flex-col items-center justify-center gap-12 bg-background text-foreground">
      <h1 className="text-5xl font-bold">Berkadia</h1>
      <Button color="primary" onClick={handleLogin} size="lg">
        Iniciar sesión con Google
      </Button>
    </main>
  );
}
