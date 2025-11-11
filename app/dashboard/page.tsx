"use client";
import { useRouter } from "next/navigation";
import { useNotes } from "@/hooks/useNotes";
import { useRef } from "react";
import { NotesList } from "./NotesList";
import { DashboardHeader } from "./DashboardHeader";
import { Card, CardBody } from "@heroui/react";

export default function DashboardPage() {
  const router = useRouter();
  const { userEmail, notes, loading, addNote, deleteNote, logout } = useNotes();
  const mainRef = useRef<HTMLElement>(null);

  if (!userEmail)
    return <p className="text-center mt-40">Cargando usuario...</p>;

  const handleCreateNote = async () => {
    const newNote = await addNote("Nueva nota");
    if (newNote?.id) router.push(`/dashboard/${newNote.id}`);
  };

  return (
    <main
      ref={mainRef}
      className="min-h-screen flex flex-col bg-background text-foreground px-6 py-10"
    >
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-8">
        <DashboardHeader userEmail={userEmail} onLogout={logout} />

        <section className="flex flex-col gap-4">
          <h2 className="text-3xl font-semibold">Mis notas</h2>

          {/* Card para crear nueva nota */}
          <Card
            isPressable
            onPress={handleCreateNote}
            className="bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <CardBody className="flex justify-center items-center py-4 cursor-pointer">
              <span className="text-base font-medium">+ Crear nueva nota</span>
            </CardBody>
          </Card>

          {/* Listado de notas */}
          <NotesList notes={notes} loading={loading} onDelete={deleteNote} />
        </section>
      </div>
    </main>
  );
}
