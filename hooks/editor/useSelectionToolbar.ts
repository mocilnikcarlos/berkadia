"use client";

import { useEffect, useState } from "react";

export function useSelectionToolbar() {
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();

      // Si no hay texto seleccionado → ocultar toolbar
      if (!selectedText) {
        setShowToolbar(false);
        return;
      }

      try {
        const range = selection!.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Cálculo de posición centrada arriba del texto
        const x = rect.left + rect.width / 2;
        const y = rect.top - 10;

        setToolbarPos({ x, y });
        setShowToolbar(true);
      } catch {
        // Cuando no existe range (casos raros)
        setShowToolbar(false);
      }
    };

    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("keyup", handleSelection);

    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("keyup", handleSelection);
    };
  }, []);

  return {
    showToolbar,
    toolbarPos,
  };
}
