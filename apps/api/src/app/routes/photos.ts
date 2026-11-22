import { FastifyInstance } from 'fastify';
import type { PhotoLabelChange, TripDto } from '@jost/models';
import { deletePhotoFile, newPhotoName, PHOTO_NAME_PATTERN, savePhoto, toGalleryPhoto } from '../photos/photos';
import { idSchema, TRIP_COLUMNS, tripSchema } from '../trips/trip-schema';

/**
 * Adding and removing a trip's photos. Both need a login and answer with the
 * whole trip, so the frontend can put it straight into its list.
 */
export default async function (fastify: FastifyInstance) {
  const { sql } = fastify;
  const columns = sql.unsafe(TRIP_COLUMNS);

  // One photo per request: the browser sends them one after the other, so a
  // failed photo does not take the others down and progress is easy to show
  fastify.post<{ Params: { id: string } }>('/trips/:id/photos', {
    preHandler: fastify.requireUser,
    schema: {
      params: { type: 'object', required: ['id'], properties: { id: idSchema } },
      response: { 201: tripSchema },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const [exists] = await sql`SELECT 1 FROM trips WHERE id = ${id}`;
    if (!exists) return reply.notFound(`Trip ${id} does not exist`);

    const file = await request.file();
    if (!file) return reply.badRequest('Send the photo as multipart/form-data');
    // Throws a 413 once the upload passes the size limit
    const upload = await file.toBuffer();

    let photo: Buffer;
    try {
      photo = await toGalleryPhoto(upload);
    } catch {
      return reply.unsupportedMediaType('This is not an image the server can read (JPEG, HEIC, PNG, WebP, AVIF, GIF or TIFF)');
    }

    const name = newPhotoName();
    await savePhoto(id, name, photo);
    const [trip] = await sql<TripDto[]>`
      UPDATE trips SET photos = array_append(photos, ${name}) WHERE id = ${id} RETURNING ${columns}
    `;
    if (!trip) {
      // The trip was deleted while the photo was being processed
      await deletePhotoFile(id, name);
      return reply.notFound(`Trip ${id} does not exist`);
    }
    return reply.code(201).send(trip);
  });

  // A new order of the same photos. Only taken when it holds exactly the photos
  // the trip has, so a stale page cannot drop or bring back a photo
  fastify.put<{ Params: { id: string }; Body: { photos: string[] } }>('/trips/:id/photos', {
    preHandler: fastify.requireUser,
    schema: {
      params: { type: 'object', required: ['id'], properties: { id: idSchema } },
      body: {
        type: 'object',
        required: ['photos'],
        additionalProperties: false,
        properties: {
          photos: { type: 'array', uniqueItems: true, maxItems: 2000, items: { type: 'string', pattern: PHOTO_NAME_PATTERN } },
        },
      },
      response: { 200: tripSchema },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const { photos } = request.body;
    const [trip] = await sql<TripDto[]>`
      UPDATE trips SET photos = ${photos}::text[]
      WHERE id = ${id}
        AND cardinality(photos) = ${photos.length}
        AND photos @> ${photos}::text[]
      RETURNING ${columns}
    `;
    if (trip) return trip;
    const [exists] = await sql`SELECT 1 FROM trips WHERE id = ${id}`;
    if (!exists) return reply.notFound(`Trip ${id} does not exist`);
    return reply.conflict('The photos of this trip have changed, reload the page and try again');
  });

  // Gives a label to some photos and/or takes it off others, in one go. A label
  // that differs from one of the trip's labels only in case is spelled like that
  // one, so "dakhla club" joins "Dakhla Club" instead of starting a second label.
  // Names of photos the trip no longer has are skipped.
  const photoNames = { type: 'array', uniqueItems: true, maxItems: 2000, items: { type: 'string', pattern: PHOTO_NAME_PATTERN } };
  fastify.patch<{ Params: { id: string }; Body: PhotoLabelChange }>('/trips/:id/photo-labels', {
    preHandler: fastify.requireUser,
    schema: {
      params: { type: 'object', required: ['id'], properties: { id: idSchema } },
      body: {
        type: 'object',
        required: ['label'],
        additionalProperties: false,
        properties: {
          // Printable text without line breaks; trimmed before it is saved
          label: { type: 'string', minLength: 1, maxLength: 40, pattern: '^[^\\p{Cc}]*\\S[^\\p{Cc}]*$' },
          add: photoNames,
          remove: photoNames,
        },
      },
      response: { 200: tripSchema },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const { add = [], remove = [] } = request.body;
    const typed = request.body.label.trim().replace(/\s+/g, ' ');
    const trip = await sql.begin(async tx => {
      const [exists] = await tx`SELECT photos FROM trips WHERE id = ${id} FOR UPDATE`;
      if (!exists) return undefined;
      const [known] = await tx<{ label: string }[]>`
        SELECT label FROM photo_labels WHERE trip_id = ${id} AND lower(label) = lower(${typed}) LIMIT 1
      `;
      const label = known?.label ?? typed;
      if (add.length) {
        await tx`
          INSERT INTO photo_labels (trip_id, photo, label)
          SELECT ${id}, photo, ${label} FROM unnest(${add}::text[]) AS photo
          WHERE photo = ANY (${exists.photos}::text[])
          ON CONFLICT DO NOTHING
        `;
      }
      if (remove.length) {
        await tx`DELETE FROM photo_labels WHERE trip_id = ${id} AND label = ${label} AND photo = ANY (${remove}::text[])`;
      }
      const [updated] = await tx<TripDto[]>`SELECT ${columns} FROM trips WHERE id = ${id}`;
      return updated;
    });
    return trip ?? reply.notFound(`Trip ${id} does not exist`);
  });

  fastify.delete<{ Params: { id: string; name: string } }>('/trips/:id/photos/:name', {
    preHandler: fastify.requireUser,
    schema: {
      params: {
        type: 'object',
        required: ['id', 'name'],
        // The pattern keeps the name a plain file name: no slashes, no "..", no other folder
        properties: { id: idSchema, name: { type: 'string', pattern: PHOTO_NAME_PATTERN } },
      },
      response: { 200: tripSchema },
    },
  }, async (request, reply) => {
    const { id, name } = request.params;
    const [trip] = await sql<TripDto[]>`
      UPDATE trips SET photos = array_remove(photos, ${name})
      WHERE id = ${id} AND ${name} = ANY(photos)
      RETURNING ${columns}
    `;
    if (!trip) return reply.notFound(`Trip ${id} has no photo ${name}`);
    await sql`DELETE FROM photo_labels WHERE trip_id = ${id} AND photo = ${name}`;
    await deletePhotoFile(id, name);
    return trip;
  });
}
