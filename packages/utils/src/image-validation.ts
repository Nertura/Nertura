export type ImageValidationErrorCode =
  | 'missing'
  | 'unsupported'
  | 'invalid_data'
  | 'too_large'
  | 'mime_mismatch'
  | 'unrecognized';

export type AllowedImageMime = 'image/jpeg' | 'image/png' | 'image/webp';

const ALLOWED_MIMES = new Set<AllowedImageMime>(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 5 * 1024 * 1024;

/** Normalize common mobile / messenger MIME variants. */
export function normalizeImageMimeType(mimeType: string | null | undefined): string | null {
  if (!mimeType?.trim()) return null;
  const m = mimeType.toLowerCase().trim().split(';')[0]!.trim();
  if (m === 'image/jpg' || m === 'image/pjpeg' || m === 'image/jfif') return 'image/jpeg';
  if (m === 'image/x-png') return 'image/png';
  if (m === 'application/octet-stream') return null;
  return m;
}

function decodeBase64Payload(base64: string): Buffer {
  const data = base64.includes(',') ? base64.split(',')[1]! : base64;
  return Buffer.from(data, 'base64');
}

/** Detect image type from magic bytes (JPEG, PNG, WebP). */
export function sniffImageMime(buffer: Buffer): AllowedImageMime | null {
  if (buffer.length < 12) return null;

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }

  if (
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp';
  }

  return null;
}

/** Minimal JPEG structure check — SOI present and plausible payload. */
function isPlausibleJpeg(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return false;
  return buffer.length >= 128;
}

function isPlausibleImageBuffer(buffer: Buffer, mime: AllowedImageMime): boolean {
  if (mime === 'image/jpeg') return isPlausibleJpeg(buffer);
  return buffer.length >= 24;
}

export function validateImageInput(
  base64: string | null | undefined,
  mimeType: string | null | undefined
):
  | { ok: true; data: string; mime: AllowedImageMime; detectedMime: AllowedImageMime }
  | { ok: false; code: ImageValidationErrorCode; error: string } {
  if (!base64?.trim()) {
    return { ok: false, code: 'missing', error: 'Image data required' };
  }

  let buffer: Buffer;
  try {
    buffer = decodeBase64Payload(base64);
  } catch {
    return { ok: false, code: 'invalid_data', error: 'Invalid base64 image data' };
  }

  if (buffer.length === 0) {
    return { ok: false, code: 'invalid_data', error: 'Empty image data' };
  }

  if (buffer.length > MAX_BYTES) {
    return { ok: false, code: 'too_large', error: `Image exceeds ${MAX_BYTES} bytes` };
  }

  const detected = sniffImageMime(buffer);
  if (!detected) {
    return { ok: false, code: 'unrecognized', error: 'Unrecognized image format (magic bytes)' };
  }

  if (!isPlausibleImageBuffer(buffer, detected)) {
    return { ok: false, code: 'invalid_data', error: 'Image data appears truncated or corrupt' };
  }

  const normalizedDeclared = normalizeImageMimeType(mimeType);
  if (normalizedDeclared && !ALLOWED_MIMES.has(normalizedDeclared as AllowedImageMime)) {
    return {
      ok: false,
      code: 'unsupported',
      error: `Declared MIME not allowed: ${normalizedDeclared}`,
    };
  }

  if (normalizedDeclared && normalizedDeclared !== detected) {
    // Trust magic bytes for mobile / messenger uploads with wrong declared type.
    console.warn('[image-validation] declared MIME differs from detected; using detected', {
      declared: normalizedDeclared,
      detected,
    });
  }

  return { ok: true, data: base64, mime: detected, detectedMime: detected };
}
