// The response schema lets Fastify serialize faster and guarantees that only
// these fields leave the API, whatever the query selects. Dates from Postgres
// are written as ISO 8601 strings because of format: date-time.
export const tripSchema = {
  type: 'object',
  required: ['id', 'destination', 'startsAt', 'endsAt', 'photos', 'photoLabels', 'labelOrder'],
  properties: {
    id: { type: 'string' },
    destination: { type: 'string' },
    startsAt: { type: 'string', format: 'date-time' },
    endsAt: { type: 'string', format: 'date-time' },
    photos: { type: 'array', items: { type: 'string' } },
    // Photo name → its labels; photos without labels are left out
    photoLabels: { type: 'object', additionalProperties: { type: 'array', items: { type: 'string' } } },
    // The order of the labels' sections; labels not in it come after, A to Z
    labelOrder: { type: 'array', items: { type: 'string' } },
  },
} as const;

// Lower-case words separated by dashes, like 2026-12-casablanca: the id is part of the URL
export const idSchema = { type: 'string', pattern: '^[a-z0-9]+(-[a-z0-9]+)*$', minLength: 3, maxLength: 64 } as const;

/**
 * The columns of a TripDto, for SELECT and RETURNING (through sql.unsafe).
 * The labels come along as one JSON object per trip, only for photos the trip
 * still has.
 */
export const TRIP_COLUMNS = `id, destination, starts_at AS "startsAt", ends_at AS "endsAt", photos, label_order AS "labelOrder",
  (SELECT coalesce(jsonb_object_agg(l.photo, l.labels), '{}'::jsonb)
     FROM (SELECT photo, array_agg(label ORDER BY lower(label)) AS labels
             FROM photo_labels
            WHERE photo_labels.trip_id = trips.id AND photo_labels.photo = ANY (trips.photos)
            GROUP BY photo) l
  ) AS "photoLabels"`;
