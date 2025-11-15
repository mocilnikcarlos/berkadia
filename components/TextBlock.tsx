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

    const items = Array.from(e.clipboardData.items);

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (!file) return;

        const url = URL.createObjectURL(file);

        // Limpiar el bloque actual (lo convertimos en vacío)
        onChange(block.id, { html: "" });

        // Enviamos evento global a NoteEditor para insertar bloque imagen
        window.dispatchEvent(
          new CustomEvent("insert-image-block", {
            detail: { file, url, afterId: block.id },
          })
        );

        return; // 🚀 listo, no seguimos procesando texto
      }
    }

    // 2️⃣ Si NO había imagen → pegado de texto normal
    const text = e.clipboardData.getData("text/plain") || "";
    const el = ref.current;
    if (!el) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const textNode = document.createTextNode(text);
    range.insertNode(textNode);

    // mover cursor al final
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
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (!file || !file.type.startsWith("image/")) return;

        const url = URL.createObjectURL(file);

        window.dispatchEvent(
          new CustomEvent("insert-image-block", {
            detail: { file, url, afterId: block.id },
          })
        );
      }}
      onDragOver={(e) => e.preventDefault()}
      className="
        rich-block w-full min-h-[2.5rem]
        px-4 py-3
        text-[15px] leading-relaxed outline-none
        bg-transparent
        transition-all duration-150"
      style={{ cursor: "text" }}
    />
  );
}
