// app/dashboard/[id]/page.tsx
import { supabaseServer } from "@/lib/supabaseServer";
import NotePageClient from "./NotePageClient";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = supabaseServer();

  const { data: note, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .single();

  return <NotePageClient initialNote={note} id={id} />;
}
