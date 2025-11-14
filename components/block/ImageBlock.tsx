"use client";

import { supabaseBrowser } from "@/lib/supabaseClient";
import type { Block } from "@/types/blocks";

interface Props {
  block: Extract<Block, { type: "image" }>;
  onChange: (id: string, data: any) => void;
  onDelete: (id: string) => void;
}

export default function ImageBlock({ block, onChange, onDelete }: Props) {
  const { id, data } = block;

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
    } finally {
      onDelete(id);
    }
  };

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
