import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';
import type { FastifyInstance } from 'fastify';

/**
 * Rate limiting per client IP, switched on per route with
 * `config: { rateLimit: { ... } }` instead of for every request.
 */
export default fp(
  async function (fastify: FastifyInstance) {
    await fastify.register(rateLimit, { global: false });
  },
  { name: 'rate-limit' },
);
