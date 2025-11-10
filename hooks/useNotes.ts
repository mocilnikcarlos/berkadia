"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export interface Note {
  id: number;
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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  // 🔹 Obtener usuario y notas
  useEffect(() => {
    const getUserAndNotes = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
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

      setLoading(false);
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
          if (payload.eventType === "INSERT") {
            setNotes((prev) => {
              const exists = prev.some((n) => n.id === payload.new.id);
              return exists ? prev : [payload.new as Note, ...prev];
            });
          } else if (payload.eventType === "DELETE") {
            setNotes((prev) => prev.filter((n) => n.id !== payload.old.id));
          } else if (payload.eventType === "UPDATE") {
            setNotes((prev) =>
              prev.map((n) =>
                n.id === payload.new.id ? (payload.new as Note) : n
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // 🔹 Acciones
  const addNote = async (title: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return null;

    const { data, error } = await supabase
      .from("notes")
      .insert([{ title, user_id: userId }])
      .select()
      .single(); // 🔹 devuelve la nota recién creada

    if (error) {
      console.error("Error inserting note:", error);
      return null;
    }

    // 🔹 actualiza el estado local sin duplicar
    setNotes((prev) => prev); // 🔹 No alteramos la lista aún
    return data;

  };

  const updateNote = async (id: number, newTitle: string) => {
    const { error } = await supabase
      .from("notes")
      .update({ title: newTitle })
      .eq("id", id);

    if (error) console.error("Error updating note:", error);
    else {
      setEditingId(null);
      setEditValue("");
    }
  };

  const deleteNote = async (id: number) => {
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
    editingId,
    editValue,
    setEditValue,
    setEditingId,
    addNote,
    updateNote,
    deleteNote,
    logout,
  };
}
