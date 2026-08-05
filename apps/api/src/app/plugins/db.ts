import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import postgres from 'postgres';

declare module 'fastify' {
  interface FastifyInstance {
    sql: postgres.Sql;
  }
}

export default fp(async function (fastify: FastifyInstance) {
  const url = process.env['DATABASE_URL'];
  if (!url) throw new Error('DATABASE_URL is not set');

  const sql = postgres(url);
  fastify.decorate('sql', sql);
  fastify.addHook('onClose', () => sql.end());
});
