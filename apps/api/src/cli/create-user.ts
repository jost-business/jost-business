/**
 * Creates an account, or sets a new password if the e-mail already exists.
 * There is no sign-up page; this is the only way to get a login.
 *
 *   docker compose exec api node apps/api/src/cli/create-user.js you@example.com "Your Name"
 *
 * The password is asked for interactively and never echoed, so it does not
 * end up in the shell history. The API must have started once, so the
 * migrations have created the tables.
 */
import postgres from 'postgres';
import { hashPassword } from '../app/auth/password';

async function main(): Promise<void> {
  const [email, name] = process.argv.slice(2);
  if (!email?.includes('@') || !name) {
    console.error('Usage: create-user <email> <name>');
    process.exit(1);
  }
  const url = process.env['DATABASE_URL'];
  if (!url) throw new Error('DATABASE_URL is not set');

  const password = await askHidden('Password: ');
  if (password.length < 9) throw new Error('Use at least 9 characters');
  if ((await askHidden('Repeat password: ')) !== password) throw new Error('The passwords do not match');

  const sql = postgres(url);
  try {
    const [user] = await sql<{ id: string; created: boolean }[]>`
      INSERT INTO users (email, name, password_hash)
      VALUES (${email.trim().toLowerCase()}, ${name}, ${await hashPassword(password)})
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash
      RETURNING id, (xmax = 0) AS created
    `;
    // A new password logs out every existing session of that account
    if (!user.created) await sql`DELETE FROM sessions WHERE user_id = ${user.id}`;
    console.log(user.created ? `Created ${email}` : `Updated ${email} and ended its sessions`);
  } finally {
    await sql.end();
  }
}

/** Reads a line from the terminal without showing what is typed. */
function askHidden(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const { stdin, stdout } = process;
    if (!stdin.isTTY) return reject(new Error('Run this in an interactive terminal (docker compose exec -it ...)'));
    stdout.write(prompt);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    let input = '';
    const onData = (char: string) => {
      if (char === '\r' || char === '\n') {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.off('data', onData);
        stdout.write('\n');
        resolve(input);
      } else if (char === '\u0003') {
        process.exit(130); // Ctrl+C
      } else if (char === '\u007f' || char === '\b') {
        input = input.slice(0, -1);
      } else {
        input += char;
      }
    };
    stdin.on('data', onData);
  });
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
