const allowedReferenceTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxReferenceBytes = 10 * 1024 * 1024;

export function validateReferenceFile(file: File): { ok: true } | { ok: false; message: string } {
  if (!allowedReferenceTypes.has(file.type)) {
    return { ok: false, message: "Reference image must be JPEG, PNG, or WebP." };
  }

  if (file.size > maxReferenceBytes) {
    return { ok: false, message: "Reference image must be 10MB or smaller." };
  }

  return { ok: true };
}

export function buildStoragePath(userId: string, generationId: string, fileName: string): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
  return `${userId}/${generationId}/${Date.now()}-${safeName}`;
}

type StorageUploadClient = {
  storage: {
    from: (bucket: string) => {
      upload: (
        path: string,
        file: Blob,
        options: { contentType?: string; upsert: boolean }
      ) => Promise<{ error: { message: string } | null }>;
    };
  };
};

export async function uploadPrivateFile(
  client: StorageUploadClient,
  bucket: string,
  path: string,
  file: Blob,
  contentType?: string
): Promise<void> {
  const { error } = await client.storage.from(bucket).upload(path, file, { contentType, upsert: false });
  if (error) throw new Error(error.message);
}
