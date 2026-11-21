// The response schema lets Fastify serialize faster and guarantees that only
// these fields leave the API, whatever the query selects. Dates from Postgres
// are written as ISO 8601 strings because of format: date-time.
export const tripSchema = {
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
export const idSchema = { type: 'string', pattern: '^[a-z0-9]+(-[a-z0-9]+)*$', minLength: 3, maxLength: 64 } as const;

/** The columns of a TripDto, for SELECT and RETURNING (through sql.unsafe). */
export const TRIP_COLUMNS = 'id, destination, starts_at AS "startsAt", ends_at AS "endsAt", photos';
