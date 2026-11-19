import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

// The build copies them next to the entry file (see the api project's assets).
// Resolved from the entry, not from this file, because the build keeps the
// workspace folder structure and nests this file several levels deep.
const MIGRATIONS_DIR = join(dirname(require.main?.filename ?? process.argv[1]), 'migrations');

// Any constant works; it only has to be the same for every API instance
const MIGRATION_LOCK = 72_616_001;

/**
 * Applies every migrations/NNN_name.sql that has not run yet, in file name
 * order, each in its own transaction. Runs before the API accepts requests.
 */
export default fp(
  async function (fastify: FastifyInstance) {
    const { sql } = fastify;

    await sql`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name       TEXT        PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;

    const files = (await readdir(MIGRATIONS_DIR)).filter(file => file.endsWith('.sql')).sort();

    for (const file of files) {
      await sql.begin(async tx => {
        // Serializes concurrent starts; the check below then sees the other instance's work
        await tx`SELECT pg_advisory_xact_lock(${MIGRATION_LOCK})`;
        const [done] = await tx`SELECT 1 FROM schema_migrations WHERE name = ${file}`;
        if (done) return;

        await tx.unsafe(await readFile(join(MIGRATIONS_DIR, file), 'utf8'));
        await tx`INSERT INTO schema_migrations (name) VALUES (${file})`;
        fastify.log.info({ migration: file }, 'applied migration');
      });
    }
  },
  { name: 'migrations', dependencies: ['db'] },
);
