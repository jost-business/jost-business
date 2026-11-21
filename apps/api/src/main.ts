import Fastify from 'fastify';
import { app } from './app/app';

const host = process.env.HOST ?? '0.0.0.0';
const port = process.env.PORT ? Number(process.env.PORT) : 3005;

// Instantiate Fastify with some config
const server = Fastify({
  logger: true,
  // nginx in front sets X-Forwarded-For; trust it only from loopback and private
  // networks (the Docker bridge), so a client calling port 3005 directly cannot
  // fake its IP and slip past the login rate limit
  trustProxy: 'loopback,uniquelocal',
});

// Register your application as a normal plugin.
server.register(app);

// Start listening.
server.listen({ port, host }, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  } else {
    console.log(`[ ready ] http://${host}:${port}`);
  }
});
