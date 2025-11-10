"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@heroui/react";

interface Props {
  visible: boolean;
  x: number;
  y: number;
}

export default function FloatingToolbar({ visible, x, y }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!visible || !ref.current) return;

    const el = ref.current;
    const toolbarRect = el.getBoundingClientRect();
    const margin = 8; // espacio mínimo al borde

    // Ajuste inicial
    let adjustedX = x;
    let adjustedY = y;

    // Si se pasa del borde derecho
    if (x + toolbarRect.width / 2 > window.innerWidth - margin) {
      adjustedX = window.innerWidth - toolbarRect.width / 2 - margin;
    }

    // Si se pasa del borde izquierdo
    if (x - toolbarRect.width / 2 < margin) {
      adjustedX = toolbarRect.width / 2 + margin;
    }

    // Si se pasa del borde superior
    if (y - toolbarRect.height < margin) {
      adjustedY = y + toolbarRect.height + margin;
    }

    el.style.top = `${adjustedY}px`;
    el.style.left = `${adjustedX}px`;
  }, [visible, x, y]);

  const exec = (cmd: string) => {
    document.execCommand(cmd);
  };

  const handleCopy = async () => {
    const sel = window.getSelection()?.toString();
    if (!sel) return;
    try {
      await navigator.clipboard.writeText(sel);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      console.error("Error copiando texto:", err);
    }
  };

  if (!visible) return null;

  return (
    <div
      ref={ref}
      className={`floating-toolbar ${visible ? "visible" : ""} ${
        copied ? "copied" : ""
      }`}
    >
      <Button onClick={handleCopy} title="Copiar">
        {copied ? "✅" : "📋"}
      </Button>
      <Button onClick={() => exec("bold")} className="bold">
        B
      </Button>
      <Button onClick={() => exec("italic")} className="italic">
        I
      </Button>
      <Button onClick={() => exec("strikeThrough")} className="strike">
        S
      </Button>
      <Button onClick={() => exec("insertUnorderedList")}>•</Button>
      <Button onClick={() => exec("insertOrderedList")}>1.</Button>
    </div>
  );
}
