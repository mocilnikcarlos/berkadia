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

export function useNote(supabase: SupabaseClient, id: string) {
  const [note, setNote] = useState<NoteRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ───── Cargar nota ─────
  useEffect(() => {
    const fetchNote = async () => {
      const { data } = await supabase
        .from("notes")
        .select("*")
        .eq("id", id)
        .single();
      if (data) setNote(data);
    };
    fetchNote();
  }, [id, supabase]);

  const handleSave = (newContent: string) => {
    if (!note) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      setSaving(true);
      const { error } = await supabase
        .from("notes")
        .update({ content: newContent })
        .eq("id", note.id);
      if (error) console.error("Error guardando:", error);
      else setNote({ ...note, content: newContent });
      setSaving(false);
    }, 1500);
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Texto copiado ✅");
      setTooltip(null);
    } catch (err) {
      console.error("Error copiando texto:", err);
    }
  };

  return { note, saving, tooltip, setTooltip, handleSave, handleCopy };
}
