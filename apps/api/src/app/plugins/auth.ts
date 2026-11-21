import { createHash, randomBytes } from 'node:crypto';
import fp from 'fastify-plugin';
import cookie from '@fastify/cookie';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { UserDto } from '@jost/models';

/**
 * __Host- makes the browser refuse the cookie unless it is Secure, has Path=/
 * and no Domain, so no subdomain can set or read it.
 */
export const SESSION_COOKIE = '__Host-session';

const DAY = 24 * 60 * 60 * 1000;
const SESSION_LIFETIME = 30 * DAY;
// Active sessions are extended once less than half their lifetime is left
const RENEW_BELOW = SESSION_LIFETIME / 2;

declare module 'fastify' {
  interface FastifyRequest {
    /** The logged-in user, or null. Set for every request from the session cookie. */
    user: UserDto | null;
  }
  interface FastifyInstance {
    /** preHandler for routes that need a login: 401 without one, 403 for cross-site requests. */
    requireUser: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    /** preHandler that rejects requests the browser marks as coming from another site. */
    requireSameOrigin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    startSession: (reply: FastifyReply, userId: string) => Promise<void>;
    endSession: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(
  async function (fastify: FastifyInstance) {
    const { sql } = fastify;
    await fastify.register(cookie);

    const baseCookieOptions = {
      httpOnly: true, // JavaScript cannot read it, so an XSS bug cannot steal the session
      secure: true, // HTTPS only; browsers make an exception for http://localhost
      sameSite: 'strict' as const, // never sent along with requests started by other sites
      path: '/',
    };
    const cookieOptions = (expires: Date) => ({ ...baseCookieOptions, expires });
    // Deleting needs the same attributes: browsers ignore a __Host- cookie without Secure
    const clearSessionCookie = (reply: FastifyReply) => reply.clearCookie(SESSION_COOKIE, baseCookieOptions);

    fastify.decorateRequest('user', null);

    fastify.addHook('onRequest', async (request, reply) => {
      const token = request.cookies[SESSION_COOKIE];
      if (!token) return;

      const [row] = await sql<(UserDto & { sessionId: string; expiresAt: Date })[]>`
        SELECT u.id, u.email, u.name, s.id AS "sessionId", s.expires_at AS "expiresAt"
        FROM sessions s JOIN users u ON u.id = s.user_id
        WHERE s.id = ${hashToken(token)} AND s.expires_at > now()
      `;
      if (!row) {
        clearSessionCookie(reply);
        return;
      }

      request.user = { id: row.id, email: row.email, name: row.name };

      // Sliding expiry: someone who keeps using the app stays logged in
      if (row.expiresAt.getTime() - Date.now() < RENEW_BELOW) {
        const expires = new Date(Date.now() + SESSION_LIFETIME);
        await sql`UPDATE sessions SET expires_at = ${expires} WHERE id = ${row.sessionId}`;
        reply.setCookie(SESSION_COOKIE, token, cookieOptions(expires));
      }
    });

    fastify.decorate('requireSameOrigin', async (request: FastifyRequest, reply: FastifyReply) => {
      // Fetch Metadata: browsers send Sec-Fetch-Site on every request and pages
      // cannot change it. Anything but our own origin (or a typed URL) is refused,
      // as defence in depth next to the SameSite cookie.
      const site = request.headers['sec-fetch-site'];
      if (site && site !== 'same-origin' && site !== 'none') {
        return reply.forbidden('Cross-site requests are not allowed');
      }
    });

    fastify.decorate('requireUser', async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.requireSameOrigin(request, reply);
      if (reply.sent) return;
      if (!request.user) return reply.unauthorized('Login required');
    });

    fastify.decorate('startSession', async (reply: FastifyReply, userId: string) => {
      const token = randomBytes(32).toString('base64url');
      const expires = new Date(Date.now() + SESSION_LIFETIME);
      await sql`
        INSERT INTO sessions (id, user_id, expires_at)
        VALUES (${hashToken(token)}, ${userId}, ${expires})
      `;
      // Expired sessions are cleaned up whenever someone logs in
      await sql`DELETE FROM sessions WHERE expires_at < now()`;
      reply.setCookie(SESSION_COOKIE, token, cookieOptions(expires));
    });

    fastify.decorate('endSession', async (request: FastifyRequest, reply: FastifyReply) => {
      const token = request.cookies[SESSION_COOKIE];
      if (token) await sql`DELETE FROM sessions WHERE id = ${hashToken(token)}`;
      clearSessionCookie(reply);
    });
  },
  { name: 'auth', dependencies: ['db', 'migrations', 'sensible'] },
);

/** The database only ever sees this hash, never the token in the cookie. */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
