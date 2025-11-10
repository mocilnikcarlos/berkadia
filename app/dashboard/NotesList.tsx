import { Note } from "@/hooks/useNotes";

interface Props {
  notes: Note[];
  loading: boolean;
  onDelete: (id: number) => Promise<void>;
}

export function NotesList({ notes, loading, onDelete }: Props) {
  if (loading) return <p>Cargando...</p>;
  if (notes.length === 0) return <p>No tenés notas todavía.</p>;

  return (
    <div className="notes-list">
      {notes.map((note) => (
        <div
          key={note.id}
          className="note-card"
          onClick={() => (window.location.href = `/dashboard/${note.id}`)}
        >
          <h3>{note.title || "Sin título"}</h3>
          <small>{note.created_at.split("T")[0]}</small>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("¿Eliminar esta nota?")) onDelete(note.id);
            }}
          >
            🗑️
          </button>
        </div>
      ))}
    </div>
  );
}
