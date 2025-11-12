// /components/block/NoteEditor.tsx
"use client";

import { useState, useEffect } from "react";
import type { NoteRow, TooltipData } from "@/hooks/useNote";
import FloatingToolbar from "./FloatingToolbar";
import BlockRenderer from "./block/BlockRenderer";
import type { Block } from "@/types/blocks";

interface Props {
  note: NoteRow;
  onSave: (content: string) => void;
  setTooltip: (t: TooltipData | null) => void;
}

// 🔨 Crea un bloque de texto vacío
const createEmptyTextBlock = (): Block => ({
  id: crypto.randomUUID(),
  type: "text",
  data: { html: "" },
});

// 🧠 Intenta inicializar bloques a partir del contenido de la nota
const getInitialBlocksFromNote = (note: NoteRow): Block[] => {
  const raw = note.content?.trim();

  // Nota vacía
  if (!raw || raw === "" || raw === "EMPTY") {
    return [createEmptyTextBlock()];
  }

  // 1️⃣ Intentar parsear como JSON de bloques (nuevo formato)
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const blocks = parsed as Block[];

      if (blocks.length === 0) return [createEmptyTextBlock()];

      // asegurar que haya un bloque vacío al final si el último tiene contenido
      const last = blocks[blocks.length - 1];
      if (
        last.type === "text" &&
        typeof (last.data as any).html === "string" &&
        (last.data as any).html.trim() === ""
      ) {
        return blocks;
      }

      return [...blocks, createEmptyTextBlock()];
    }
  } catch {
    // 2️⃣ Si no es JSON, asumimos contenido de texto viejo → lo migramos
  }

  // 📜 Compatibilidad: contenido viejo como string plano separado por dobles saltos
  const parts = raw
    .split(/\n\s*\n/)
    .map((t) => t.trim())
    .filter((t) => t !== "");

  const blocksFromText: Block[] = parts.map((html) => ({
    id: crypto.randomUUID(),
    type: "text",
    data: { html },
  }));

  return [...blocksFromText, createEmptyTextBlock()];
};

export default function NoteEditor({ note, onSave, setTooltip }: Props) {
  const [toolbarPos, setToolbarPos] = useState({ x: 0, y: 0 });
  const [showToolbar, setShowToolbar] = useState(false);

  const [blocks, setBlocks] = useState<Block[]>(() =>
    getInitialBlocksFromNote(note)
  );

  // 🔁 Si cambia la nota (id), reseteamos bloques
  useEffect(() => {
    setBlocks(getInitialBlocksFromNote(note));
  }, [note.id, note.content]);

  // 💾 Persistencia: guarda sin el último bloque vacío
  const persist = (blocksToPersist: Block[]) => {
    const cleaned = blocksToPersist.filter((b, idx) => {
      const isLast = idx === blocksToPersist.length - 1;
      if (!isLast) return true;

      // Eliminamos ÚNICAMENTE el último bloque de texto vacío
      if (b.type === "text") {
        const html = (b.data as any).html ?? "";
        return html.trim() !== "";
      }

      return true;
    });

    onSave(JSON.stringify(cleaned));
  };

  // ✏️ Maneja cambios de datos de un bloque
  const handleBlockChange = (id: string, newData: any) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;

      const prevBlock = prev[idx];
      const updatedBlock: Block = { ...prevBlock, data: newData };

      let updated = [...prev];
      updated[idx] = updatedBlock;

      // Lógica de "si el último bloque vacío ahora tiene texto → crear uno nuevo vacío"
      const isLast = idx === prev.length - 1;

      const wasEmpty =
        prevBlock.type === "text" &&
        typeof (prevBlock.data as any).html === "string" &&
        (prevBlock.data as any).html.trim() === "";

      const isNowNonEmpty =
        updatedBlock.type === "text" &&
        typeof (updatedBlock.data as any).html === "string" &&
        (updatedBlock.data as any).html.trim() !== "";

      if (isLast && wasEmpty && isNowNonEmpty) {
        updated = [...updated, createEmptyTextBlock()];
      }

      persist(updated);
      return updated;
    });
  };

  // 🗑 Elimina bloque y asegura que quede al menos uno
  const handleDeleteBlock = (id: string) => {
    setBlocks((prev) => {
      const updated = prev.filter((b) => b.id !== id);

      // Si no queda ningún bloque, crear uno nuevo vacío
      if (updated.length === 0) {
        const newBlock = createEmptyTextBlock();
        persist([newBlock]);
        return [newBlock];
      }

      // Si el último bloque tiene contenido, agregamos uno vacío al final
      const last = updated[updated.length - 1];
      if (
        last.type === "text" &&
        typeof (last.data as any).html === "string" &&
        (last.data as any).html.trim() !== ""
      ) {
        const newBlock = createEmptyTextBlock();
        const next = [...updated, newBlock];
        persist(next);
        return next;
      }

      persist(updated);
      return updated;
    });
  };

  // 🎯 Muestra el toolbar al seleccionar texto
  useEffect(() => {
    const handleSelection = (e: MouseEvent | KeyboardEvent) => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (!text) {
        setShowToolbar(false);
        return;
      }

      // Evitar tooltip si se selecciona dentro del título
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

        const isPlaceholder =
          isLast &&
          block.type === "text" &&
          typeof (block.data as any).html === "string" &&
          (block.data as any).html.trim() === "";

        return (
          <BlockRenderer
            key={block.id}
            block={block}
            onChange={handleBlockChange}
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
