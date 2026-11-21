import { randomBytes } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp, { type Sharp } from 'sharp';

/**
 * Where trip photos are kept: one folder per trip, created with its first
 * photo. In Docker this is a volume, so photos survive rebuilds and deploys.
 */
export const PHOTOS_DIR = process.env['PHOTOS_DIR'] ?? join(process.cwd(), 'tmp', 'photos');

/** Long enough for any photo, small enough to load fast in the gallery and lightbox. */
const MAX_EDGE = 2000;

/** The file names the API hands out, and the only ones it accepts back. */
export const PHOTO_NAME_PATTERN = '^[a-z0-9][a-z0-9_-]{0,80}\\.webp$';

/**
 * Turns an uploaded image into what the gallery serves: upright, at most
 * 2000 px on its longer edge, as WebP. sharp drops all metadata unless asked
 * to keep it, so the camera's GPS position never ends up on a public page.
 * Throws if the data is not an image that can be read.
 */
export async function toGalleryPhoto(input: Buffer): Promise<Buffer> {
  const image = (await isHevcHeic(input))
    ? await decodeHeic(input)
    : sharp(input, { failOn: 'error' }).rotate(); // apply the EXIF orientation before the metadata is dropped
  return image
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
}

/**
 * iPhone photos (HEIC) are HEVC-compressed. sharp recognises them but its
 * prebuilt binaries leave the HEVC decoder out (patents), so these go
 * through heic-decode, a WebAssembly build of libheif.
 */
async function isHevcHeic(input: Buffer): Promise<boolean> {
  try {
    const { format, compression } = await sharp(input).metadata();
    return format === 'heif' && compression === 'hevc';
  } catch {
    return false; // not an image sharp knows; the normal path reports it
  }
}

async function decodeHeic(input: Buffer): Promise<Sharp> {
  // Loaded only when needed: the WebAssembly module is large
  const { default: decode } = await import('heic-decode');
  // libheif applies the photo's rotation while decoding, so it comes out upright
  const { width, height, data } = await decode({ buffer: input });
  return sharp(Buffer.from(data.buffer, data.byteOffset, data.byteLength), { raw: { width, height, channels: 4 } });
}

/** A fresh, unguessable name, so uploads never overwrite each other. */
export function newPhotoName(): string {
  return `${randomBytes(8).toString('hex')}.webp`;
}

export function photoPath(tripId: string, name: string): string {
  return join(PHOTOS_DIR, tripId, name);
}

export async function savePhoto(tripId: string, name: string, data: Buffer): Promise<void> {
  await mkdir(join(PHOTOS_DIR, tripId), { recursive: true });
  await writeFile(photoPath(tripId, name), data);
}

export async function deletePhotoFile(tripId: string, name: string): Promise<void> {
  await rm(photoPath(tripId, name), { force: true });
}
