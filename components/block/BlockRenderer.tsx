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
  dragHandleProps?: any;
  isDragging?: boolean;
}

export default function BlockRenderer({
  block,
  onChange,
  onDelete,
  setTooltip,
  isPlaceholder = false,
  dragHandleProps,
}: BlockRendererProps) {
  switch (block.type) {
    case "text":
    case "quote":
    case "list":
    case "code":
      return (
        <BlockWrapper
          id={block.id}
          onDelete={onDelete}
          isPlaceholder={isPlaceholder}
          dragHandleProps={dragHandleProps}
        >
          <TextBlock
            block={block}
            onChange={onChange}
            onDelete={onDelete}
            setTooltip={setTooltip}
          />
        </BlockWrapper>
      );

    case "image":
      return (
        <BlockWrapper
          id={block.id}
          onDelete={onDelete}
          isPlaceholder={isPlaceholder}
          dragHandleProps={dragHandleProps}
        >
          <ImageBlock block={block} onChange={onChange} onDelete={onDelete} />
        </BlockWrapper>
      );

    default:
      return (
        <BlockWrapper
          id={block.id}
          onDelete={onDelete}
          isPlaceholder={isPlaceholder}
          dragHandleProps={dragHandleProps}
        >
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
