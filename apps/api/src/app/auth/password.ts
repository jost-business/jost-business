import { argon2, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const argon2Async = promisify(argon2);

// OWASP's recommended minimum for Argon2id: 19 MiB memory, 2 passes, 1 lane
const PARAMS = { memory: 19_456, passes: 2, parallelism: 1, tagLength: 32 } as const;

/** Hashes a password with Argon2id (built into Node) into a self-describing PHC string. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await argon2Async('argon2id', { message: password, nonce: salt, ...PARAMS });
  const { memory, passes, parallelism } = PARAMS;
  return `$argon2id$v=19$m=${memory},t=${passes},p=${parallelism}$${b64(salt)}$${b64(hash)}`;
}

/**
 * Checks a password against a stored PHC string. The parameters come from the
 * string, so hashes made with older settings keep working after a change.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const match = /^\$argon2id\$v=19\$m=(\d+),t=(\d+),p=(\d+)\$([^$]+)\$([^$]+)$/.exec(stored);
  if (!match) return false;
  const [, memory, passes, parallelism, salt, hash] = match;
  const expected = Buffer.from(hash, 'base64');
  const actual = await argon2Async('argon2id', {
    message: password,
    nonce: Buffer.from(salt, 'base64'),
    memory: Number(memory),
    passes: Number(passes),
    parallelism: Number(parallelism),
    tagLength: expected.length,
  });
  // Constant-time comparison, so the response time does not leak how much matched
  return timingSafeEqual(actual, expected);
}

/**
 * A valid hash of a random password. Checking against it when an e-mail is
 * unknown makes that answer take as long as a wrong password, so response
 * times do not reveal which accounts exist.
 */
export const DUMMY_HASH = hashPassword(randomBytes(32).toString('hex'));

function b64(buffer: Buffer): string {
  return buffer.toString('base64').replace(/=+$/, '');
}
