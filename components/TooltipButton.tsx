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

      clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => setTooltip(null), 200);
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

  const handleLeave = (e: React.MouseEvent<HTMLElement>) => {
    const toElement = e.relatedTarget as HTMLElement | null;
    if (toElement?.closest("[data-text-block]")) return;
    hideTimeoutRef.current = setTimeout(() => setTooltip(null), 200);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tooltip.text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setTooltip(null);
      }, 1000);
    } catch (err) {
      console.error("Error copiando texto:", err);
    }
  };

  if (!tooltip.text || window.getSelection()?.toString().trim()) return null;

  return (
    <div
      data-tooltip-button
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="fixed z-50 transition-transform duration-200"
      style={{
        top: tooltip.y - 8,
        left: tooltip.x,
        transform: "translateX(-50%)",
      }}
    >
      <Button
        size="sm"
        radius="full"
        color={copied ? "primary" : "primary"}
        variant="solid"
        onClick={handleCopy}
        className="px-3 py-1 text-xs font-medium shadow-lg"
      >
        {copied ? "Copiado" : "Copiar bloque"}
      </Button>
    </div>
  );
}
