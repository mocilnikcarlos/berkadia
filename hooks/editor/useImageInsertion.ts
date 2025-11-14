"use client";

import { useEffect } from "react";
import type { Block } from "@/types/blocks";
import { uploadImage } from "@/lib/uploadImage";

interface Params {
  userId: string;
  noteId: string;
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  persist: (blocks: Block[]) => void;
}

export function useImageInsertion({
  userId,
  noteId,
  blocks,
  setBlocks,
  persist,
}: Params) {
  useEffect(() => {
    const handler = (e: any) => {
      const { file, url, afterId } = e.detail;

      const newBlockId = crypto.randomUUID();

      // 1) Insertar bloque temporal loading
      setBlocks((prev) => {
        const idx = prev.findIndex((b) => b.id === afterId);
        if (idx === -1) return prev;

        const tempBlock: Block = {
          id: newBlockId,
          type: "image",
          data: {
            status: "loading",
            file,
            url,
            alt: file.name,
            caption: "",
            storagePath: undefined,
          },
        };

        return [...prev.slice(0, idx + 1), tempBlock, ...prev.slice(idx + 1)];
      });

      // 2) Subida real
      uploadImage({
        file,
        userId,
        noteId,
        blockId: newBlockId,
      }).then(({ url: publicUrl, path, error }) => {
        setBlocks((prev) => {
          const updated = prev.map((b) =>
            b.id === newBlockId
              ? {
                  ...b,
                  data: error
                    ? {
                        ...(b.data as any),
                        status: "error",
                        storagePath: undefined,
                      }
                    : {
                        ...(b.data as any),
                        status: "idle",
                        url: publicUrl,
                        storagePath: path,
                      },
                }
              : b
          );

          persist(updated);
          return updated;
        });
      });
    };

    window.addEventListener("insert-image-block", handler);
    return () => window.removeEventListener("insert-image-block", handler);
  }, [userId, noteId, blocks, setBlocks, persist]);
}
