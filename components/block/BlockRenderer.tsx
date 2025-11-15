// /components/block/BlockRenderer.tsx
"use client";

import type { Block } from "@/types/blocks";
import type { TooltipData } from "@/hooks/useNote";
import BlockWrapper from "./BlockWrapper";
import TextBlock from "../TextBlock";
import ImageBlock from "./ImageBlock";

interface BlockRendererProps {
  block: Block;
  onChange: (id: string, data: any) => void;
  onDelete: (id: string) => void;
  setTooltip: (t: TooltipData | null) => void;
  isPlaceholder?: boolean;
}

export default function BlockRenderer({
  block,
  onChange,
  onDelete,
  setTooltip,
  isPlaceholder = false,
}: BlockRendererProps) {
  switch (block.type) {
    case "text":
    case "quote":
    case "list":
    case "code":
      return (
        <BlockWrapper
          id={block.id}
          isPlaceholder={isPlaceholder}
          onDelete={onDelete}
        >
          <TextBlock
            block={block}
            onChange={onChange}
            onDelete={onDelete}
            setTooltip={setTooltip}
          />
        </BlockWrapper>
      );

    // 🖼 Bloque de imagen (placeholder futuro)
    case "image":
      return (
        <BlockWrapper id={block.id} onDelete={onDelete}>
          <ImageBlock block={block} onChange={onChange} onDelete={onDelete} />
        </BlockWrapper>
      );

    // 🔊 Bloque de audio (placeholder futuro)
    case "audio":
      return (
        <BlockWrapper id={block.id} onDelete={onDelete}>
          <div className="px-4 py-3 rounded-2xl bg-[var(--heroui-background)] text-sm text-gray-400">
            Bloque de audio (pendiente de implementar)
          </div>
        </BlockWrapper>
      );

    default: {
      const _exhaustive: never = block;
      return (
        <BlockWrapper id={(block as any).id} onDelete={onDelete}>
          <TextBlock
            block={block as any}
            onChange={onChange}
            onDelete={onDelete}
            setTooltip={setTooltip}
          />
        </BlockWrapper>
      );
    }
  }
}
