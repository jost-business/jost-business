import { FastifyInstance } from 'fastify';
import type { TripDto } from '@jost/models';

// The response schema lets Fastify serialize faster and guarantees that only
// these fields leave the API, whatever the query selects. Dates from Postgres
// are written as ISO 8601 strings because of format: date-time.
const tripSchema = {
  type: 'object',
  required: ['id', 'destination', 'startsAt', 'endsAt', 'photos'],
  properties: {
    id: { type: 'string' },
    destination: { type: 'string' },
    startsAt: { type: 'string', format: 'date-time' },
    endsAt: { type: 'string', format: 'date-time' },
    photos: { type: 'array', items: { type: 'string' } },
  },
} as const;

export default async function (fastify: FastifyInstance) {
  const { sql } = fastify;

  fastify.get('/trips', {
    schema: {
      response: { 200: { type: 'array', items: tripSchema } },
    },
  }, async () => {
    return sql<TripDto[]>`
      SELECT id, destination, starts_at AS "startsAt", ends_at AS "endsAt", photos
      FROM trips
      ORDER BY starts_at DESC
    `;
  });

  fastify.get<{ Params: { id: string } }>('/trips/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', pattern: '^[a-z0-9-]+$', maxLength: 64 } },
      },
      response: { 200: tripSchema },
    },
  }, async (request, reply) => {
    const [trip] = await sql<TripDto[]>`
      SELECT id, destination, starts_at AS "startsAt", ends_at AS "endsAt", photos
      FROM trips
      WHERE id = ${request.params.id}
    `;
    return trip ?? reply.notFound(`Trip ${request.params.id} does not exist`);
  });
}
