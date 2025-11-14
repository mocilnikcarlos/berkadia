"use client";

import { useState, useCallback, useEffect } from "react";
import type { Block } from "@/types/blocks";
import type { NoteRow } from "@/hooks/useNote";

const createEmptyTextBlock = (): Block => ({
  id: crypto.randomUUID(),
  type: "text",
  data: { html: "" },
});

// ---- Inicializa bloques desde la nota ----
const getInitialBlocksFromNote = (note: NoteRow): Block[] => {
  const raw = note.content?.trim();

  if (!raw || raw === "" || raw === "EMPTY") {
    return [createEmptyTextBlock()];
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const blocks = parsed as Block[];

      if (blocks.length === 0) return [createEmptyTextBlock()];

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
  } catch {}

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

export function useBlocks(note: NoteRow, onSave: (content: string) => void) {
  const [blocks, setBlocks] = useState<Block[]>(() =>
    getInitialBlocksFromNote(note)
  );

  // Reset al cambiar nota
  useEffect(() => {
    setBlocks(getInitialBlocksFromNote(note));
  }, [note.id, note.content]);

  // Persistencia
  const persist = useCallback(
    (blocksToPersist: Block[]) => {
      const cleaned = blocksToPersist.filter((b, idx) => {
        const isLast = idx === blocksToPersist.length - 1;

        if (!isLast) return true;

        if (b.type === "text") {
          const html = (b.data as any).html ?? "";
          return html.trim() !== "";
        }

        return true;
      });

      onSave(JSON.stringify(cleaned));
    },
    [onSave]
  );

  // Cambiar bloque
  const updateBlock = useCallback(
    (id: string, newData: any) => {
      setBlocks((prev) => {
        const idx = prev.findIndex((b) => b.id === id);
        if (idx === -1) return prev;

        const prevBlock = prev[idx];
        const updatedBlock: Block = { ...prevBlock, data: newData };

        let updated = [...prev];
        updated[idx] = updatedBlock;

        const isLast = idx === prev.length - 1;

        const wasEmpty =
          prevBlock.type === "text" &&
          (prevBlock.data as any).html.trim() === "";

        const isNowNonEmpty =
          updatedBlock.type === "text" &&
          (updatedBlock.data as any).html.trim() !== "";

        if (isLast && wasEmpty && isNowNonEmpty) {
          updated = [...updated, createEmptyTextBlock()];
        }

        persist(updated);
        return updated;
      });
    },
    [persist]
  );

  // Eliminar bloque
  const deleteBlock = useCallback(
    (id: string) => {
      setBlocks((prev) => {
        const updated = prev.filter((b) => b.id !== id);

        if (updated.length === 0) {
          const newBlock = createEmptyTextBlock();
          persist([newBlock]);
          return [newBlock];
        }

        const last = updated[updated.length - 1];
        if (
          last.type === "text" &&
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
    },
    [persist]
  );

  return {
    blocks,
    setBlocks,
    updateBlock,
    deleteBlock,
    persist,
  };
}
