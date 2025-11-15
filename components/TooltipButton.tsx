"use client";
import { useRef, useState, useEffect } from "react";
import type { TooltipData } from "@/hooks/useNote";
import { Copy, Check } from "lucide-react";

interface Props {
  tooltip: TooltipData;
  onCopy: () => void;
  setTooltip: (t: TooltipData | null) => void;
}

export default function TooltipButton({ tooltip, onCopy, setTooltip }: Props) {
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [copied, setCopied] = useState(false);

  // Ocultado inteligente del tooltip
  useEffect(() => {
    if (!tooltip.text) return;

    const handleMove = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      const overTooltip = el?.closest("[data-tooltip-button]");
      const overBlock = el?.closest("[data-text-block]");

      if (overTooltip || overBlock) return;

      hideTimeoutRef.current = setTimeout(() => setTooltip(null), 200);
    };

    document.addEventListener("mousemove", handleMove);
    return () => document.removeEventListener("mousemove", handleMove);
  }, [tooltip.text, setTooltip]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tooltip.text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setTooltip(null);
      }, 900);
    } catch (err) {
      console.error("Error copiando texto:", err);
    }
  };

  if (!tooltip.text || window.getSelection()?.toString().trim()) return null;

  return (
    <div
      data-tooltip-button
      className="fixed z-50 transition-transform duration-200"
      style={{
        top: tooltip.y - 8,
        right: tooltip.x - 100,
        transform: "translateX(-50%)",
      }}
    >
      <button
        onClick={handleCopy}
        className={`
          flex items-center gap-2 px-3 py-1.5 text-sm font-medium
          rounded-full
          text-white 
          transition-all duration-150

          bg-gradient-to-b from-[#191919] to-[#1A1A1A]
          border border-white/10
          shadow-[0_4px_12px_rgba(0,0,0,0.35)]

          hover:bg-[#222]
          active:scale-95
          cursor-pointer
        `}
      >
        {copied ? (
          <Check size={14} className="text-green-400" />
        ) : (
          <Copy size={14} className="text-white" />
        )}
        {copied ? "Copiado" : "Copiar texto"}
      </button>
    </div>
  );
}
