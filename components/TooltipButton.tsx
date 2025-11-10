"use client";
import { useRef, useState, useEffect } from "react";
import type { TooltipData } from "@/hooks/useNote";
import { Button } from "@heroui/react";

interface Props {
  tooltip: TooltipData;
  onCopy: () => void;
  setTooltip: (t: TooltipData | null) => void;
}

export default function TooltipButton({ tooltip, onCopy, setTooltip }: Props) {
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!tooltip.text) return;
    let hideTimeout: NodeJS.Timeout;

    const handleMove = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      const overTooltip = el?.closest("[data-tooltip-button]");
      const overBlock = el?.closest("[data-text-block]");

      if (overTooltip || overBlock) {
        clearTimeout(hideTimeout);
        return;
      }

      // Espera 200ms antes de cerrar si el cursor sale de ambos
      clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => {
        setTooltip(null);
      }, 200);
    };

    document.addEventListener("mousemove", handleMove);
    return () => {
      clearTimeout(hideTimeout);
      document.removeEventListener("mousemove", handleMove);
    };
  }, [tooltip.text, setTooltip]);

  const handleEnter = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
  };

  const handleLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const toElement = e.relatedTarget as HTMLElement | null;
    // solo cierra si el mouse sale realmente del bloque
    if (toElement?.closest("[data-text-block]")) return;
    hideTimeoutRef.current = setTimeout(() => setTooltip(null), 200);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tooltip.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      console.error("Error copiando texto:", err);
    }
  };

  // 🚫 No mostrar tooltip si se está mostrando uno de selección (texto muy corto → hover)
  if (!tooltip.text || window.getSelection()?.toString().trim()) {
    return null;
  }

  return (
    <Button
      data-tooltip-button
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={handleCopy}
      className="tooltip-button"
      style={{
        top: tooltip.y - 5,
        left: tooltip.x,
      }}
    >
      {copied ? "✅ Copiado!" : "📋 Copiar bloque"}
    </Button>
  );
}
