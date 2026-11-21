import { FastifyInstance } from 'fastify';
import type { TripDto } from '@jost/models';
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
    await deletePhotoFile(id, name);
    return trip;
  });
}
