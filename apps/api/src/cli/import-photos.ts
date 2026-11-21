/**
 * Moves photos from folders into the photo store: each sub folder is named
 * after a trip and holds its photos, like libs/shared-assets/src/images/trips.
 * Every photo is converted like an upload (upright, at most 2000 px, WebP,
 * without metadata) and the trip's photo list is rewritten to match.
 *
 *   docker compose run --rm -v ./libs/shared-assets/src/images/trips:/import:ro \
 *     api node apps/api/src/cli/import-photos.js /import
 *
 * Running it again does no harm: an imported photo keeps its name, so it is
 * replaced rather than added twice. Photos uploaded in the meantime stay.
 */
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { extname, join, parse } from 'node:path';
import postgres from 'postgres';
import { photoPath, savePhoto, toGalleryPhoto } from '../app/photos/photos';

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.tif', '.tiff']);

async function main(): Promise<void> {
  const [source] = process.argv.slice(2);
  if (!source) {
    console.error('Usage: import-photos <folder with one sub folder per trip>');
    process.exit(1);
  }
  const url = process.env['DATABASE_URL'];
  if (!url) throw new Error('DATABASE_URL is not set');

  const sql = postgres(url);
  try {
    const folders = (await readdir(source, { withFileTypes: true })).filter(entry => entry.isDirectory());
    for (const folder of folders) {
      const tripId = folder.name;
      const [trip] = await sql<{ photos: string[] }[]>`SELECT photos FROM trips WHERE id = ${tripId}`;
      if (!trip) {
        console.log(`${tripId}: no such trip, skipped`);
        continue;
      }

      const dir = join(source, tripId);
      const files = (await readdir(dir)).filter(file => IMAGE_EXTENSIONS.has(extname(file).toLowerCase()));
      // The trip's list says which files are gallery photos and in which order;
      // other images in the folder (like a map on the trip's page) are left out.
      // It names the files as they are, or as imported before (hera-pool.webp)
      const listed = trip.photos
        .map(photo => files.find(file => file === photo || galleryName(file) === photo))
        .filter((file): file is string => file !== undefined);
      const toImport = listed.length ? listed : files.sort();
      if (!toImport.length) {
        console.log(`${tripId}: no photos`);
        continue;
      }

      const imported: string[] = [];
      for (const file of toImport) {
        const name = galleryName(file);
        await savePhoto(tripId, name, await toGalleryPhoto(await readFile(join(dir, file))));
        imported.push(name);
      }
      // Keep photos that were uploaded through the site; drop names of the old files
      const uploaded = trip.photos.filter(photo => !imported.includes(photo) && existsSync(photoPath(tripId, photo)));
      await sql`UPDATE trips SET photos = ${[...imported, ...uploaded]} WHERE id = ${tripId}`;
      console.log(`${tripId}: ${imported.length} photos imported${uploaded.length ? `, ${uploaded.length} uploaded kept` : ''}`);
    }
  } finally {
    await sql.end();
  }
}

/** "Hera Pool.JPEG" → "hera-pool.webp": a name the API accepts (see PHOTO_NAME_PATTERN). */
function galleryName(file: string): string {
  const base = parse(file).name.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^[-_]+/, '').slice(0, 80);
  return `${base || 'photo'}.webp`;
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
