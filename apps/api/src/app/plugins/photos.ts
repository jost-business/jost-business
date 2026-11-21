import { mkdir } from 'node:fs/promises';
import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { PHOTOS_DIR } from '../photos/photos';

/** Phone photos are a few MB; this leaves room without inviting abuse. */
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

/**
 * Uploads (multipart, one photo per request) and serving the photos at
 * /photos/<trip>/<name>. A photo's name never changes and a new photo gets a
 * new name, so browsers may cache them for good.
 */
export default fp(
  async function (fastify: FastifyInstance) {
    await mkdir(PHOTOS_DIR, { recursive: true });

    await fastify.register(multipart, {
      limits: { fileSize: MAX_UPLOAD_BYTES, files: 1, fields: 0 },
    });

    await fastify.register(fastifyStatic, {
      root: PHOTOS_DIR,
      prefix: '/photos/',
      decorateReply: false,
      index: false,
      list: false,
      dotfiles: 'deny',
      immutable: true,
      maxAge: '365d',
    });
  },
  { name: 'photos' },
);
