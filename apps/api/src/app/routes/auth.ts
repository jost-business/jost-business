import type { FastifyInstance } from 'fastify';
import type { LoginRequest, SessionDto, UserDto } from '@jost/models';
import { DUMMY_HASH, verifyPassword } from '../auth/password';

const userSchema = {
  type: 'object',
  required: ['id', 'email', 'name'],
  properties: {
    id: { type: 'string' },
    email: { type: 'string' },
    name: { type: 'string' },
  },
} as const;

const sessionSchema = {
  type: 'object',
  required: ['user'],
  properties: { user: { anyOf: [userSchema, { type: 'null' }] } },
} as const;

export default async function (fastify: FastifyInstance) {
  const { sql } = fastify;

  fastify.get('/auth/session', {
    schema: { response: { 200: sessionSchema } },
  }, async (request, reply): Promise<SessionDto> => {
    // Personal data: no cache along the way may keep it
    reply.header('Cache-Control', 'no-store');
    return { user: request.user };
  });

  fastify.post<{ Body: LoginRequest }>('/auth/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        additionalProperties: false,
        properties: {
          email: { type: 'string', minLength: 3, maxLength: 254 },
          // Upper bound so nobody can make the server hash megabytes
          password: { type: 'string', minLength: 1, maxLength: 256 },
        },
      },
      response: { 200: sessionSchema },
    },
    // Slows down password guessing: 5 attempts per minute and IP
    config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
    preHandler: fastify.requireSameOrigin,
  }, async (request, reply): Promise<SessionDto> => {
    const email = request.body.email.trim().toLowerCase();
    const [user] = await sql<(UserDto & { passwordHash: string })[]>`
      SELECT id, email, name, password_hash AS "passwordHash" FROM users WHERE email = ${email}
    `;

    // Unknown e-mail and wrong password take the same time and give the same
    // answer, so the login does not reveal which accounts exist
    const valid = await verifyPassword(request.body.password, user?.passwordHash ?? (await DUMMY_HASH));
    if (!user || !valid) return reply.unauthorized('Wrong e-mail or password');

    await fastify.startSession(reply, user.id);
    return { user: { id: user.id, email: user.email, name: user.name } };
  });

  fastify.post('/auth/logout', {
    preHandler: fastify.requireSameOrigin,
  }, async (request, reply) => {
    await fastify.endSession(request, reply);
    return reply.code(204).send();
  });
}
