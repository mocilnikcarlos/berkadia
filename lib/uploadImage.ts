// /lib/uploadImage.ts
import { supabaseBrowser } from "@/lib/supabaseClient";

interface UploadParams {
  file: File;
  userId: string;
  noteId: string;
  blockId: string;
}

export type UploadImageResult = {
  url?: string;
  path?: string;
  error: Error | null;
};

export async function uploadImage({
  file,
  userId,
  noteId,
  blockId,
}: UploadParams): Promise<UploadImageResult> {
  try {
    const filePath = `${userId}/${noteId}/${blockId}/${file.name}`;

    const { error: uploadError } = await supabaseBrowser.storage
      .from("berkanote")
      .upload(filePath, file, {
        upsert: true,
      });

    if (uploadError) {
      return { error: uploadError };
    }

    const { data } = supabaseBrowser.storage
      .from("berkanote")
      .getPublicUrl(filePath);

    return {
      url: data.publicUrl,
      path: filePath,
      error: null,
    };
  } catch (err) {
    return {
      error: err as Error,
    };
  }
}
