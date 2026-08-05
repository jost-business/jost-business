import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance) {
  fastify.get('/jost-business/travel', async () => {
    return { entries: [] };
  });

  fastify.post('/jost-business/travel', async (request, reply) => {
    reply.code(201);
    return { created: true };
  });
}
