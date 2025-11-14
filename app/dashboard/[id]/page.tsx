import { supabaseServer } from "@/lib/supabaseServer";
import { cookies } from "next/headers";
import NotePageClient from "./NotePageClient";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // OBLIGADO: resolver params
  const { id } = await params;

  // OBLIGADO: resolver cookies()
  const cookieStore = await cookies();

  const supabase = supabaseServer(cookieStore);

  const { data: note } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .single();

  return <NotePageClient initialNote={note} id={id} />;
}
