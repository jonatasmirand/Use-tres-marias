import { createClient } from "../../lib/supabase/server";

export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface UploadMediaResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

/**
 * Upload seguro de mídia para o bucket 'cms-media' no Supabase Storage
 */
export async function uploadCmsMedia(file: File): Promise<UploadMediaResult> {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(`Tipo de arquivo não permitido (${file.type}). Use JPG, PNG, WEBP ou SVG.`);
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("O arquivo ultrapassa o limite máximo permitido de 5MB.");
  }

  const supabase = await createClient();

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const uniqueName = `hero_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
  const filePath = `uploads/${uniqueName}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await supabase.storage
    .from("cms-media")
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(`Erro ao salvar imagem no Supabase Storage: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from("cms-media")
    .getPublicUrl(filePath);

  return {
    url: publicUrl,
    filename: uniqueName,
    size: file.size,
    mimeType: file.type,
  };
}
