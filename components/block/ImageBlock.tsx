"use client";

import { supabaseBrowser } from "@/lib/supabaseClient";
import type { Block } from "@/types/blocks";
import ImageLoader from "./Loaders/ImageLoader";
import ImageError from "./Loaders/ImageError";
import { uploadImage } from "@/lib/uploadImage";

interface Props {
  block: Extract<Block, { type: "image" }>;
  onChange: (id: string, data: any) => void;
  onDelete: (id: string) => void;
}

export default function ImageBlock({ block, onChange, onDelete }: Props) {
  const { id, data } = block;

  // ----------------------------
  // MANEJO DE ESTADOS: loading, error, idle
  // ----------------------------

  const retryUpload = async () => {
    if (!data.file) return;

    // Vuelve al estado loading
    onChange(id, { ...data, status: "loading" });

    const { url, path, error } = await uploadImage(data.file);

    if (error) {
      onChange(id, { ...data, status: "error" });
    } else {
      onChange(id, { ...data, status: "idle", url, storagePath: path });
    }
  };

  const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(id, { ...data, caption: e.target.value });
  };

  const handleDelete = async () => {
    try {
      if (data.storagePath) {
        await supabaseBrowser.storage
          .from("berkanote")
          .remove([data.storagePath]);
      }
    } catch (err) {
      // silencio, no romper UX
    } finally {
      onDelete(id);
    }
  };

  // ----------------------------
  // ESTADOS DEL BLOQUE
  // ----------------------------

  if (data.status === "loading") {
    return <ImageLoader />;
  }

  if (data.status === "error") {
    return <ImageError onRetry={retryUpload} />;
  }

  // Estado: imagen lista
  return (
    <div className="w-full flex flex-col items-center gap-2 my-4">
      <img
        src={data.url}
        alt={data.alt || "Imagen"}
        className="max-w-full rounded-xl shadow-md"
      />

      <input
        type="text"
        placeholder="Agregar una descripción..."
        value={data.caption || ""}
        onChange={handleCaptionChange}
        className="w-full text-center bg-transparent outline-none text-gray-300 text-sm border-b border-gray-700 focus:border-gray-500"
      />

      <button
        onClick={handleDelete}
        className="text-red-500 text-xs mt-2 hover:underline"
      >
        Eliminar imagen
      </button>
    </div>
  );
}
