import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance) {
  fastify.get('/pwa/notification', async () => {
    const events = await fastify.sql`
      SELECT id, event, timestamp
      FROM notification_events
      ORDER BY timestamp DESC
      LIMIT 100
    `;
    return { events };
  });

  fastify.post('/pwa/notification', async (request, reply) => {
    const body = request.body as { event?: string; timestamp?: string };
    const event = body?.event ?? 'app_open';
    const timestamp = body?.timestamp ? new Date(body.timestamp) : new Date();

    await fastify.sql`
      INSERT INTO notification_events (event, timestamp)
      VALUES (${event}, ${timestamp})
    `;

    reply.code(201);
    return { logged: true };
  });
}
