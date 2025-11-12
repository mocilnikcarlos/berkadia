// /components/block/TextBlock.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type { TooltipData } from "@/hooks/useNote";
import { useRichTextHotkeys } from "@/hooks/useRichTextHotkeys";
import type { TextLikeBlock } from "@/types/blocks";

interface Props {
  block: TextLikeBlock;
  onChange: (id: string, data: any) => void;
  onDelete: (id: string) => void;
  setTooltip: (t: TooltipData | null) => void;
}

export default function TextBlock({
  block,
  onChange,
  onDelete,
  setTooltip,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  const { id, data } = block;
  const html = data.html || "";

  // 🧠 Inicializa contenido SOLO si está vacío al montar
  useEffect(() => {
    const el = ref.current;
    if (el && el.innerHTML.trim() === "" && html.trim() !== "") {
      el.innerHTML = html;
    }
  }, [html]);

  // 💾 Guarda cambios al escribir
  const handleInput = () => {
    if (!ref.current) return;
    onChange(id, { ...data, html: ref.current.innerHTML });
  };

  // 🧹 Elimina bloque si está vacío al perder foco
  const handleBlur = () => {
    setFocused(false);
    const text = ref.current?.innerText.trim() || "";
    if (text === "") onDelete(id);
  };

  // 🧭 Control de selección
  const handleMouseDown = () => {
    setIsSelecting(true);
  };

  const handleMouseUp = () => {
    setTimeout(() => setIsSelecting(false), 150);

    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    // si no hay texto seleccionado, limpiamos tooltip
    if (!selection || !selectedText) {
      setTooltip(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // 📋 mostrar toolbar en selección
    setTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top - 45,
      text: selectedText,
    });
  };

  // ✨ Tooltip hover (solo si NO hay selección activa)
  const handleMouseEnter = () => {
    if (!ref.current) return;

    const selection = window.getSelection();
    if (selection && selection.toString().trim() !== "") return;
    if (isSelecting) return;

    const rect = ref.current.getBoundingClientRect();
    setTooltip({
      x: rect.left + 50,
      y: rect.top - 24,
      text: ref.current.innerText.trim(),
    });
  };

  const { handleKeyDown } = useRichTextHotkeys(ref);

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();

    const text = e.clipboardData.getData("text/plain");
    if (!text) return;

    const el = ref.current;
    if (!el) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);

    el.classList.remove("placeholder");

    range.deleteContents();
    const textNode = document.createTextNode(text);
    range.insertNode(textNode);

    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);

    onChange(id, { ...data, html: el.innerHTML });
  };

  return (
    <div
      data-text-block
      data-block-id={id}
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onFocus={() => setFocused(true)}
      onBlur={handleBlur}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onPaste={handlePaste}
      className={`
        rich-block 
        w-full min-h-[2.5rem]
        px-4 py-3 rounded-2xl
        text-[15px] leading-relaxed
        outline-none transition-all duration-150
        bg-[var(--heroui-background)] hover:bg-[rgba(255,255,255,0.02)]
      `}
      style={{
        cursor: "text",
      }}
    />
  );
}
