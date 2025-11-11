"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export interface Note {
  id: string | number;
  title: string;
  created_at: string;
}

export function useNotes() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Obtener usuario y notas
  useEffect(() => {
    const getUserAndNotes = async () => {
      try {
        // ⚡ usa sesión local (instantáneo)
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user;
        setUserEmail(user?.email ?? null);

        if (user) {
          const { data: notesData, error } = await supabase
            .from("notes")
            .select("id, title, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (error) console.error("Error fetching notes:", error);
          else setNotes(notesData || []);
        }
      } catch (err) {
        console.error("Error inesperado:", err);
      } finally {
        setLoading(false);
      }
    };

    getUserAndNotes();
  }, [supabase]);

  // 🔹 Realtime listener
  useEffect(() => {
    const channel = supabase
      .channel("notes-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notes" },
        (payload) => {
          setNotes((prev) => {
            switch (payload.eventType) {
              case "INSERT":
                return prev.some((n) => n.id === payload.new.id)
                  ? prev
                  : [payload.new as Note, ...prev];
              case "DELETE":
                return prev.filter((n) => n.id !== payload.old.id);
              case "UPDATE":
                return prev.map((n) =>
                  n.id === payload.new.id ? (payload.new as Note) : n
                );
              default:
                return prev;
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // 🔹 Acciones
const addNote = async (title: string) => {
  const tempId = crypto.randomUUID();

  // Inserción optimista local
  setNotes((prev: Note[]) => [
    { id: tempId, title, created_at: new Date().toISOString() },
    ...prev,
  ]);

  // Inserción real en Supabase (en segundo plano)
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return null;

  const { error } = await supabase
    .from("notes")
    .insert([{ id: tempId, title, user_id: userId }]);

  if (error) {
    console.error("Error creando nota:", error);
    // Si falla, quitamos la nota optimista
    setNotes((prev) => prev.filter((n) => n.id !== tempId));
    return null;
  }

  return { id: tempId, title }; // devolvemos el ID para redirigir
};


  const updateNote = async (id: number, newTitle: string) => {
    const { error } = await supabase
      .from("notes")
      .update({ title: newTitle })
      .eq("id", id);

    if (error) console.error("Error updating note:", error);
  };

  const deleteNote = async (id: string | number) => {
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) console.error("Error deleting note:", error);
  };


  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return {
    userEmail,
    notes,
    loading,
    addNote,
    updateNote,
    deleteNote,
    logout,
  };
}
