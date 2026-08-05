import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance) {
  fastify.get('/pwa/notification', async () => {
    return { events: [] };
  });

  fastify.post('/pwa/notification', async (request, reply) => {
    const body = request.body as { event?: string; timestamp?: string };
    fastify.log.info({ event: body?.event, timestamp: body?.timestamp }, 'pwa notification received');
    reply.code(201);
    return { logged: true };
  });
}
