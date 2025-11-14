// /components/NoteEditor.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import type { NoteRow, TooltipData } from "@/hooks/useNote";
import FloatingToolbar from "./FloatingToolbar";
import BlockRenderer from "./block/BlockRenderer";
import type { Block } from "@/types/blocks";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { uploadImageToStorage } from "@/lib/uploadImage";

interface Props {
  note: NoteRow;
  onSave: (content: string) => void;
  setTooltip: (t: TooltipData | null) => void;
}

// ---- Crea bloque vacío ----
const createEmptyTextBlock = (): Block => ({
  id: crypto.randomUUID(),
  type: "text",
  data: { html: "" },
});

// ---- Inicializa bloques ----
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

export default function NoteEditor({ note, onSave, setTooltip }: Props) {
  const [toolbarPos, setToolbarPos] = useState({ x: 0, y: 0 });
  const [showToolbar, setShowToolbar] = useState(false);
  const [userId, setUserId] = useState("");

  // ---- Obtener ID de usuario ----
  useEffect(() => {
    supabaseBrowser.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
    });
  }, []);

  const [blocks, setBlocks] = useState<Block[]>(() =>
    getInitialBlocksFromNote(note)
  );

  // ---- Reset al cambiar nota ----
  useEffect(() => {
    setBlocks(getInitialBlocksFromNote(note));
  }, [note.id, note.content]);

  // ---- Persistir cambios ----
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

  // ---- Cambios en un bloque ----
  const handleBlockChange = (id: string, newData: any) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;

      const prevBlock = prev[idx];
      const updatedBlock: Block = { ...prevBlock, data: newData };

      let updated = [...prev];
      updated[idx] = updatedBlock;

      const isLast = idx === prev.length - 1;

      const wasEmpty =
        prevBlock.type === "text" && (prevBlock.data as any).html.trim() === "";

      const isNowNonEmpty =
        updatedBlock.type === "text" &&
        (updatedBlock.data as any).html.trim() !== "";

      // si escribo en el último → crear otro vacío
      if (isLast && wasEmpty && isNowNonEmpty) {
        updated = [...updated, createEmptyTextBlock()];
      }

      persist(updated);
      return updated;
    });
  };

  // ---- Eliminar bloque ----
  const handleDeleteBlock = (id: string) => {
    setBlocks((prev) => {
      const updated = prev.filter((b) => b.id !== id);

      if (updated.length === 0) {
        const newBlock = createEmptyTextBlock();
        persist([newBlock]);
        return [newBlock];
      }

      const last = updated[updated.length - 1];
      if (last.type === "text" && (last.data as any).html.trim() !== "") {
        const newBlock = createEmptyTextBlock();
        const next = [...updated, newBlock];
        persist(next);
        return next;
      }

      persist(updated);
      return updated;
    });
  };

  // ---- Toolbar de selección ----
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (!text) {
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

  // ---- Inserción de imagen ----
  useEffect(() => {
    const handler = (e: any) => {
      const { file, url, afterId } = e.detail;

      // 1) Insertamos el bloque TEMPORAL en UI (NO persistimos aún)
      let newBlockId = crypto.randomUUID();

      setBlocks((prev) => {
        const idx = prev.findIndex((b) => b.id === afterId);
        if (idx === -1) return prev;

        const tempBlock: Block = {
          id: newBlockId,
          type: "image",
          data: {
            url, // BLOB temporal
            alt: file.name,
            caption: "",
            uploading: true,
            storagePath: undefined, // <-- se completa después
          },
        };

        return [...prev.slice(0, idx + 1), tempBlock, ...prev.slice(idx + 1)];
      });

      // 2) Subida real a Supabase
      uploadImageToStorage({
        file,
        userId,
        noteId: note.id,
        blockId: newBlockId,
      })
        .then(({ url: publicUrl, path }) => {
          setBlocks((prev) => {
            const finalBlocks: Block[] = prev.map((b) =>
              b.id === newBlockId
                ? {
                    ...b,
                    data: {
                      ...(b.data as any),
                      url: publicUrl,
                      storagePath: path, // <-- guardamos la ruta real
                      uploading: false,
                    },
                  }
                : b
            );

            persist(finalBlocks);
            return finalBlocks;
          });
        })
        .catch(() => {
          setBlocks((prev) => {
            const errorBlocks: Block[] = prev.map((b) =>
              b.id === newBlockId
                ? {
                    ...b,
                    data: {
                      ...(b.data as any),
                      uploading: false,
                      error: true,
                    },
                  }
                : b
            );

            persist(errorBlocks);
            return errorBlocks;
          });
        });
    };

    window.addEventListener("insert-image-block", handler);
    return () => window.removeEventListener("insert-image-block", handler);
  }, [userId, note.id, persist]);

  return (
    <div className="note-editor">
      {blocks.map((block, index) => {
        const isLast = index === blocks.length - 1;

        const isPlaceholder =
          isLast &&
          block.type === "text" &&
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
