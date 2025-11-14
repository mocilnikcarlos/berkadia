import { useEffect, useRef, useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";

export interface NoteRow {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export interface TooltipData {
  x: number;
  y: number;
  text: string;
}

export function useNote(
  supabase: SupabaseClient,
  id: string,
  initialNote?: NoteRow | null
) {
  const [note, setNote] = useState<NoteRow | null>(initialNote ?? null);
  const [saving, setSaving] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ───────────────────────────────────────────────
  // 🔥 Cargar nota SOLO si no vino desde el server
  // ───────────────────────────────────────────────
  useEffect(() => {
    if (initialNote) return; // Ya está cargada por el Server Component

    let active = true;

    const fetchNote = async () => {
      try {
        const { data, error } = await supabase
          .from("notes")
          .select("*")
          .eq("id", id)
          .single();

        if (!active) return;

        if (error) console.error("Error cargando nota:", error);
        else setNote(data);
      } catch (err) {
        console.error("Error inesperado:", err);
      }
    };

    fetchNote();

    return () => {
      active = false;
    };
  }, [id, supabase, initialNote]);

  // ───────────────────────────────────────────────
  // 🔥 Guardar contenido (debounced)
  // ───────────────────────────────────────────────
  const handleSave = (newContent: string) => {
    if (!note) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      setSaving(true);

      const { error } = await supabase
        .from("notes")
        .update({ content: newContent })
        .eq("id", note.id);

      if (error) console.error("Error guardando contenido:", error);
      else setNote((prev) => (prev ? { ...prev, content: newContent } : prev));

      setSaving(false);
    }, 800);
  };

  // ───────────────────────────────────────────────
  // 🔥 Guardar título (debounced)
  // ───────────────────────────────────────────────
  const handleSaveTitle = (newTitle: string) => {
    if (!note) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      setSaving(true);

      const { error } = await supabase
        .from("notes")
        .update({ title: newTitle })
        .eq("id", note.id);

      if (error) console.error("Error guardando título:", error);
      else setNote((prev) => (prev ? { ...prev, title: newTitle } : prev));

      setSaving(false);
    }, 800);
  };

  // ───────────────────────────────────────────────
  // Copiar texto
  // ───────────────────────────────────────────────
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setTooltip(null);
      alert("Texto copiado ✅");
    } catch (err) {
      console.error("Error copiando texto:", err);
    }
  };

  return {
    note,
    saving,
    tooltip,
    setTooltip,
    handleSave,
    handleSaveTitle,
    handleCopy,
  };
}
