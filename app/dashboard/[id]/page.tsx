"use client";
import { use } from "react";
import { useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useNote } from "@/hooks/useNote";
import NoteEditor from "@/components/NoteEditor";
import TooltipButton from "@/components/TooltipButton";

export default function NotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { note, saving, tooltip, setTooltip, handleSave, handleCopy } = useNote(
    supabase,
    id
  );

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!note) return;
    const el = containerRef.current;
    if (el) requestAnimationFrame(() => el.classList.add("visible"));
  }, [note]);

  if (!note) return <p>Cargando...</p>;

  return (
    <main ref={containerRef} className="note-page">
      <button
        onClick={() => (window.location.href = "/dashboard")}
        className="back-btn"
      >
        ← Volver
      </button>

      <h1>{note.title}</h1>

      <NoteEditor note={note} onSave={handleSave} setTooltip={setTooltip} />

      {tooltip && (
        <TooltipButton
          tooltip={tooltip}
          onCopy={() => handleCopy(tooltip.text)}
          setTooltip={setTooltip}
        />
      )}

      {saving && <p>Guardando...</p>}
    </main>
  );
}
