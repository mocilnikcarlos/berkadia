"use client";

import { useEffect } from "react";

interface Params {
  ref: React.RefObject<HTMLDivElement>;
  visible: boolean;
  x: number;
  y: number;
}

export function useToolbarPosition({ ref, visible, x, y }: Params) {
  useEffect(() => {
    if (!visible || !ref.current) return;

    const el = ref.current;
    const rect = el.getBoundingClientRect();
    const margin = 8;

    let adjustedX = x;
    let adjustedY = y;

    // Borde derecho
    if (x + rect.width / 2 > window.innerWidth - margin) {
      adjustedX = window.innerWidth - rect.width / 2 - margin;
    }

    // Borde izquierdo
    if (x - rect.width / 2 < margin) {
      adjustedX = rect.width / 2 + margin;
    }

    // Borde superior
    if (y - rect.height < margin) {
      adjustedY = y + rect.height + margin;
    }

    el.style.left = `${adjustedX}px`;
    el.style.top = `${adjustedY}px`;
  }, [ref, visible, x, y]);
}
