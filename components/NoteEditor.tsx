"use client";

import FloatingToolbar from "./FloatingToolbar";
import BlockRenderer from "./block/BlockRenderer";
import type { NoteRow, TooltipData } from "@/hooks/useNote";
import { useBlocks } from "@/hooks/editor/useBlocks";
import { useImageInsertion } from "@/hooks/editor/useImageInsertion";
import { useSelectionToolbar } from "@/hooks/editor/useSelectionToolbar";
import { useEditorUser } from "@/hooks/editor/useEditorUser";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface Props {
  note: NoteRow;
  onSave: (content: string) => void;
  setTooltip: (t: TooltipData | null) => void;
}

export default function NoteEditor({ note, onSave, setTooltip }: Props) {
  // ---- Hook: usuario actual ----
  const userId = useEditorUser();

  // ---- Hook: bloques del editor ----
  const {
    blocks,
    setBlocks,
    updateBlock: handleBlockChange,
    deleteBlock: handleDeleteBlock,
    persist,
  } = useBlocks(note, onSave);

  // ---- Hook: lógica de imágenes ----
  useImageInsertion({
    userId,
    noteId: note.id,
    blocks,
    setBlocks,
    persist,
  });

  // ---- Hook: toolbar de selección ----
  const { showToolbar, toolbarPos } = useSelectionToolbar();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    setBlocks(arrayMove(blocks, oldIndex, newIndex));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={blocks.map((b) => b.id)}
        strategy={verticalListSortingStrategy}
      >
        {blocks.map((block, index) => {
          const isLast = index === blocks.length - 1;
          const isPlaceholder =
            isLast &&
            block.type === "text" &&
            (block.data as any).html.trim() === "";

          return (
            <BlockRenderer
              key={block.id}
              block={block}
              onChange={handleBlockChange}
              onDelete={handleDeleteBlock}
              setTooltip={setTooltip}
              isPlaceholder={isPlaceholder}
            />
          );
        })}
      </SortableContext>
    </DndContext>
  );
}
