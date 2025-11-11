import { Note } from "@/hooks/useNotes";
import { Card, CardBody, Spinner, Button } from "@heroui/react";

interface Props {
  notes: Note[];
  loading: boolean;
  onDelete: (id: number) => Promise<void>;
}

export function NotesList({ notes, loading, onDelete }: Props) {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {notes.map((note) => (
        <Card
          key={note.id}
          className="hover:scale-[1.01] transition-all cursor-pointer"
          onClick={() => (window.location.href = `/dashboard/${note.id}`)}
        >
          <CardBody className="flex flex-col gap-2 py-4 px-5">
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
                  if (confirm("¿Eliminar esta nota?")) onDelete(note.id);
                }}
              >
                🗑️
              </Button>
            </div>

            <small className="text-default-500 text-xs">
              {note.created_at.split("T")[0]}
            </small>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
