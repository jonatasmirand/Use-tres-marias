import crypto from "node:crypto";
import { Buffer } from "node:buffer";
import { createClient } from "@/lib/supabase/server";

export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"] as const;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export type SupportedImageFormat = "jpeg" | "png" | "webp";

export interface FormatSpecification {
  format: SupportedImageFormat;
  extension: "jpg" | "png" | "webp";
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  allowedClientMimes: readonly string[];
  allowedClientExtensions: readonly string[];
}

export const SUPPORTED_FORMATS: Readonly<Record<SupportedImageFormat, FormatSpecification>> = {
  jpeg: {
    format: "jpeg",
    extension: "jpg",
    mimeType: "image/jpeg",
    allowedClientMimes: ["image/jpeg", "image/jpg", "image/pjpeg"],
    allowedClientExtensions: ["jpg", "jpeg"],
  },
  png: {
    format: "png",
    extension: "png",
    mimeType: "image/png",
    allowedClientMimes: ["image/png"],
    allowedClientExtensions: ["png"],
  },
  webp: {
    format: "webp",
    extension: "webp",
    mimeType: "image/webp",
    allowedClientMimes: ["image/webp"],
    allowedClientExtensions: ["webp"],
  },
} as const;

export class MediaValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaValidationError";
  }
}

const DANGEROUS_EXTENSIONS_PATTERN = /\.(php\d*|phtml|html?|js|jsx|ts|tsx|exe|dll|bat|cmd|sh|svg|xml|json|py|pl|cgi|asp|aspx|jsp)(\.|$)/i;

/**
 * Valida a assinatura binária (magic bytes) do arquivo de acordo com os formatos permitidos.
 */
export function detectImageFormat(buffer: Buffer): SupportedImageFormat | null {
  if (!buffer || buffer.length < 12) {
    return null;
  }

  // 1. PNG: 8 bytes assinatura + chunk IHDR
  if (
    buffer.length >= 16 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 && // P
    buffer[2] === 0x4e && // N
    buffer[3] === 0x47 && // G
    buffer[4] === 0x0d && // \r
    buffer[5] === 0x0a && // \n
    buffer[6] === 0x1a && // Ctrl+Z
    buffer[7] === 0x0a && // \n
    buffer[12] === 0x49 && // I
    buffer[13] === 0x48 && // H
    buffer[14] === 0x44 && // D
    buffer[15] === 0x52    // R
  ) {
    return "png";
  }

  // 2. JPEG: SOI (FF D8) + Marker (FF)
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "jpeg";
  }

  // 3. WebP: RIFF (bytes 0-3) + WEBP (bytes 8-11) + chunk VP8 (bytes 12-14)
  if (
    buffer.length >= 16 &&
    buffer[0] === 0x52 && // R
    buffer[1] === 0x49 && // I
    buffer[2] === 0x46 && // F
    buffer[3] === 0x46 && // F
    buffer[8] === 0x57 && // W
    buffer[9] === 0x45 && // E
    buffer[10] === 0x42 && // B
    buffer[11] === 0x50 && // P
    buffer[12] === 0x56 && // V
    buffer[13] === 0x50 && // P
    buffer[14] === 0x38 && // 8
    (buffer[15] === 0x20 || buffer[15] === 0x4c || buffer[15] === 0x58) // ' ', 'L' ou 'X'
  ) {
    return "webp";
  }

  return null;
}

export interface UploadMediaResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

/**
 * Upload seguro de mídia para o bucket 'cms-media' no Supabase Storage.
 * Valida tamanho, nome, assinatura binária (magic bytes) e deriva extensão e MIME type seguros.
 */
export async function uploadCmsMedia(file: File): Promise<UploadMediaResult> {
  // 1. Validação antecipada de tamanho para evitar alocação excessiva de memória
  if (!file || typeof file.size !== "number" || file.size <= 0) {
    throw new MediaValidationError("O arquivo enviado está vazio.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new MediaValidationError("O arquivo ultrapassa o limite máximo permitido de 5MB.");
  }

  // 2. Validação antecipada do nome do arquivo
  if (!file.name || typeof file.name !== "string" || file.name.trim() === "") {
    throw new MediaValidationError("Nome de arquivo ausente ou inválido.");
  }

  const trimmedName = file.name.trim();

  // Rejeita tentativas de path traversal
  if (trimmedName.includes("/") || trimmedName.includes("\\") || trimmedName.includes("..")) {
    throw new MediaValidationError("Nome de arquivo contém caracteres de caminho inválidos.");
  }

  // Rejeita extensões perigosas ou ativas no nome (mesmo em extensões duplas, como file.php.png)
  if (DANGEROUS_EXTENSIONS_PATTERN.test(trimmedName)) {
    throw new MediaValidationError("Nome de arquivo suspeito ou contém extensão não permitida.");
  }

  // Valida extensão declarada pelo cliente
  const clientExt = trimmedName.includes(".") ? trimmedName.split(".").pop()?.toLowerCase() || "" : "";
  if (!clientExt || !ALLOWED_EXTENSIONS.includes(clientExt as (typeof ALLOWED_EXTENSIONS)[number])) {
    throw new MediaValidationError("Extensão de arquivo não permitida. Use JPG, PNG ou WebP.");
  }

  // Valida tipo MIME declarado pelo cliente (se informado)
  const clientMime = file.type ? file.type.toLowerCase().trim() : "";
  if (clientMime && clientMime !== "application/octet-stream") {
    const isAllowedClientMime = Object.values(SUPPORTED_FORMATS).some((spec) =>
      spec.allowedClientMimes.includes(clientMime)
    );
    if (!isAllowedClientMime) {
      throw new MediaValidationError(`Tipo de mídia não permitido (${file.type}). Use JPG, PNG ou WebP.`);
    }
  }

  // 3. Leitura do buffer e validação de magic bytes
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const detectedFormat = detectImageFormat(buffer);
  if (!detectedFormat) {
    throw new MediaValidationError("Assinatura binária inválida ou conteúdo incompatível com os formatos suportados (JPEG, PNG, WebP).");
  }

  const formatSpec = SUPPORTED_FORMATS[detectedFormat];

  // 4. Verificação de consistência entre dados declarados pelo cliente e a assinatura binária real
  if (!formatSpec.allowedClientExtensions.includes(clientExt)) {
    throw new MediaValidationError(`A extensão informada (.${clientExt}) não corresponde ao formato binário real da imagem (${formatSpec.format.toUpperCase()}).`);
  }

  if (clientMime && clientMime !== "application/octet-stream" && !formatSpec.allowedClientMimes.includes(clientMime)) {
    throw new MediaValidationError(`O tipo MIME informado (${clientMime}) não corresponde ao formato binário real da imagem (${formatSpec.mimeType}).`);
  }

  // 5. Geração de nome aleatório e seguro no servidor (sem utilizar o nome fornecido pelo cliente)
  const randomHex = crypto.randomBytes(8).toString("hex");
  const uniqueName = `hero_${Date.now()}_${randomHex}.${formatSpec.extension}`;
  const filePath = `uploads/${uniqueName}`;

  // 6. Persistência no Supabase Storage utilizando estritamente o MIME type validado
  const supabase = await createClient();

  const { error } = await supabase.storage
    .from("cms-media")
    .upload(filePath, buffer, {
      contentType: formatSpec.mimeType,
      upsert: false,
    });

  if (error) {
    console.error("[uploadCmsMedia] Falha no Supabase Storage:", error.message);
    throw new Error("Erro ao salvar imagem no serviço de armazenamento.");
  }

  const { data: { publicUrl } } = supabase.storage
    .from("cms-media")
    .getPublicUrl(filePath);

  return {
    url: publicUrl,
    filename: uniqueName,
    size: buffer.length,
    mimeType: formatSpec.mimeType,
  };
}
