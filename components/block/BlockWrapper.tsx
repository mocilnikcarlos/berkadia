// /components/block/BlockWrapper.tsx
"use client";

import type { ReactNode } from "react";

interface BlockWrapperProps {
  id: string;
  isPlaceholder?: boolean;
  children: ReactNode;
}

export default function BlockWrapper({
  id,
  isPlaceholder = false,
  children,
}: BlockWrapperProps) {
  return (
    <div
      className="relative w-full group"
      data-block-id={id}
      data-block-wrapper
    >
      {/* 🔧 Drag handle (futuro) */}
      <div className="absolute -left-6 top-3 opacity-0 group-hover:opacity-100 cursor-grab text-xs select-none">
        ⋮⋮
      </div>

      {/* ⋯ Menú del bloque (futuro) */}
      <div className="absolute -right-2 top-3 opacity-0 group-hover:opacity-100 text-xs select-none">
        •••
      </div>

      {children}

      {/* Placeholder visual estándar */}
      {isPlaceholder && (
        <span className="absolute top-3 left-4 text-gray-500 select-none pointer-events-none text-[15px]">
          + Escribí algo...
        </span>
      )}
    </div>
  );
}
