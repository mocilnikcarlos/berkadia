"use client";
import { use } from "react";
import { useEffect, useRef, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useNote } from "@/hooks/useNote";
import NoteEditor from "@/components/NoteEditor";
import TooltipButton from "@/components/TooltipButton";
import { Breadcrumbs, BreadcrumbItem, Spinner, Input } from "@heroui/react";

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

  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // ───── Al cargar la nota ─────
  useEffect(() => {
    if (note) setTitle(note.title || "");
    const el = containerRef.current;
    if (el) requestAnimationFrame(() => el.classList.add("visible"));
  }, [note]);

  // ───── Guardar título ─────
  const handleTitleBlur = async () => {
    setEditingTitle(false);
    if (!note || title.trim() === note.title) return;
    await supabase
      .from("notes")
      .update({ title: title.trim() })
      .eq("id", note.id);
  };

  if (!note)
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner color="primary" label="Cargando nota..." />
      </div>
    );

  return (
    <main
      ref={containerRef}
      className="min-h-screen flex flex-col items-center bg-background text-foreground px-6 py-10 transition-opacity duration-500 opacity-0 [&.visible]:opacity-100"
    >
      <div className="w-full max-w-3xl flex flex-col gap-6">
        {/* ───── Breadcrumbs ───── */}
        <Breadcrumbs>
          <BreadcrumbItem
            href="/dashboard"
            className="text-default-500 hover:text-primary transition-colors"
          >
            Lista
          </BreadcrumbItem>
          <BreadcrumbItem>{title || "Nueva nota"}</BreadcrumbItem>
        </Breadcrumbs>

        {/* ───── Título editable ───── */}
        <div className="relative">
          {editingTitle ? (
            <input
              id="note-title"
              value={title}
              placeholder="Título de la nota"
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                setEditingTitle(false);
                if (!title.trim()) setTitle("Nueva nota");
                handleTitleBlur();
              }}
              autoFocus
              className="w-full text-3xl font-semibold border-b border-default-200 outline-none bg-transparent text-foreground pb-2 placeholder:text-default-400"
            />
          ) : (
            <h1
              id="note-title"
              className="text-3xl font-semibold border-b border-default-200 cursor-text pb-2 select-none"
              onClick={() => {
                if (title.trim() === "Nueva nota") setTitle("");
                setEditingTitle(true);
              }}
            >
              {title || "Nueva nota"}
            </h1>
          )}

          {saving && (
            <p className="absolute right-0 -bottom-5 text-xs text-default-500 animate-pulse">
              Guardando...
            </p>
          )}
        </div>

        {/* ───── Editor ───── */}
        <section className="w-full min-h-[70vh] py-6">
          <NoteEditor
            note={note}
            onSave={handleSave}
            setTooltip={(t) => {
              // Bloquea tooltip si la selección está dentro del título
              const selection = window.getSelection();
              const titleEl = document.querySelector("#note-title");
              if (
                selection &&
                selection.anchorNode &&
                titleEl?.contains(selection.anchorNode)
              ) {
                return; // Evita tooltip sobre el título
              }

              setTooltip(t);
            }}
          />
        </section>

        {/* ───── Tooltip ───── */}
        {tooltip && (
          <TooltipButton
            tooltip={tooltip}
            onCopy={() => handleCopy(tooltip.text)}
            setTooltip={setTooltip}
          />
        )}
      </div>
    </main>
  );
}
