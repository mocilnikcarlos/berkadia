// /lib/uploadImage.ts
import { supabaseBrowser } from "@/lib/supabaseClient";

interface UploadParams {
  file: File;
  userId: string;
  noteId: string;
  blockId: string;
}

export async function uploadImageToStorage({
  file,
  userId,
  noteId,
  blockId,
}: UploadParams) {
  // ❗ El bucket NO va en el path
  const filePath = `${userId}/${noteId}/${blockId}/${file.name}`;

  const { error } = await supabaseBrowser.storage
    .from("berkanote")    // el bucket se define aquí
    .upload(filePath, file, {
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabaseBrowser.storage
    .from("berkanote")
    .getPublicUrl(filePath);

  return {
    url: data.publicUrl,
    path: filePath
  };
}
