"use client";
import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Copy,
} from "lucide-react";
import { showToast } from "@/components/ui/Toast";

interface Props {
  visible: boolean;
  x: number;
  y: number;
}

export default function FloatingToolbar({ visible, x, y }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // ---- posicionamiento dinámico ----
  useEffect(() => {
    if (!visible || !ref.current) return;

    const el = ref.current;
    const rect = el.getBoundingClientRect();
    const margin = 8;

    let adjustedX = x - rect.width / 2;
    let adjustedY = y - rect.height - 10;

    if (adjustedX < margin) adjustedX = margin;
    if (adjustedX + rect.width > window.innerWidth - margin)
      adjustedX = window.innerWidth - rect.width - margin;

    if (adjustedY < margin) adjustedY = y + 10;

    el.style.left = `${adjustedX}px`;
    el.style.top = `${adjustedY}px`;
  }, [visible, x, y]);

  // ---- comandos editor ----
  const exec = (cmd: string) => document.execCommand(cmd);

  const handleCopy = async () => {
    const sel = window.getSelection()?.toString();
    if (!sel) return;

    await navigator.clipboard.writeText(sel);

    showToast("Texto copiado");
  };

  if (!visible) return null;

  return (
    <div
      ref={ref}
      className="
        fixed z-50 flex items-center gap-1
        px-3 py-2 
        rounded-full

        bg-gradient-to-b from-[#191919] to-[#1A1A1A]
        shadow-[0_4px_12px_rgba(0,0,0,0.35)]
        border border-white/10

        transition-opacity duration-150
        animate-fadeIn
      "
    >
      {/* COPY */}
      <ToolbarButton onClick={handleCopy} active={copied}>
        <Copy size={16} />
      </ToolbarButton>

      <Divider />

      {/* BOLD */}
      <ToolbarButton onClick={() => exec("bold")}>
        <Bold size={16} />
      </ToolbarButton>

      {/* ITALIC */}
      <ToolbarButton onClick={() => exec("italic")}>
        <Italic size={16} />
      </ToolbarButton>

      {/* STRIKE */}
      <ToolbarButton onClick={() => exec("strikeThrough")}>
        <Strikethrough size={16} />
      </ToolbarButton>

      <Divider />

      {/* BULLETS */}
      <ToolbarButton onClick={() => exec("insertUnorderedList")}>
        <List size={16} />
      </ToolbarButton>

      {/* ORDERED LIST */}
      <ToolbarButton onClick={() => exec("insertOrderedList")}>
        <ListOrdered size={16} />
      </ToolbarButton>
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        p-1.5 
        rounded-md 
        hover:bg-white/10 
        transition-colors
        ${active ? "bg-white/20" : "bg-transparent"}
      `}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-4 bg-white/20 mx-1" />;
}
