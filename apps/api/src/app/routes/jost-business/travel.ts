import { FastifyInstance } from 'fastify';
import { TravelEntry } from '@jost/models';

export default async function (fastify: FastifyInstance) {
  fastify.get('/jost-business/travel', async () => {
    const entries = await fastify.sql<TravelEntry[]>`
      SELECT id, destination, from_date, to_date
      FROM travel_entries
      ORDER BY from_date DESC
    `;
    return { entries };
  });

  fastify.post('/jost-business/travel', async (request, reply) => {
    const { id, destination, from_date, to_date } = request.body as TravelEntry;
    await fastify.sql`
      INSERT INTO travel_entries (id, destination, from_date, to_date)
      VALUES (${id}, ${destination}, ${from_date}, ${to_date})
    `;
    reply.code(201);
    return { created: true };
  });
}
