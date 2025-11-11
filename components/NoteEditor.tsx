"use client";
import { useState, useEffect } from "react";
import type { NoteRow, TooltipData } from "@/hooks/useNote";
import RichTextBlock from "./RichTextBlock";
import FloatingToolbar from "./FloatingToolbar";

interface Props {
  note: NoteRow;
  onSave: (content: string) => void;
  setTooltip: (t: TooltipData | null) => void;
}

interface Block {
  id: string;
  html: string;
}

// Crear nuevo bloque (usa html como base)
const createBlock = (html = ""): Block => ({
  id: crypto.randomUUID(),
  html,
});

export default function NoteEditor({ note, onSave, setTooltip }: Props) {
  const [toolbarPos, setToolbarPos] = useState({ x: 0, y: 0 });
  const [showToolbar, setShowToolbar] = useState(false);

  // Dividimos el contenido inicial por bloques separados por doble salto
  let initialBlocks: Block[] = [];

  if (
    note.content &&
    note.content.trim() !== "" &&
    note.content.trim() !== "EMPTY"
  ) {
    initialBlocks = note.content
      .split(/\n\s*\n/)
      .map((t) => createBlock(t.trim()));
  }

  // Siempre dejamos al menos un bloque vacío al final
  const [blocks, setBlocks] = useState<Block[]>([
    ...initialBlocks,
    createBlock(""),
  ]);

  // Persistencia: guarda sin el último bloque vacío
  const persist = (blocksToPersist: Block[]) => {
    const cleaned = blocksToPersist.filter((b, idx) => {
      const isLast = idx === blocksToPersist.length - 1;
      return !(isLast && b.html.trim() === "");
    });
    onSave(cleaned.map((b) => b.html).join("\n\n"));
  };

  // Maneja cambios de texto enriquecido
  const handleChange = (id: string, newHtml: string) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;

      const wasEmpty = prev[idx].html.trim() === "";
      const isNowNonEmpty = newHtml.trim() !== "";

      let updated = prev.map((b, i) =>
        i === idx ? { ...b, html: newHtml } : b
      );

      // Si es el último bloque y pasa de vacío a no vacío → crear nuevo
      const isLast = idx === prev.length - 1;
      if (isLast && wasEmpty && isNowNonEmpty) {
        updated = [...updated, createBlock("")];
      }

      persist(updated);
      return updated;
    });
  };

  // Elimina bloque vacío y asegura que quede uno
  const handleDeleteBlock = (id: string) => {
    setBlocks((prev) => {
      const updated = prev.filter((b) => b.id !== id);

      // 🧠 Si no queda ningún bloque, crear uno nuevo vacío (para mantener placeholder)
      if (updated.length === 0) {
        const newBlock = createBlock("");
        persist([newBlock]);
        return [newBlock];
      }

      // 🧩 Si se eliminó el último bloque visible y el anterior tiene texto, agregar un nuevo vacío
      const last = updated[updated.length - 1];
      if (last.html.trim() !== "") {
        const newBlock = createBlock("");
        persist([...updated, newBlock]);
        return [...updated, newBlock];
      }

      // 🧹 Caso normal: simplemente persistir los bloques actualizados
      persist(updated);
      return updated;
    });
  };

  // Muestra el toolbar al seleccionar texto
  useEffect(() => {
    const handleSelection = (e: MouseEvent | KeyboardEvent) => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (!text) {
        setShowToolbar(false);
        return;
      }

      // 🚫 Evitar tooltip si se selecciona dentro del título
      const target = (e.target as HTMLElement) || document.activeElement;
      if (target && target.closest("#note-title")) {
        setShowToolbar(false);
        return;
      }

      const range = selection!.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setToolbarPos({ x: rect.left + rect.width / 2, y: rect.top - 10 });
      setShowToolbar(true);
    };

    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("keyup", handleSelection);
    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("keyup", handleSelection);
    };
  }, []);

  return (
    <div className="note-editor">
      {blocks.map((block, index) => {
        const isLast = index === blocks.length - 1;
        const isPlaceholder = isLast && block.html.trim() === "";

        return (
          <RichTextBlock
            key={block.id}
            id={block.id}
            html={block.html}
            onChange={(id, html) => handleChange(id, html)}
            onDelete={handleDeleteBlock}
            setTooltip={setTooltip}
            isPlaceholder={isPlaceholder}
          />
        );
      })}
      <FloatingToolbar
        visible={showToolbar}
        x={toolbarPos.x}
        y={toolbarPos.y}
      />
    </div>
  );
}
