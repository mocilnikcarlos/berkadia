"use client";
import { useRouter } from "next/navigation";
import { useNotes } from "@/hooks/useNotes";
import { useRef } from "react";
import { NotesList } from "./NotesList";
import { DashboardHeader } from "./DashboardHeader";

export default function DashboardPage() {
  const router = useRouter();
  const { userEmail, notes, loading, addNote, deleteNote, logout } = useNotes();
  const mainRef = useRef<HTMLElement>(null);

  if (!userEmail) return <p>Cargando usuario...</p>;

  const handleCreateNote = async () => {
    const title = "Título de la nota";
    const newNote = await addNote(title);

    if (newNote?.id) {
      const path = `/dashboard/${newNote.id}`;

      // ⚡️ Animación antes de redirigir
      const main = mainRef.current;
      if (main) {
        main.classList.add("fade-out");
        setTimeout(() => {
          router.prefetch(path);
          router.push(path);
        }, 200);
      } else {
        router.push(path);
      }
    }
  };

  return (
    <main ref={mainRef} className="dashboard">
      <section>
        <DashboardHeader userEmail={userEmail} onLogout={logout} />
        <h2>Mis notas</h2>

        <div onClick={handleCreateNote} className="create-note">
          + Crear nueva nota
        </div>

        <NotesList notes={notes} loading={loading} onDelete={deleteNote} />
      </section>
    </main>
  );
}
