export type UploadedFilePayload = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
};

const IMAGE_EXTENSION = /\.(jpe?g|png|webp|heic|heif)$/i;

export function isAllowedPhoto(file: UploadedFilePayload): boolean {
  if (file.mimetype.startsWith('image/')) return true;
  return IMAGE_EXTENSION.test(file.originalname);
}

export function photoMimeType(file: UploadedFilePayload): string {
  if (file.mimetype.startsWith('image/')) return file.mimetype;
  const name = file.originalname.toLowerCase();
  if (name.endsWith('.png')) return 'image/png';
  if (name.endsWith('.webp')) return 'image/webp';
  if (name.endsWith('.heic')) return 'image/heic';
  if (name.endsWith('.heif')) return 'image/heif';
  return 'image/jpeg';
}
