"use client";

import { useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { useNote } from "@/hooks/useNote";
import dynamic from "next/dynamic";

import TooltipButton from "@/components/TooltipButton";
import {
  Breadcrumbs,
  BreadcrumbItem,
  Spinner,
  Code,
  Chip,
} from "@heroui/react";

// 🚀 Import dinámico del editor (client-only, sin SSR)
const NoteEditor = dynamic(() => import("@/components/NoteEditor"), {
  ssr: false,
});

interface Props {
  initialNote: any;
  id: string;
}

export default function NotePageClient({ initialNote, id }: Props) {
  const supabase = supabaseBrowser;

  const {
    note,
    saving,
    tooltip,
    setTooltip,
    handleSave,
    handleCopy,
    handleSaveTitle,
  } = useNote(supabase, id, initialNote);

  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(initialNote?.title ?? "");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (note) setTitle(note.title || "");
    containerRef.current?.classList.add("visible");
  }, [note]);

  if (!note)
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner color="primary" label="Cargando nota..." />
      </div>
    );

  const handleTitleChange = (value: string) => {
    setTitle(value);
    handleSaveTitle(value.trim());
  };

  return (
    <main
      ref={containerRef}
      className="min-h-screen flex flex-col items-center px-6 py-10 opacity-0 transition-opacity duration-500 [&.visible]:opacity-100"
    >
      <div className="w-full max-w-3xl flex flex-col gap-6">
        <Breadcrumbs>
          <BreadcrumbItem href="/dashboard">Lista</BreadcrumbItem>
          <BreadcrumbItem>{title || "Nueva nota"}</BreadcrumbItem>
        </Breadcrumbs>

        <div className="relative">
          {editingTitle ? (
            <input
              type="text"
              value={title}
              id="note-title"
              placeholder="Título de la nota"
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              autoFocus
              className="w-full text-3xl font-semibold border-b border-default-200 bg-transparent outline-none"
            />
          ) : (
            <h1
              id="note-title"
              className="text-3xl font-semibold border-b border-default-200 cursor-text pb-2"
              onClick={() => setEditingTitle(true)}
            >
              {title || "Nueva nota"}
            </h1>
          )}

          {saving && (
            <Chip className="absolute right-0 top-12 opacity-20 animate-pulse">
              Guardando...
            </Chip>
          )}
        </div>

        <section className="w-full min-h-[70vh] py-3">
          <NoteEditor
            note={note}
            onSave={handleSave}
            setTooltip={(t) => {
              const selection = window.getSelection();
              const titleEl = document.querySelector("#note-title");

              // Evita tooltip cuando la selección está en el título
              if (
                selection?.anchorNode &&
                titleEl?.contains(selection.anchorNode)
              )
                return;

              setTooltip(t);
            }}
          />
        </section>

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
