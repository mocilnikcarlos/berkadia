"use client";
import { FormEvent } from "react";

interface Props {
  onAddNote: (title: string) => Promise<void>;
}

export function NoteForm({ onAddNote }: Props) {
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("title") as HTMLInputElement;
    const title = input.value.trim();
    if (!title) return;
    await onAddNote(title);
    input.value = "";
  };

  return (
    <form className="note-form" onSubmit={handleSubmit}>
      <input type="text" name="title" placeholder="Escribí una nota..." />
      <button type="submit">Agregar</button>
    </form>
  );
}
