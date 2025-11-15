"use client";

import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import FloatingToolbar from "./FloatingToolbar";
import BlockRenderer from "./block/BlockRenderer";
import type { NoteRow, TooltipData } from "@/hooks/useNote";
import { useBlocks } from "@/hooks/editor/useBlocks";
import { useImageInsertion } from "@/hooks/editor/useImageInsertion";
import { useSelectionToolbar } from "@/hooks/editor/useSelectionToolbar";
import { useEditorUser } from "@/hooks/editor/useEditorUser";
import { arrayMove } from "@/lib/arrayMove";
interface Props {
  note: NoteRow;
  onSave: (content: string) => void;
  setTooltip: (t: TooltipData | null) => void;
}

export default function NoteEditor({ note, onSave, setTooltip }: Props) {
  const userId = useEditorUser();

  const {
    blocks,
    setBlocks,
    updateBlock: handleBlockChange,
    deleteBlock: handleDeleteBlock,
    persist,
  } = useBlocks(note, onSave);

  useImageInsertion({
    userId,
    noteId: note.id,
    blocks,
    setBlocks,
    persist,
  });

  const { showToolbar, toolbarPos } = useSelectionToolbar();

  // --- Rearranque de bloques ---
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const oldIndex = result.source.index;
    const newIndex = result.destination.index;

    setBlocks(arrayMove(blocks, oldIndex, newIndex));
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="editor-droppable">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex flex-col gap-2"
            >
              {blocks.map((block, index) => {
                const isLast = index === blocks.length - 1;
                const isPlaceholder =
                  isLast &&
                  block.type === "text" &&
                  (block.data as any).html.trim() === "";

                // 🚫 NO draggable si es placeholder
                if (isPlaceholder) {
                  return (
                    <BlockRenderer
                      key={block.id}
                      block={block}
                      onChange={handleBlockChange}
                      onDelete={handleDeleteBlock}
                      setTooltip={setTooltip}
                      isPlaceholder={true}
                      dragHandleProps={null} // sin handle
                      isDragging={false}
                    />
                  );
                }

                // ✔ draggable normal
                return (
                  <Draggable
                    key={block.id}
                    draggableId={block.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={{
                          ...provided.draggableProps.style,
                          opacity: snapshot.isDragging ? 1 : 1,
                        }}
                      >
                        <BlockRenderer
                          block={block}
                          onChange={handleBlockChange}
                          onDelete={handleDeleteBlock}
                          setTooltip={setTooltip}
                          isPlaceholder={false}
                          dragHandleProps={provided.dragHandleProps}
                          isDragging={snapshot.isDragging}
                        />
                      </div>
                    )}
                  </Draggable>
                );
              })}

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <FloatingToolbar
        visible={showToolbar}
        x={toolbarPos.x}
        y={toolbarPos.y}
      />
    </>
  );
}
