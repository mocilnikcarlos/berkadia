// /components/block/BlockWrapper.tsx
"use client";

import React, { useState } from "react";
import BlockMenu from "../ui/BlockMenu";
import { GripVertical, Plus } from "lucide-react";

interface BlockWrapperProps {
  id: string;
  isPlaceholder?: boolean;
  onDelete: (id: string) => void;
  children: React.ReactNode; // 👈 VOLVIÓ
}

export default function BlockWrapper({
  id,
  isPlaceholder = false,
  onDelete,
  children, // 👈 SE USA
}: BlockWrapperProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      data-block-id={id}
      data-block-wrapper
      className={`
        relative w-full flex gap-2 items-start group
        transition-all duration-150 rounded-2xl
        ${
          menuOpen
            ? "bg-[rgba(255,255,255,0.02)]"
            : "hover:bg-[rgba(255,255,255,0.02)]"
        }
      `}
    >
      {/* IZQUIERDA: + y drag */}
      <div
        className="
          absolute left-[-48px] top-[14px]
          flex items-center gap-2
          opacity-0 group-hover:opacity-100 transition-opacity
        "
      >
        <button className="text-gray-400 hover:text-white">
          <Plus size={16} />
        </button>

        <button className="text-gray-500 hover:text-white cursor-grab">
          <GripVertical size={16} />
        </button>
      </div>

      {/* CONTENIDO DEL BLOQUE */}
      <div className="flex-1 relative">
        {children}

        {isPlaceholder && (
          <span className="absolute top-3 left-4 text-gray-500 pointer-events-none text-[15px]">
            + Escribí algo...
          </span>
        )}
      </div>

      {/* MENÚ DERECHA */}
      <div
        className={`
          absolute right-2 top-2 transition-opacity
          ${menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
        `}
      >
        <BlockMenu onDelete={() => onDelete(id)} setMenuOpen={setMenuOpen} />
      </div>
    </div>
  );
}
