import { FastifyInstance } from 'fastify';
import postgres from 'postgres';
import type { NewTripRequest, TripDto, TripIdAvailability, TripInput } from '@jost/models';

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

// Lower-case words separated by dashes, like 2026-12-casablanca: the id is part of the URL
const idSchema = { type: 'string', pattern: '^[a-z0-9]+(-[a-z0-9]+)*$', minLength: 3, maxLength: 64 } as const;

const tripInputProperties = {
  destination: { type: 'string', minLength: 2, maxLength: 120 },
  startsAt: { type: 'string', format: 'date-time' },
  endsAt: { type: 'string', format: 'date-time' },
} as const;

const TRIP_COLUMNS = 'id, destination, starts_at AS "startsAt", ends_at AS "endsAt", photos';

export default async function (fastify: FastifyInstance) {
  const { sql } = fastify;
  const columns = sql.unsafe(TRIP_COLUMNS);

  fastify.get('/trips', {
    schema: {
      response: { 200: { type: 'array', items: tripSchema } },
    },
  }, async () => {
    return sql<TripDto[]>`SELECT ${columns} FROM trips ORDER BY starts_at DESC`;
  });

  // Lets the trip form check an id while it is typed. A static path, so it
  // wins over /trips/:id
  fastify.get<{ Querystring: { id: string } }>('/trips/availability', {
    schema: {
      querystring: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', maxLength: 64 } },
      },
      response: {
        200: { type: 'object', required: ['available'], properties: { available: { type: 'boolean' } } },
      },
    },
  }, async (request): Promise<TripIdAvailability> => {
    const [taken] = await sql`SELECT 1 FROM trips WHERE id = ${request.query.id}`;
    return { available: !taken };
  });

  fastify.get<{ Params: { id: string } }>('/trips/:id', {
    schema: {
      params: { type: 'object', required: ['id'], properties: { id: idSchema } },
      response: { 200: tripSchema },
    },
  }, async (request, reply) => {
    const [trip] = await sql<TripDto[]>`SELECT ${columns} FROM trips WHERE id = ${request.params.id}`;
    return trip ?? reply.notFound(`Trip ${request.params.id} does not exist`);
  });

  fastify.post<{ Body: NewTripRequest }>('/trips', {
    preHandler: fastify.requireUser,
    schema: {
      body: {
        type: 'object',
        required: ['id', 'destination', 'startsAt', 'endsAt'],
        additionalProperties: false,
        properties: { id: idSchema, ...tripInputProperties },
      },
      response: { 201: tripSchema },
    },
  }, async (request, reply) => {
    const { id, destination, startsAt, endsAt } = request.body;
    if (!endsAfterStart(request.body)) return reply.badRequest('The trip must end after it starts');
    try {
      const [trip] = await sql<TripDto[]>`
        INSERT INTO trips (id, destination, starts_at, ends_at)
        VALUES (${id}, ${destination.trim()}, ${startsAt}, ${endsAt})
        RETURNING ${columns}
      `;
      return reply.code(201).send(trip);
    } catch (error) {
      // The form's availability check can lose a race against another request
      if (isUniqueViolation(error)) return reply.conflict(`A trip with the id ${id} already exists`);
      throw error;
    }
  });

  fastify.put<{ Params: { id: string }; Body: TripInput }>('/trips/:id', {
    preHandler: fastify.requireUser,
    schema: {
      params: { type: 'object', required: ['id'], properties: { id: idSchema } },
      body: {
        type: 'object',
        required: ['destination', 'startsAt', 'endsAt'],
        additionalProperties: false,
        properties: tripInputProperties,
      },
      response: { 200: tripSchema },
    },
  }, async (request, reply) => {
    const { destination, startsAt, endsAt } = request.body;
    if (!endsAfterStart(request.body)) return reply.badRequest('The trip must end after it starts');
    const [trip] = await sql<TripDto[]>`
      UPDATE trips SET destination = ${destination.trim()}, starts_at = ${startsAt}, ends_at = ${endsAt}
      WHERE id = ${request.params.id}
      RETURNING ${columns}
    `;
    return trip ?? reply.notFound(`Trip ${request.params.id} does not exist`);
  });
}

function endsAfterStart({ startsAt, endsAt }: TripInput): boolean {
  return Date.parse(endsAt) > Date.parse(startsAt);
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof postgres.PostgresError && error.code === '23505';
}
