"use client";
import { useState } from "react";
import { Note } from "@/hooks/useNotes";
import { Spinner, Button, useDisclosure } from "@heroui/react";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";

interface Props {
  notes: Note[];
  loading: boolean;
  onDelete: (id: string | number) => Promise<void>;
}

export function NotesList({ notes, loading, onDelete }: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [noteToDelete, setNoteToDelete] = useState<string | number | null>(
    null
  );

  const handleDelete = async () => {
    if (!noteToDelete) return;
    await onDelete(noteToDelete);
    setNoteToDelete(null);
    onClose();
  };

  if (loading)
    return (
      <div className="flex justify-center py-10">
        <Spinner color="primary" label="Cargando notas..." />
      </div>
    );

  if (notes.length === 0)
    return (
      <p className="text-center text-sm text-default-500">
        No tenés notas todavía.
      </p>
    );

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {notes.map((note) => (
          <div
            key={note.id}
            role="button"
            tabIndex={0}
            onClick={() => (window.location.href = `/dashboard/${note.id}`)}
            className="
              rounded-xl bg-content2 border border-default-100 shadow-sm
              hover:shadow-md hover:scale-[1.01]
              transition-all cursor-pointer p-5
            "
          >
            <div className="flex justify-between items-start">
              <h3 className="text-base font-semibold">
                {note.title || "Sin título"}
              </h3>
              <Button
                size="sm"
                color="danger"
                variant="light"
                onClick={(e) => {
                  e.stopPropagation();
                  setNoteToDelete(note.id);
                  onOpen();
                }}
              >
                🗑️
              </Button>
            </div>

            <small className="text-default-500 text-xs">
              {note.created_at.split("T")[0]}
            </small>
          </div>
        ))}
      </div>

      <ConfirmDeleteModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleDelete}
      />
    </>
  );
}
