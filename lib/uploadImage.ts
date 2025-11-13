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
  // Path correcto (sin repetir el bucket)
  const filePath = `${userId}/${noteId}/${blockId}/${file.name}`;

  const { error } = await supabaseBrowser.storage
    .from("berkanote")
    .upload(filePath, file, {
      upsert: true,
    });

  if (error) {
    console.error("Upload error:", error);
    throw error;
  }

  const { data } = supabaseBrowser.storage
    .from("berkanote")
    .getPublicUrl(filePath);

  return data.publicUrl;
}
